import { workspaceRoleOf } from "@app/auth/organization";
import type { Db } from "@app/db";
import { can } from "@app/modules";
import type { Actor } from "@app/modules/bookkeeping/ledger/posting";
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type {
	MiddlewareOptions,
	MiddlewareResponse,
	TRPCMiddleware,
} from "nestjs-trpc";
import { InjectDatabase } from "../database/database.constants";
import type { AuthedTrpcContext } from "../trpc/context.types";

/** The eight keys of docs/plan/bookkeeping.md section 8, as declared in the module's meta.ts. */
export const BOOKKEEPING_KEYS = [
	"bookkeeping.read",
	"bookkeeping.write",
	"bookkeeping.post",
	"bookkeeping.bank",
	"bookkeeping.reports",
	"bookkeeping.settings",
	"bookkeeping.lock",
	"bookkeeping.reopen",
] as const;

export type BookkeepingKey = (typeof BOOKKEEPING_KEYS)[number];

const DENIED = "You do not have access to this part of the books.";

/**
 * Who may do what in the books. The services call `assert` themselves (the rule kept from the
 * crm: the middleware refuses early, and the service refuses again, so a procedure that is later
 * called from a job, an agent tool or a test still cannot skip the check). The UI only hides.
 */
@Injectable()
export class BookkeepingAccess {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async roleOf(userId: string): Promise<string | null> {
		return workspaceRoleOf(userId, this.db);
	}

	/** Every key this person holds, for the UI to hide what they cannot use. */
	async grantedKeys(
		userId: string,
	): Promise<{ role: string | null; keys: BookkeepingKey[] }> {
		const role = await this.roleOf(userId);

		return {
			role,
			keys: BOOKKEEPING_KEYS.filter((key) => can(role, key)),
		};
	}

	async has(userId: string, key: BookkeepingKey): Promise<boolean> {
		return can(await this.roleOf(userId), key);
	}

	/** Throws 403 unless the person's role holds `key`. */
	async assert(userId: string, key: BookkeepingKey): Promise<void> {
		if (!(await this.has(userId, key))) throw new ForbiddenException(DENIED);
	}

	/** Throws 403 unless the person's role holds at least one of `keys`. */
	async assertAny(
		userId: string,
		keys: readonly BookkeepingKey[],
	): Promise<void> {
		const role = await this.roleOf(userId);

		if (!keys.some((key) => can(role, key))) {
			throw new ForbiddenException(DENIED);
		}
	}

	/** Who the database guards and the audit trail record as the author. */
	async actorFor(
		userId: string,
		extra: Pick<Actor, "softLockOverride" | "reopen"> = {},
	): Promise<Actor> {
		const user = await this.db.user.findUnique({
			where: { id: userId },
			select: { name: true, email: true },
		});

		return {
			type: "USER",
			id: userId,
			label: user?.email ?? user?.name ?? null,
			...extra,
		};
	}
}

/**
 * First gate on every bookkeeping procedure: a person whose role holds none of the module's keys
 * (a deploy without the module, or a role the module does not know) is refused before any service
 * runs. Each service then checks the specific key the procedure needs.
 */
@Injectable()
export class BookkeepingAccessMiddleware implements TRPCMiddleware {
	constructor(
		@Inject(BookkeepingAccess) private readonly access: BookkeepingAccess,
	) {}

	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as Partial<AuthedTrpcContext>;
		const userId = ctx.user?.id;

		if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

		try {
			await this.access.assertAny(userId, BOOKKEEPING_KEYS);
		} catch {
			throw new TRPCError({ code: "FORBIDDEN", message: DENIED });
		}

		return opts.next();
	}
}
