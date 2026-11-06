import { workspaceRoleOf } from "@app/auth/organization";
import type { Db } from "@app/db";
import { can } from "@app/modules";
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type {
	MiddlewareOptions,
	MiddlewareResponse,
	TRPCMiddleware,
} from "nestjs-trpc";
import { InjectDatabase } from "../database/database.constants";
import type { AuthedTrpcContext } from "../trpc/context.types";

/** The keys declared in packages/modules/quickbooks/meta.ts. */
export const QUICKBOOKS_KEYS = ["quickbooks.read", "quickbooks.connect"] as const;

export type QuickbooksKey = (typeof QUICKBOOKS_KEYS)[number];

const DENIED = "You do not have access to QuickBooks here.";

/**
 * Who may do what with QuickBooks. The service calls `assert` itself (the same rule
 * the other modules keep: the middleware refuses early and the service refuses
 * again, so a call from a job or a test cannot skip the check). The UI only hides.
 */
@Injectable()
export class QuickbooksAccess {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async has(userId: string, key: QuickbooksKey): Promise<boolean> {
		return can(await workspaceRoleOf(userId, this.db), key);
	}

	/** Throws 403 unless the person's role holds `key`. */
	async assert(userId: string, key: QuickbooksKey): Promise<void> {
		if (!(await this.has(userId, key))) throw new ForbiddenException(DENIED);
	}

	async assertAny(userId: string, keys: readonly QuickbooksKey[]): Promise<void> {
		const role = await workspaceRoleOf(userId, this.db);

		if (!keys.some((key) => can(role, key))) {
			throw new ForbiddenException(DENIED);
		}
	}
}

/** First gate on every QuickBooks procedure: a role that holds none of the keys is refused before any service runs. */
@Injectable()
export class QuickbooksAccessMiddleware implements TRPCMiddleware {
	constructor(@Inject(QuickbooksAccess) private readonly access: QuickbooksAccess) {}

	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as Partial<AuthedTrpcContext>;
		const userId = ctx.user?.id;

		if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

		try {
			await this.access.assertAny(userId, QUICKBOOKS_KEYS);
		} catch {
			throw new TRPCError({ code: "FORBIDDEN", message: DENIED });
		}

		return opts.next();
	}
}
