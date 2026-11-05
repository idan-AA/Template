import type { Db } from "@app/db";
import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type {
	MiddlewareOptions,
	MiddlewareResponse,
	TRPCMiddleware,
} from "nestjs-trpc";
import { InjectDatabase } from "../../database/database.constants";
import { setRequestUserId } from "../../logging/request-context";
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

		if (!OPEN_UNTIL_PASSWORD_CHANGED.has(opts.path)) {
			// Read fresh: the session cookie is cached for minutes, and this flag
			// must stop working the moment the password is changed.
			const row = await this.db.user.findUnique({
				where: { id: user.id },
				select: { passwordChangeRequired: true },
			});

			if (row?.passwordChangeRequired) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Choose a new password before you do anything else.",
				});
			}
		}

		const nextCtx: AuthedTrpcContext = { ...ctx, user };
		return opts.next({ ctx: nextCtx });
	}
}
