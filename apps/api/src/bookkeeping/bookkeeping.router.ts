import { Inject } from "@nestjs/common";
import { Ctx, Query, Router, UseMiddlewares } from "nestjs-trpc";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { accessOutput, summaryOutput } from "./bookkeeping.contracts";
import { BookkeepingAccessMiddleware } from "./bookkeeping-access";
import { SummaryService } from "./summary.service";

@Router({ alias: "bookkeeping" })
@UseMiddlewares(AuthMiddleware, BookkeepingAccessMiddleware)
export class BookkeepingRouter {
	constructor(
		@Inject(SummaryService) private readonly summary: SummaryService,
	) {}

	@Query({ output: accessOutput })
	async access(@Ctx() ctx: AuthedTrpcContext) {
		return this.summary.granted(ctx.user.id);
	}

	@Query({ output: summaryOutput })
	async home(@Ctx() ctx: AuthedTrpcContext) {
		return this.summary.summary(ctx.user.id);
	}
}
