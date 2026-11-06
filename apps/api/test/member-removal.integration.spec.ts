import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@app/db";
import { SETTINGS_ID } from "@app/db/settings";
import { WORKSPACE_ID } from "@app/db/workspace";
import { resetDeveloperCache } from "@app/modules/developer";
import {
	BadRequestException,
	ForbiddenException,
	NotFoundException,
} from "@nestjs/common";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { UsersService } from "../src/users/users.service";
import { WorkspaceService } from "../src/workspace/workspace.service";

/**
 * Removing a member takes their access away and keeps their history: the
 * account stays, the membership, sessions and API keys go, and they can be
 * added back.
 */

const RUN = `rm-${Date.now().toString(36)}`;
const person = (name: string) => ({
	id: `${RUN}-${name}`,
	email: `${RUN}-${name}@removal.test`,
	name,
});

const OWNER = person("owner");
const OTHER_OWNER = person("owner2");
const ADMIN = person("admin");
const MEMBER = person("member");
const DEV = person("dev");
const ALL = [OWNER, OTHER_OWNER, ADMIN, MEMBER, DEV];

const service = new WorkspaceService(db, {} as AgentTriggerService);
const memberId = (who: { id: string }) => `${who.id}-m`;

beforeAll(async () => {
	const at = new Date();

	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: at },
		update: {},
	});

	for (const who of ALL) {
		await db.user.create({
			data: {
				id: who.id,
				name: who.name,
				email: who.email,
				emailVerified: true,
				updatedAt: at,
			},
		});
	}

	await db.member.createMany({
		data: [
			[OWNER, "owner"],
			[OTHER_OWNER, "owner"],
			[ADMIN, "admin"],
			[MEMBER, "member"],
			[DEV, "owner"],
		].map(([who, role]) => ({
			id: memberId(who as { id: string }),
			organizationId: WORKSPACE_ID,
			userId: (who as { id: string }).id,
			role: role as string,
			createdAt: at,
		})),
	});
});

afterEach(async () => {
	delete process.env.DEVELOPER_EMAIL;
	resetDeveloperCache();
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID },
		update: { developerUserId: null },
	});
});

afterAll(async () => {
	await db.user.deleteMany({ where: { id: { in: ALL.map((who) => who.id) } } });
});

describe("removing a member", () => {
	it("takes access away, keeps the account, and audits it", async () => {
		await db.session.create({
			data: {
				id: `${RUN}-session`,
				token: `${RUN}-token`,
				userId: MEMBER.id,
				expiresAt: new Date(Date.now() + 3_600_000),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		await service.removeMember(ADMIN.id, { memberId: memberId(MEMBER) });

		expect(
			await db.member.findUnique({ where: { id: memberId(MEMBER) } }),
		).toBeNull();
		expect(await db.session.count({ where: { userId: MEMBER.id } })).toBe(0);

		const user = await db.user.findUniqueOrThrow({ where: { id: MEMBER.id } });
		expect(user.removedAt).not.toBeNull();

		const audit = await db.auditEvent.findFirst({
			where: { action: "MEMBER_REMOVED", entityId: memberId(MEMBER) },
		});
		expect(audit).not.toBeNull();

		// And they are no longer offered as an owner or assignee.
		const offered = await new UsersService(db).list();
		expect(offered.some((option) => option.id === MEMBER.id)).toBe(false);
	});

	it("restores the same account when they are added back", async () => {
		const before = await db.user.findUniqueOrThrow({ where: { id: MEMBER.id } });

		const restored = await service.addMember(ADMIN.id, {
			name: "Member Again",
			email: MEMBER.email.toUpperCase(),
			role: "member",
			password: "a long enough passphrase",
		});

		expect(restored.userId).toBe(MEMBER.id);

		const after = await db.user.findUniqueOrThrow({ where: { id: MEMBER.id } });
		expect(after.removedAt).toBeNull();
		expect(after.passwordChangeRequired).toBe(true);
		expect(after.createdAt).toEqual(before.createdAt);

		expect(
			await db.auditEvent.findFirst({
				where: { action: "MEMBER_RESTORED", entityId: restored.id },
			}),
		).not.toBeNull();
	});

	it("answers not found for someone who is not in the workspace", async () => {
		await expect(
			service.removeMember(ADMIN.id, { memberId: "nobody" }),
		).rejects.toBeInstanceOf(NotFoundException);
	});
});

describe("who may not be removed, or may not remove", () => {
	it("does not let a plain member remove anyone", async () => {
		await expect(
			service.removeMember(MEMBER.id, { memberId: memberId(ADMIN) }),
		).rejects.toBeInstanceOf(ForbiddenException);
	});

	it("does not let you remove yourself", async () => {
		await expect(
			service.removeMember(ADMIN.id, { memberId: memberId(ADMIN) }),
		).rejects.toBeInstanceOf(BadRequestException);
	});

	it("does not let an admin remove an owner", async () => {
		await expect(
			service.removeMember(ADMIN.id, { memberId: memberId(OTHER_OWNER) }),
		).rejects.toBeInstanceOf(ForbiddenException);

		expect(
			await db.member.findUnique({ where: { id: memberId(OTHER_OWNER) } }),
		).not.toBeNull();
	});

	it("does not let anyone, even an owner, remove the developer account", async () => {
		process.env.DEVELOPER_EMAIL = DEV.email;
		resetDeveloperCache();

		await expect(
			service.removeMember(OWNER.id, { memberId: memberId(DEV) }),
		).rejects.toBeInstanceOf(ForbiddenException);

		expect(
			await db.member.findUnique({ where: { id: memberId(DEV) } }),
		).not.toBeNull();
		expect(
			(await db.user.findUniqueOrThrow({ where: { id: DEV.id } })).removedAt,
		).toBeNull();
	});

	it("lets an owner remove another owner while one is left", async () => {
		await service.removeMember(OWNER.id, { memberId: memberId(OTHER_OWNER) });

		expect(
			await db.member.findUnique({ where: { id: memberId(OTHER_OWNER) } }),
		).toBeNull();
	});
});
