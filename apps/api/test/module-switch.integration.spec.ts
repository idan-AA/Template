import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@app/db";
import { SETTINGS_ID } from "@app/db/settings";
import { WORKSPACE_ID } from "@app/db/workspace";
import { isModuleEnabled } from "@app/modules";
import { isDeveloper, resetDeveloperCache } from "@app/modules/developer";
import { resetModules, useModules } from "@app/modules/testing";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from "@nestjs/common";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ModulesService } from "../src/modules/modules.service";
import { WorkspaceService } from "../src/workspace/workspace.service";

/**
 * The developer account and the module switches, against the real database.
 * Everyone else (an owner, an admin) is the opposite case: they must not be
 * able to read the Features data, switch anything, or touch the developer.
 */

const RUN = `mods-${Date.now().toString(36)}`;
const DEV = { id: `${RUN}-dev`, email: `${RUN}-dev@modules.test`, name: "Dev" };
const OWNER = {
	id: `${RUN}-owner`,
	email: `${RUN}-owner@modules.test`,
	name: "Owner",
};
const ADMIN = {
	id: `${RUN}-admin`,
	email: `${RUN}-admin@modules.test`,
	name: "Admin",
};

const modules = new ModulesService(db);
const workspace = new WorkspaceService(db, {} as AgentTriggerService);

async function clearSwitches(): Promise<void> {
	await db.moduleSwitch.deleteMany();
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID },
		update: { developerUserId: null },
	});
	resetDeveloperCache();
}

beforeAll(async () => {
	const at = new Date();

	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: at },
		update: {},
	});

	for (const person of [DEV, OWNER, ADMIN]) {
		await db.user.create({
			data: {
				id: person.id,
				name: person.name,
				email: person.email,
				emailVerified: true,
				updatedAt: at,
			},
		});
	}

	await db.member.createMany({
		data: [
			{
				id: `${DEV.id}-m`,
				organizationId: WORKSPACE_ID,
				userId: DEV.id,
				role: "owner",
				createdAt: at,
			},
			{
				id: `${OWNER.id}-m`,
				organizationId: WORKSPACE_ID,
				userId: OWNER.id,
				role: "owner",
				createdAt: at,
			},
			{
				id: `${ADMIN.id}-m`,
				organizationId: WORKSPACE_ID,
				userId: ADMIN.id,
				role: "admin",
				createdAt: at,
			},
		],
	});

	modules.onModuleInit();
});

afterEach(async () => {
	delete process.env.DEVELOPER_EMAIL;
	delete process.env.ENABLED_MODULES;
	resetModules();
	await clearSwitches();
});

afterAll(async () => {
	await clearSwitches();
	await db.user.deleteMany({
		where: { id: { in: [DEV.id, OWNER.id, ADMIN.id] } },
	});
});

function withDeveloper(): void {
	process.env.DEVELOPER_EMAIL = DEV.email;
	useModules(["crm"]);
	modules.onModuleInit();
}

describe("who is the developer", () => {
	it("is nobody when DEVELOPER_EMAIL is not set", async () => {
		useModules(["crm"]);

		expect(await isDeveloper(db, DEV)).toBe(false);
	});

	it("pins the account to the person who signs in first, and audits it", async () => {
		withDeveloper();

		expect(await isDeveloper(db, DEV)).toBe(true);

		const pin = await db.appSetting.findUniqueOrThrow({
			where: { id: SETTINGS_ID },
			select: { developerUserId: true },
		});
		expect(pin.developerUserId).toBe(DEV.id);

		const audit = await db.auditEvent.findFirst({
			where: { action: "DEVELOPER_PINNED", entityId: DEV.id },
		});
		expect(audit).not.toBeNull();
	});

	it("stops being the developer when the address is changed to someone else", async () => {
		withDeveloper();
		await isDeveloper(db, DEV);

		process.env.DEVELOPER_EMAIL = OWNER.email;
		resetDeveloperCache();

		// The address now names the owner, but the pin is still the old developer.
		expect(await isDeveloper(db, OWNER)).toBe(false);
		expect(await isDeveloper(db, DEV)).toBe(false);
	});
});

describe("switching modules", () => {
	it("lets the developer switch the CRM off and on, and audits each change", async () => {
		withDeveloper();
		expect(isModuleEnabled("crm")).toBe(true);

		const off = await modules.set(DEV, { moduleId: "crm", enabled: false });
		expect(off.modules.find((row) => row.id === "crm")).toMatchObject({
			enabled: false,
			source: "switch",
			startingEnabled: true,
		});
		expect(isModuleEnabled("crm")).toBe(false);

		const on = await modules.set(DEV, { moduleId: "crm", enabled: true });
		expect(on.modules.find((row) => row.id === "crm")?.enabled).toBe(true);
		expect(isModuleEnabled("crm")).toBe(true);

		const trail = await db.auditEvent.findMany({
			where: { action: "MODULE_SWITCHED", entityId: "crm", actorId: DEV.id },
			orderBy: { at: "asc" },
		});
		expect(trail.map((event) => event.after)).toEqual([
			{ enabled: false },
			{ enabled: true },
		]);
	});

	it("refuses an owner who is not the developer, for reading and for writing", async () => {
		withDeveloper();

		await expect(modules.list(OWNER)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
		await expect(
			modules.set(OWNER, { moduleId: "crm", enabled: false }),
		).rejects.toBeInstanceOf(ForbiddenException);

		// And nothing changed.
		expect(await db.moduleSwitch.count()).toBe(0);
		expect(isModuleEnabled("crm")).toBe(true);
	});

	it("refuses an admin the same way", async () => {
		withDeveloper();

		await expect(
			modules.set(ADMIN, { moduleId: "crm", enabled: false }),
		).rejects.toBeInstanceOf(ForbiddenException);
	});

	it("tells every signed-in person what is on, and only the developer that they are the developer", async () => {
		withDeveloper();

		const asDeveloper = await modules.state(DEV);
		const asOwner = await modules.state(OWNER);

		expect(asDeveloper.enabled).toEqual(["crm"]);
		expect(asDeveloper.isDeveloper).toBe(true);
		expect(asOwner.enabled).toEqual(["crm"]);
		expect(asOwner.isDeveloper).toBe(false);
	});

	it("refuses a module this product does not have", async () => {
		withDeveloper();

		await expect(
			modules.set(DEV, { moduleId: "salon", enabled: true }),
		).rejects.toBeInstanceOf(BadRequestException);
	});

	it("will not switch while ENABLED_MODULES fixes the set", async () => {
		withDeveloper();
		process.env.ENABLED_MODULES = "crm";

		await expect(
			modules.set(DEV, { moduleId: "crm", enabled: false }),
		).rejects.toThrow(/ENABLED_MODULES/);
	});
});

describe("protecting the developer account", () => {
	async function membersOf(): Promise<string> {
		const row = await db.member.findFirstOrThrow({
			where: { organizationId: WORKSPACE_ID, userId: DEV.id },
			select: { id: true },
		});
		return row.id;
	}

	it("does not let an admin demote the developer", async () => {
		withDeveloper();
		await isDeveloper(db, DEV);

		await expect(
			workspace.setMemberRole(ADMIN.id, {
				memberId: await membersOf(),
				role: "member",
			}),
		).rejects.toBeInstanceOf(ForbiddenException);

		const stored = await db.member.findFirstOrThrow({
			where: { userId: DEV.id },
			select: { role: true },
		});
		expect(stored.role).toBe("owner");
	});

	it("does not let an owner reset the developer's password", async () => {
		withDeveloper();
		await isDeveloper(db, DEV);

		await expect(
			workspace.resetMemberPassword(OWNER.id, {
				memberId: await membersOf(),
				password: "a long enough passphrase",
			}),
		).rejects.toBeInstanceOf(ForbiddenException);
	});

	it("does not let anyone add the developer's address as a new member", async () => {
		withDeveloper();

		await expect(
			workspace.addMember(OWNER.id, {
				name: "Look Alike",
				email: DEV.email.toUpperCase(),
				role: "member",
				password: "a long enough passphrase",
			}),
		).rejects.toBeInstanceOf(BadRequestException);
	});

	it("shows the developer as locked in the member list", async () => {
		withDeveloper();
		await isDeveloper(db, DEV);

		const { rows } = await workspace.members(OWNER.id, {
			q: "",
			sort: "",
			dir: "asc",
			page: 1,
			pageSize: 100,
			role: [],
		});

		expect(rows.find((row) => row.userId === DEV.id)?.isDeveloper).toBe(true);
		expect(rows.find((row) => row.userId === OWNER.id)?.isDeveloper).toBe(
			false,
		);
	});

	it("still lets an admin change an ordinary member", async () => {
		withDeveloper();

		const owner = await db.member.findFirstOrThrow({
			where: { userId: OWNER.id },
			select: { id: true },
		});

		await expect(
			workspace.setMemberRole(ADMIN.id, { memberId: owner.id, role: "admin" }),
		).resolves.toMatchObject({ role: "admin" });

		await db.member.update({ where: { id: owner.id }, data: { role: "owner" } });
	});
});

describe("a member that is not there", () => {
	it("still answers not found rather than leaking the developer rule", async () => {
		withDeveloper();

		await expect(
			workspace.setMemberRole(ADMIN.id, { memberId: "nope", role: "member" }),
		).rejects.toBeInstanceOf(NotFoundException);
	});
});

describe("modules that cannot be on together (Books and QuickBooks)", () => {
	function withBooksOn(): void {
		process.env.DEVELOPER_EMAIL = DEV.email;
		useModules(["crm", "bookkeeping"]);
		modules.onModuleInit();
	}

	it("refuses QuickBooks while Books is on, and says what to do", async () => {
		withBooksOn();

		const attempt = modules.set(DEV, { moduleId: "quickbooks", enabled: true });

		await expect(attempt).rejects.toBeInstanceOf(ConflictException);
		await expect(attempt).rejects.toThrow("Switch Books off first");
		expect(await db.moduleSwitch.count()).toBe(0);
		expect(isModuleEnabled("quickbooks")).toBe(false);
	});

	it("refuses Books while QuickBooks is on", async () => {
		process.env.DEVELOPER_EMAIL = DEV.email;
		useModules(["crm", "quickbooks"]);
		modules.onModuleInit();

		await expect(
			modules.set(DEV, { moduleId: "bookkeeping", enabled: true }),
		).rejects.toThrow("Switch QuickBooks off first");
	});

	it("lets Books go off, then QuickBooks on, and Books back later once QuickBooks is off", async () => {
		withBooksOn();

		await modules.set(DEV, { moduleId: "bookkeeping", enabled: false });
		const on = await modules.set(DEV, { moduleId: "quickbooks", enabled: true });
		expect(on.modules.find((row) => row.id === "quickbooks")?.enabled).toBe(true);
		expect(isModuleEnabled("bookkeeping")).toBe(false);

		await modules.set(DEV, { moduleId: "quickbooks", enabled: false });
		await modules.set(DEV, { moduleId: "bookkeeping", enabled: true });
		expect(isModuleEnabled("bookkeeping")).toBe(true);
	});

	it("tells the Features page which modules conflict", async () => {
		withBooksOn();

		const list = await modules.list(DEV);

		expect(list.modules.find((row) => row.id === "quickbooks")).toMatchObject({
			conflicts: ["bookkeeping"],
			requires: ["crm"],
		});
		expect(list.modules.find((row) => row.id === "bookkeeping")?.conflicts).toEqual([
			"quickbooks",
		]);
	});
});
