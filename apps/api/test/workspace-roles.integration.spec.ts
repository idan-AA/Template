import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { isWorkspaceRole, workspaceRoleOf } from "@app/auth/organization";
import { db } from "@app/db";
import { WORKSPACE_ID } from "@app/db/workspace";
import { can } from "@app/modules";
import { resetModules, useModules } from "@app/modules/testing";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { WorkspaceService } from "../src/workspace/workspace.service";

/**
 * One list of roles. A role stored on a member is never rewritten by reading it,
 * whether or not the module that added it is switched on.
 */

const RUN = `roles-${Date.now().toString(36)}`;
const ADMIN_USER = `${RUN}-admin`;
const TARGET_USER = `${RUN}-target`;
const ADMIN_MEMBER = `${RUN}-admin-member`;
const TARGET_MEMBER = `${RUN}-target-member`;

const service = new WorkspaceService(db, {} as AgentTriggerService);
const LIST = {
	q: "",
	sort: "",
	dir: "asc" as const,
	page: 1,
	pageSize: 100,
	role: [] as string[],
};

async function roleStored(): Promise<string | undefined> {
	return (
		await db.member.findUnique({
			where: { id: TARGET_MEMBER },
			select: { role: true },
		})
	)?.role;
}

async function roleListed(): Promise<string | undefined> {
	const { rows } = await service.members(ADMIN_USER, LIST);
	return rows.find((row) => row.id === TARGET_MEMBER)?.role;
}

beforeAll(async () => {
	const at = new Date();

	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: at },
		update: {},
	});

	for (const id of [ADMIN_USER, TARGET_USER]) {
		await db.user.create({
			data: {
				id,
				name: id,
				email: `${id}@roles.test`,
				emailVerified: true,
				updatedAt: at,
			},
		});
	}

	await db.member.createMany({
		data: [
			{
				id: ADMIN_MEMBER,
				organizationId: WORKSPACE_ID,
				userId: ADMIN_USER,
				role: "admin",
				createdAt: at,
			},
			{
				id: TARGET_MEMBER,
				organizationId: WORKSPACE_ID,
				userId: TARGET_USER,
				role: "member",
				createdAt: at,
			},
		],
	});
});

afterEach(async () => {
	resetModules();
	await db.member.update({
		where: { id: TARGET_MEMBER },
		data: { role: "member" },
	});
});

afterAll(async () => {
	await db.user.deleteMany({
		where: { id: { in: [ADMIN_USER, TARGET_USER] } },
	});
});

describe("a stored bookkeeper", () => {
	it("survives a read with bookkeeping enabled, and holds its permissions", async () => {
		useModules(["bookkeeping"]);
		await db.member.update({
			where: { id: TARGET_MEMBER },
			data: { role: "bookkeeper" },
		});

		expect(await workspaceRoleOf(TARGET_USER)).toBe("bookkeeper");
		expect(await roleListed()).toBe("bookkeeper");
		expect(can(await workspaceRoleOf(TARGET_USER), "bookkeeping.post")).toBe(
			true,
		);
	});

	it("is not demoted by a read with bookkeeping disabled; it just has no module permissions", async () => {
		useModules([]);
		await db.member.update({
			where: { id: TARGET_MEMBER },
			data: { role: "bookkeeper" },
		});

		expect(await workspaceRoleOf(TARGET_USER)).toBe("bookkeeper");
		expect(await roleListed()).toBe("bookkeeper");
		expect(await roleStored()).toBe("bookkeeper");
		expect(can(await workspaceRoleOf(TARGET_USER), "bookkeeping.post")).toBe(
			false,
		);
	});

	it("shows in the facet counts as what it is", async () => {
		useModules([]);
		await db.member.update({
			where: { id: TARGET_MEMBER },
			data: { role: "bookkeeper" },
		});

		const { facetCounts } = await service.members(ADMIN_USER, LIST);

		expect(facetCounts.role?.bookkeeper).toBe(1);
	});
});

describe("assigning a role", () => {
	it("accepts a module role while the module is on, and writes the audit trail in the same transaction", async () => {
		useModules(["bookkeeping"]);

		const changed = await service.setMemberRole(ADMIN_USER, {
			memberId: TARGET_MEMBER,
			role: "accountant",
		});

		expect(changed.role).toBe("accountant");
		expect(await roleStored()).toBe("accountant");

		const events = await db.auditEvent.findMany({
			where: { entityType: "member", entityId: TARGET_MEMBER },
		});

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			module: "core",
			actorType: "USER",
			actorId: ADMIN_USER,
			action: "MEMBER_ROLE_CHANGED",
			before: { role: "member" },
			after: { role: "accountant" },
		});
		expect(events[0]?.summary).toContain("from member to accountant");
	});

	it("refuses a module role while the module is off, and writes nothing", async () => {
		useModules([]);
		const before = await db.auditEvent.count({
			where: { entityId: TARGET_MEMBER },
		});

		await expect(
			service.setMemberRole(ADMIN_USER, {
				memberId: TARGET_MEMBER,
				role: "bookkeeper",
			}),
		).rejects.toBeInstanceOf(BadRequestException);

		expect(await roleStored()).toBe("member");
		expect(
			await db.auditEvent.count({ where: { entityId: TARGET_MEMBER } }),
		).toBe(before);
	});

	it("lists the roles the workspace offers, with names, for the picker", async () => {
		useModules(["bookkeeping"]);

		const workspace = await service.get(ADMIN_USER);

		expect(workspace.roles.map((role) => role.id)).toEqual([
			"owner",
			"admin",
			"member",
			"bookkeeper",
			"accountant",
		]);
		expect(isWorkspaceRole("accountant")).toBe(true);

		useModules([]);

		expect(
			(await service.get(ADMIN_USER)).roles.map((role) => role.id),
		).toEqual(["owner", "admin", "member"]);
		expect(isWorkspaceRole("accountant")).toBe(false);
	});
});

describe("a module role has no core powers", () => {
	const BOOKKEEPER_USER = `${RUN}-bookkeeper`;

	beforeAll(async () => {
		const at = new Date();

		await db.user.create({
			data: {
				id: BOOKKEEPER_USER,
				name: BOOKKEEPER_USER,
				email: `${BOOKKEEPER_USER}@roles.test`,
				emailVerified: true,
				updatedAt: at,
			},
		});
		await db.member.create({
			data: {
				id: `${BOOKKEEPER_USER}-member`,
				organizationId: WORKSPACE_ID,
				userId: BOOKKEEPER_USER,
				role: "bookkeeper",
				createdAt: at,
			},
		});
	});

	afterAll(async () => {
		await db.user.deleteMany({ where: { id: BOOKKEEPER_USER } });
	});

	it("cannot add a member, and nobody is created", async () => {
		useModules(["bookkeeping"]);
		const users = await db.user.count();

		await expect(
			service.addMember(BOOKKEEPER_USER, {
				name: "Sneaky",
				email: `sneaky-${RUN}@roles.test`,
				role: "member",
				password: "a long enough passphrase",
			}),
		).rejects.toBeInstanceOf(ForbiddenException);

		expect(await db.user.count()).toBe(users);
	});

	it("cannot reset anyone's password", async () => {
		useModules(["bookkeeping"]);

		await expect(
			service.resetMemberPassword(BOOKKEEPER_USER, {
				memberId: TARGET_MEMBER,
				password: "a long enough passphrase",
			}),
		).rejects.toBeInstanceOf(ForbiddenException);
	});
});
