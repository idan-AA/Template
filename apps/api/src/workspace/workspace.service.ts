import {
	createPasswordUser,
	EmailTakenError,
	setPassword,
} from "@app/auth/credentials";
import {
	canChangeRole,
	canRenameWorkspace,
	enrolInWorkspace,
	ensureWorkspaceMembership,
	isWorkspaceRole,
	WORKSPACE_ID,
	workspaceRoleOf,
} from "@app/auth/organization";
import { passwordProblem } from "@app/auth/password-policy";
import type { Db, Prisma } from "@app/db";
import { writeAudit } from "@app/db/audit";
import { isOnboarded, markOnboarded, workspaceSlug } from "@app/db/workspace";
import { roleOptions } from "@app/modules";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
	ServiceUnavailableException,
} from "@nestjs/common";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { normalizeDomain } from "../companies/domain";
import { InjectDatabase } from "../database/database.constants";
import { getRequestContext } from "../logging/request-context";
import {
	countsByKey,
	type ListResult,
	type OrderByColumns,
	paginate,
	resolveOrderBy,
} from "../trpc/list-input";
import type {
	AddMemberInput,
	MemberListInput,
	ResetMemberPasswordInput,
	SetMemberRoleInput,
	UpdateWorkspaceInput,
	Workspace,
	WorkspaceMember,
} from "./workspace.contracts";

const MEMBER_SELECT = {
	id: true,
	role: true,
	createdAt: true,
	userId: true,
	user: { select: { name: true, email: true, image: true } },
} as const;

type MemberRow = Prisma.MemberGetPayload<{ select: typeof MEMBER_SELECT }>;

const SORTABLE: OrderByColumns<Prisma.MemberOrderByWithRelationInput> = {
	name: (dir) => ({ user: { name: dir } }),
	email: (dir) => ({ user: { email: dir } }),
	role: (dir) => ({ role: dir }),
	joinedAt: (dir) => ({ createdAt: dir }),
};

@Injectable()
export class WorkspaceService {
	private readonly logger = new Logger(WorkspaceService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly agent: AgentTriggerService,
	) {}

	async get(userId: string): Promise<Workspace> {
		let row = await this.readWorkspace();

		if (!row) {
			await ensureWorkspaceMembership(userId);
			row = await this.readWorkspace();
		}

		if (!row) {
			throw new ServiceUnavailableException(
				"The workspace could not be read. Sign in again in a moment.",
			);
		}

		const role = await workspaceRoleOf(userId);

		return {
			id: row.id,
			slug: row.slug,
			name: row.name,
			website: row.website,
			onboarded: isOnboarded(row.metadata),
			viewerRole: role,
			canRename: canRenameWorkspace(role),
			canChangeRoles: canChangeRole(role),
			roles: roleOptions(),
		};
	}

	async update(
		userId: string,
		input: UpdateWorkspaceInput,
	): Promise<Workspace> {
		const role = await workspaceRoleOf(userId);

		if (!canRenameWorkspace(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can change the workspace.",
			);
		}

		const before = await this.db.organization.findUnique({
			where: { id: WORKSPACE_ID },
			select: { website: true, metadata: true },
		});

		// The website is optional: a business may have none. It only feeds CRM research.
		const wantsWebsite = input.website.trim() !== "";
		const website = wantsWebsite ? normalizeDomain(input.website) : null;

		if (wantsWebsite && !website) {
			throw new BadRequestException(
				"That is not a website. Enter the domain, like acme.com.",
			);
		}

		await this.db.organization.update({
			where: { id: WORKSPACE_ID },
			data: {
				name: input.name,
				slug: workspaceSlug(input.slug ?? input.name),
				website,
				metadata: markOnboarded(before?.metadata ?? null, new Date()),
			},
		});

		this.logger.log({ message: "Workspace updated", userId });

		if (website && website !== before?.website) {
			await this.agent.workspaceChanged(
				website,
				before?.website
					? "The company using this CRM changed its website"
					: "The company using this CRM said what its website is",
			);
		}

		return this.get(userId);
	}

	async members(
		userId: string,
		input: MemberListInput,
	): Promise<ListResult<WorkspaceMember>> {
		const where = this.buildWhere(input);
		const { skip, take } = paginate(input);

		const [rows, total, roles] = await Promise.all([
			this.db.member.findMany({
				where,
				skip,
				take,
				select: MEMBER_SELECT,
				orderBy: resolveOrderBy(input, SORTABLE, { createdAt: "asc" }),
			}),
			this.db.member.count({ where }),
			this.db.member.groupBy({
				by: ["role"],
				where: this.searchWhere(input.q),
				_count: { _all: true },
			}),
		]);

		return {
			rows: rows.map((row) => this.toMember(row, userId)),
			total,
			facetCounts: { role: countsByKey(roles, "role") },
		};
	}

	async setMemberRole(
		userId: string,
		input: SetMemberRoleInput,
	): Promise<WorkspaceMember> {
		const role = await workspaceRoleOf(userId);

		if (!canChangeRole(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can change a member's role.",
			);
		}

		// The router checks this too; the service is the one that enforces it.
		if (!isWorkspaceRole(input.role)) {
			throw new BadRequestException(
				`"${input.role}" is not a role this workspace uses.`,
			);
		}

		const updated = await this.db.$transaction(async (tx) => {
			const target = await tx.member.findFirst({
				where: { id: input.memberId, organizationId: WORKSPACE_ID },
				select: { id: true, role: true },
			});

			if (!target) {
				throw new NotFoundException("That person is not in this workspace.");
			}

			if (target.role === "owner" && input.role !== "owner") {
				const owners = await tx.$queryRaw<{ id: string }[]>`
					SELECT id FROM "member"
					WHERE "organizationId" = ${WORKSPACE_ID} AND role = 'owner'
					FOR UPDATE
				`;

				if (owners.length <= 1) {
					throw new ForbiddenException(
						"The workspace needs an owner. Make someone else an owner first.",
					);
				}
			}

			const changed = await tx.member.update({
				where: { id: target.id },
				data: { role: input.role },
				select: MEMBER_SELECT,
			});

			const actor = await tx.user.findUnique({
				where: { id: userId },
				select: { name: true, email: true },
			});

			await writeAudit(tx, {
				module: "core",
				actorType: "USER",
				actorId: userId,
				actorLabel: actor ? `${actor.name} <${actor.email}>` : null,
				action: "MEMBER_ROLE_CHANGED",
				entityType: "member",
				entityId: target.id,
				summary: `${changed.user.name} changed from ${target.role} to ${input.role}`,
				before: { role: target.role },
				after: { role: input.role },
				requestId: getRequestContext()?.requestId ?? null,
			});

			return changed;
		});

		this.logger.log({
			message: "Workspace role changed",
			userId,
			memberId: updated.id,
			role: input.role,
		});

		return this.toMember(updated, userId);
	}

	/**
	 * An owner or admin adds a person with a first password they choose and pass
	 * on. The person must replace it at their first sign-in. Nothing is emailed.
	 */
	async addMember(
		userId: string,
		input: AddMemberInput,
	): Promise<WorkspaceMember> {
		const actorRole = await workspaceRoleOf(userId);

		if (!canChangeRole(actorRole)) {
			throw new ForbiddenException(
				"Only an owner or an admin can add a member.",
			);
		}

		if (!isWorkspaceRole(input.role)) {
			throw new BadRequestException(
				`"${input.role}" is not a role this workspace uses.`,
			);
		}

		if (input.role === "owner" && actorRole !== "owner") {
			throw new ForbiddenException("Only an owner can add another owner.");
		}

		const problem = passwordProblem(input.password);
		if (problem) throw new BadRequestException(problem);

		const created = await this.db
			.$transaction(async (tx) => {
				const user = await createPasswordUser(tx, {
					name: input.name,
					email: input.email,
					password: input.password,
					passwordChangeRequired: true,
				});

				await enrolInWorkspace(tx, user.id, input.role);

				const member = await tx.member.findUniqueOrThrow({
					where: {
						organizationId_userId: {
							organizationId: WORKSPACE_ID,
							userId: user.id,
						},
					},
					select: MEMBER_SELECT,
				});

				const actor = await tx.user.findUnique({
					where: { id: userId },
					select: { name: true, email: true },
				});

				await writeAudit(tx, {
					module: "core",
					actorType: "USER",
					actorId: userId,
					actorLabel: actor ? `${actor.name} <${actor.email}>` : null,
					action: "MEMBER_CREATED",
					entityType: "member",
					entityId: member.id,
					summary: `${user.email} added as ${input.role}`,
					after: { email: user.email, role: input.role },
					requestId: getRequestContext()?.requestId ?? null,
				});

				return member;
			})
			.catch((error) => {
				if (error instanceof EmailTakenError) {
					throw new ConflictException(
						"Someone with that email address already has an account here.",
					);
				}
				throw error;
			});

		this.logger.log({
			message: "Workspace member added",
			userId,
			memberId: created.id,
			role: input.role,
		});

		return this.toMember(created, userId);
	}

	/**
	 * Sets a temporary password for a member and signs them out everywhere. They
	 * must choose their own at the next sign-in.
	 */
	async resetMemberPassword(
		userId: string,
		input: ResetMemberPasswordInput,
	): Promise<{ ok: true }> {
		const actorRole = await workspaceRoleOf(userId);

		if (!canChangeRole(actorRole)) {
			throw new ForbiddenException(
				"Only an owner or an admin can reset a password.",
			);
		}

		const problem = passwordProblem(input.password);
		if (problem) throw new BadRequestException(problem);

		await this.db.$transaction(async (tx) => {
			const target = await tx.member.findFirst({
				where: { id: input.memberId, organizationId: WORKSPACE_ID },
				select: {
					id: true,
					role: true,
					userId: true,
					user: { select: { email: true } },
				},
			});

			if (!target) {
				throw new NotFoundException("That person is not in this workspace.");
			}

			if (target.userId === userId) {
				throw new BadRequestException(
					"Change your own password from Settings, Account.",
				);
			}

			if (target.role === "owner" && actorRole !== "owner") {
				throw new ForbiddenException(
					"Only an owner can reset an owner password.",
				);
			}

			await setPassword(tx, target.userId, input.password, {
				passwordChangeRequired: true,
			});

			await tx.session.deleteMany({ where: { userId: target.userId } });

			const actor = await tx.user.findUnique({
				where: { id: userId },
				select: { name: true, email: true },
			});

			await writeAudit(tx, {
				module: "core",
				actorType: "USER",
				actorId: userId,
				actorLabel: actor ? `${actor.name} <${actor.email}>` : null,
				action: "PASSWORD_RESET_BY_ADMIN",
				entityType: "user",
				entityId: target.userId,
				summary: `Password reset for ${target.user.email}`,
				requestId: getRequestContext()?.requestId ?? null,
			});
		});

		this.logger.log({
			message: "Member password reset by an admin",
			userId,
			memberId: input.memberId,
		});

		return { ok: true };
	}

	private toMember(row: MemberRow, userId: string): WorkspaceMember {
		return {
			id: row.id,
			userId: row.userId,
			name: row.user.name,
			email: row.user.email,
			image: row.user.image,
			role: row.role,
			joinedAt: row.createdAt.toISOString(),
			isViewer: row.userId === userId,
		};
	}

	private searchWhere(q: string): Prisma.MemberWhereInput {
		const term = q.trim();
		const where: Prisma.MemberWhereInput = { organizationId: WORKSPACE_ID };

		if (term) {
			where.user = {
				OR: [
					{ name: { contains: term, mode: "insensitive" } },
					{ email: { contains: term, mode: "insensitive" } },
				],
			};
		}

		return where;
	}

	private buildWhere(input: MemberListInput): Prisma.MemberWhereInput {
		const where = this.searchWhere(input.q);

		if (input.role.length > 0) {
			where.role = { in: input.role };
		}

		return where;
	}

	private async readWorkspace() {
		return this.db.organization.findUnique({
			where: { id: WORKSPACE_ID },
			select: {
				id: true,
				slug: true,
				name: true,
				website: true,
				metadata: true,
			},
		});
	}
}
