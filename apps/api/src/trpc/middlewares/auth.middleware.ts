import type { Db } from "@app/db";
import { isModuleEnabled } from "@app/modules";
import { isDeveloper } from "@app/modules/developer";
import { ALL_MODULES } from "@app/modules/registry";
import { ensureModuleState } from "@app/modules/state";
import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type {
	MiddlewareOptions,
	MiddlewareResponse,
	TRPCMiddleware,
} from "nestjs-trpc";
import { InjectDatabase } from "../../database/database.constants";
import { setRequestUserId } from "../../logging/request-context";
import { moduleOwningProcedure } from "../../modules/module-gate";
import type { AuthedTrpcContext, BaseTrpcContext } from "../context.types";

/**
 * What a person who must choose a new password may still call: find out that
 * they must, and do it. Everything else is refused until they have.
 */
const OPEN_UNTIL_PASSWORD_CHANGED = new Set([
	"account.state",
	"account.changePassword",
]);

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as BaseTrpcContext;
		const user = ctx.session?.user;

		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		setRequestUserId(user.id);

		await this.refuseSwitchedOffModule(opts.path, user);

		// Read fresh: the session cookie is cached for minutes, and both flags here
		// must take effect the moment they change (a removed person, a password
		// that must be replaced).
		const row = await this.db.user.findUnique({
			where: { id: user.id },
			select: { passwordChangeRequired: true, removedAt: true },
		});

		if (row?.removedAt) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Your access to this workspace was removed. Ask an owner or admin to add you back.",
			});
		}

		if (
			row?.passwordChangeRequired &&
			!OPEN_UNTIL_PASSWORD_CHANGED.has(opts.path)
		) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Choose a new password before you do anything else.",
			});
		}

		const nextCtx: AuthedTrpcContext = { ...ctx, user };
		return opts.next({ ctx: nextCtx });
	}

	/**
	 * A procedure that belongs to a module that is switched off answers "not
	 * found", as if it did not exist. The developer account is the one person who
	 * can still reach it (to test a module before a client gets it). The module
	 * services repeat the check for their own writes as they move behind their
	 * module (the CRM services have not yet).
	 */
	private async refuseSwitchedOffModule(
		path: string,
		user: { id: string; email: string },
	): Promise<void> {
		// Every signed-in call keeps this process's answer fresh (a read every few
		// seconds at most), because role lists and nav also depend on it.
		await ensureModuleState();

		const moduleId = moduleOwningProcedure(path);
		if (!moduleId) return;
		if (isModuleEnabled(moduleId)) return;
		if (await isDeveloper(this.db, user)) return;

		throw new TRPCError({
			code: "NOT_FOUND",
			message: `${ALL_MODULES[moduleId].label} is not switched on for this workspace.`,
		});
	}
}
