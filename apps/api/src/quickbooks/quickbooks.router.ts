import { Inject } from "@nestjs/common";
import { Ctx, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { SessionOnlyMiddleware } from "../trpc/middlewares/session-only.middleware";
import { QuickbooksConnectionService } from "./connection.service";
import {
	connectStartOutput,
	disconnectOutput,
	quickbooksStatusOutput,
} from "./quickbooks.contracts";
import { QuickbooksAccessMiddleware } from "./quickbooks-access";

/**
 * The `quickbooks` router. Session only: connecting a company is something a
 * signed-in person does in the browser, never an API key. Each service call checks
 * the permission key again.
 */
@Router({ alias: "quickbooks" })
@UseMiddlewares(AuthMiddleware, SessionOnlyMiddleware, QuickbooksAccessMiddleware)
export class QuickbooksRouter {
	constructor(
		@Inject(QuickbooksConnectionService)
		private readonly connection: QuickbooksConnectionService,
	) {}

	@Query({ output: quickbooksStatusOutput })
	async status(@Ctx() ctx: AuthedTrpcContext) {
		return this.connection.status(ctx.user.id);
	}

	/** Gives the address of Intuit's consent page; the browser goes there. */
	@Mutation({ output: connectStartOutput })
	async connectStart(@Ctx() ctx: AuthedTrpcContext) {
		return this.connection.startConnect(ctx.user.id);
	}

	/** "Check connection": refreshes the token if needed and reads the company. */
	@Mutation({ output: quickbooksStatusOutput })
	async check(@Ctx() ctx: AuthedTrpcContext) {
		return this.connection.check(ctx.user.id);
	}

	@Mutation({ output: disconnectOutput })
	async disconnect(@Ctx() ctx: AuthedTrpcContext) {
		return this.connection.disconnect(ctx.user.id);
	}
}
