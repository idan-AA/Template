import { type Db, db, type Prisma } from "@app/db";
import { WORKSPACE_ID, workspaceSlug } from "@app/db/workspace";
import { workspaceRoleIds } from "@app/modules";

export { WORKSPACE_ID };

export const DEFAULT_WORKSPACE_NAME = "CRM";

/** The roles every workspace has. Modules add more; see `workspaceRoles`. */
export type CoreRole = "owner" | "admin" | "member";

/**
 * A member's role. The three core roles, or the role an enabled module added
 * (bookkeeper, accountant, ...). It is a plain string in the database, and a
 * role this deploy does not know is kept as it is: never turned into `member`.
 * The `string & {}` keeps editor completion for the core roles.
 */
export type WorkspaceRole = CoreRole | (string & {});

/**
 * THE role list: core roles plus the enabled modules' roles. Everything that
 * accepts a role someone is ASSIGNING reads this one list.
 */
export function workspaceRoles(): string[] {
	return workspaceRoleIds();
}

export function isWorkspaceRole(value: string): boolean {
	return workspaceRoleIds().includes(value);
}

export function isWorkspaceAdmin(role: WorkspaceRole | null): boolean {
	return role === "owner" || role === "admin";
}

export function canRenameWorkspace(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canChangeRole(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canManageCurrency(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canManageConnections(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canManageTracking(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

/**
 * Makes sure the workspace row exists and `userId` is a member of it, inside the
 * caller's transaction. On an empty workspace the oldest user becomes the owner;
 * otherwise a new member gets `role` (default `member`). Safe to call twice.
 */
export async function enrolInWorkspace(
	tx: Prisma.TransactionClient,
	userId: string,
	role: string = "member",
): Promise<string> {
	const workspace = await tx.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: {
			id: WORKSPACE_ID,
			name: DEFAULT_WORKSPACE_NAME,
			slug: workspaceSlug(DEFAULT_WORKSPACE_NAME),
			createdAt: new Date(),
		},
		update: {},
		select: { id: true, name: true, slug: true },
	});

	const slug = workspaceSlug(workspace.name);

	if (workspace.slug !== slug) {
		await tx.organization.update({
			where: { id: workspace.id },
			data: { slug },
		});
	}

	const enrolled = await tx.member.count({
		where: { organizationId: workspace.id },
	});

	if (enrolled === 0) {
		const existing = await tx.user.findMany({
			select: { id: true },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		});

		await tx.member.createMany({
			data: existing.map((user, index) => ({
				id: crypto.randomUUID(),
				organizationId: workspace.id,
				userId: user.id,
				role: index === 0 ? "owner" : "member",
				createdAt: new Date(),
			})),
			skipDuplicates: true,
		});
	}

	await tx.member.upsert({
		where: {
			organizationId_userId: { organizationId: workspace.id, userId },
		},
		create: {
			id: crypto.randomUUID(),
			organizationId: workspace.id,
			userId,
			role,
			createdAt: new Date(),
		},
		update: {},
	});

	return workspace.id;
}

export async function ensureWorkspaceMembership(
	userId: string,
): Promise<string | undefined> {
	try {
		return await db.$transaction((tx) => enrolInWorkspace(tx, userId));
	} catch (error) {
		console.error(
			`[auth] could not enrol user ${userId} in workspace ${WORKSPACE_ID}; the next sign-in will retry`,
			error,
		);
		return undefined;
	}
}

export type WorkspaceMemberReader = Pick<Db, "member">;

export async function workspaceRoleOf(
	userId: string,
	client: WorkspaceMemberReader = db,
): Promise<WorkspaceRole | null> {
	const member = await client.member.findUnique({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		select: { role: true },
	});

	return member ? member.role : null;
}
