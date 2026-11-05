/**
 * Roles every deploy has. A module adds its own on top (see `defineModule`),
 * and the single list of roles a workspace accepts is these plus the enabled
 * modules' roles (`workspaceRoleIds` in `runtime.ts`).
 */
export const CORE_ROLES = ["owner", "admin", "member"] as const;

export type CoreRole = (typeof CORE_ROLES)[number];

export const CORE_ROLE_LABELS: Readonly<Record<CoreRole, string>> = {
	owner: "Owner",
	admin: "Admin",
	member: "Member",
};

export function isCoreRole(value: string): value is CoreRole {
	return (CORE_ROLES as readonly string[]).includes(value);
}
