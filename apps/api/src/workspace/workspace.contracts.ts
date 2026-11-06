import { MAX_SLUG } from "@app/db/workspace";
import { z } from "zod";
import {
	emailField,
	nameField,
	passwordField,
} from "../account/account.contracts";
import { listInput } from "../trpc/list-input";

export const memberListInput = listInput.extend({
	role: z.array(z.string()).default([]),
});

export type MemberListInput = z.infer<typeof memberListInput>;

export const updateWorkspaceInput = z.object({
	name: z.string().trim().min(1).max(120),
	/** Optional: empty means the business has no website. */
	website: z.string().trim().max(255),
	slug: z
		.string()
		.trim()
		.min(1)
		.max(MAX_SLUG)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.optional(),
});

// The roles this deploy accepts when someone is ASSIGNED a role: the core roles
// plus the enabled modules' roles. That list changes while the server runs (the
// developer account switches modules), so it cannot be fixed into the schema at
// boot: the service checks it with `isWorkspaceRole` on every write. Outputs
// below are plain strings, because a role already stored is shown as it is even
// if its module is off.
const assignableRole = z.string().trim().min(1).max(64);

export const setMemberRoleInput = z.object({
	memberId: z.string().min(1),
	role: assignableRole,
});

export const addMemberInput = z.object({
	name: nameField,
	email: emailField,
	role: assignableRole,
	/** The first password, chosen by whoever adds the member. They must replace it. */
	password: passwordField,
});

export const resetMemberPasswordInput = z.object({
	memberId: z.string().min(1),
	password: passwordField,
});

export const resetMemberPasswordOutput = z.object({ ok: z.literal(true) });

export type AddMemberInput = z.infer<typeof addMemberInput>;
export type ResetMemberPasswordInput = z.infer<typeof resetMemberPasswordInput>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceInput>;
export type SetMemberRoleInput = z.infer<typeof setMemberRoleInput>;

export const workspaceOutput = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	website: z.string().nullable(),
	onboarded: z.boolean(),
	viewerRole: z.string().nullable(),
	canRename: z.boolean(),
	canChangeRoles: z.boolean(),
	/** The roles that can be assigned here, with display names, for the role picker. */
	roles: z.array(z.object({ id: z.string(), label: z.string() })),
});

export type Workspace = z.infer<typeof workspaceOutput>;

export const workspaceMemberOutput = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
	role: z.string(),
	joinedAt: z.string(),
	isViewer: z.boolean(),
	/** The developer account: shown locked, and nobody here can change or remove it. */
	isDeveloper: z.boolean(),
});

export type WorkspaceMember = z.infer<typeof workspaceMemberOutput>;

export const memberListOutput = z.object({
	rows: z.array(workspaceMemberOutput),
	total: z.number(),
	facetCounts: z.record(z.string(), z.record(z.string(), z.number())),
});
