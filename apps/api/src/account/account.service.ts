import {
	checkPassword,
	createPasswordUser,
	hasPassword,
	setPassword,
} from "@app/auth/credentials";
import { enrolInWorkspace } from "@app/auth/organization";
import { passwordProblem } from "@app/auth/password-policy";
import type { Db } from "@app/db";
import { writeAudit } from "@app/db/audit";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
} from "@nestjs/common";
import type { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { getRequestContext } from "../logging/request-context";
import type { createOwnerInput } from "./account.contracts";
import { AttemptLimiter } from "./attempt-limiter";

/** Held for the length of the owner-creation transaction so two requests cannot both win. */
const OWNER_LOCK_KEY = 7_283_561;

@Injectable()
export class AccountService {
	private readonly logger = new Logger(AccountService.name);

	private readonly ownerAttempts = new AttemptLimiter(
		10,
		60_000,
		"Too many tries from this address. Wait a minute and try again.",
	);

	private readonly passwordAttempts = new AttemptLimiter(
		8,
		15 * 60_000,
		"Too many tries. Wait a few minutes and try again.",
	);

	constructor(@InjectDatabase() private readonly db: Db) {}

	/** True only while the user table is empty: the one moment anyone may create an owner. */
	async bootstrapStatus(): Promise<{ needsOwner: boolean }> {
		return { needsOwner: (await this.db.user.count()) === 0 };
	}

	async createOwner(
		input: z.infer<typeof createOwnerInput>,
		address: string,
	): Promise<{ ok: true }> {
		this.ownerAttempts.hit(address);

		const problem = passwordProblem(input.password);
		if (problem) throw new BadRequestException(problem);

		await this.db.$transaction(
			async (tx) => {
				// The check and the insert happen under one lock, in one transaction.
				await tx.$executeRaw`SELECT pg_advisory_xact_lock(${OWNER_LOCK_KEY})`;

				if ((await tx.user.count()) > 0) {
					throw new ForbiddenException(
						"This workspace already has an owner. Sign in instead.",
					);
				}

				const user = await createPasswordUser(tx, {
					name: input.name,
					email: input.email,
					password: input.password,
					passwordChangeRequired: false,
				});

				await enrolInWorkspace(tx, user.id);

				await writeAudit(tx, {
					module: "core",
					actorType: "USER",
					actorId: user.id,
					actorLabel: `${input.name.trim()} <${user.email}>`,
					action: "OWNER_ACCOUNT_CREATED",
					entityType: "user",
					entityId: user.id,
					summary: `Owner account created for ${user.email}`,
					requestId: getRequestContext()?.requestId ?? null,
				});
			},
			{ timeout: 15_000 },
		);

		this.logger.log({ message: "Owner account created on an empty workspace" });

		return { ok: true };
	}

	async state(
		userId: string,
	): Promise<{ passwordChangeRequired: boolean; hasPassword: boolean }> {
		const user = await this.db.user.findUnique({
			where: { id: userId },
			select: { passwordChangeRequired: true },
		});

		return {
			passwordChangeRequired: user?.passwordChangeRequired ?? false,
			hasPassword: await hasPassword(this.db, userId),
		};
	}

	async changePassword(
		userId: string,
		sessionId: string,
		input: { currentPassword?: string; newPassword: string },
	): Promise<{ ok: true }> {
		this.passwordAttempts.hit(userId);

		const problem = passwordProblem(input.newPassword);
		if (problem) throw new BadRequestException(problem);

		if (!(await hasPassword(this.db, userId))) {
			throw new ForbiddenException(
				"Your account signs in with Google, Microsoft or SSO and has no password. Ask an owner or admin to set one for you.",
			);
		}

		const forced = (await this.state(userId)).passwordChangeRequired;

		// Replacing a temporary password someone else chose needs no "current
		// password": the person typed it seconds ago to get in. Everyone else
		// proves who they are first.
		if (!forced) {
			if (
				!input.currentPassword ||
				!(await checkPassword(this.db, userId, input.currentPassword))
			) {
				throw new BadRequestException("That is not your current password.");
			}
		}

		const reused = forced
			? await checkPassword(this.db, userId, input.newPassword)
			: input.newPassword === input.currentPassword;

		if (reused) {
			throw new BadRequestException(
				"Choose a password you have not been using.",
			);
		}

		await this.db.$transaction(async (tx) => {
			await setPassword(tx, userId, input.newPassword, {
				passwordChangeRequired: false,
			});

			// Every other device signs in again with the new password.
			await tx.session.deleteMany({
				where: { userId, NOT: { id: sessionId } },
			});

			await writeAudit(tx, {
				module: "core",
				actorType: "USER",
				actorId: userId,
				action: "PASSWORD_CHANGED",
				entityType: "user",
				entityId: userId,
				summary: "Password changed by its owner",
				requestId: getRequestContext()?.requestId ?? null,
			});
		});

		return { ok: true };
	}
}
