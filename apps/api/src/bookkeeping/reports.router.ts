import { Inject } from "@nestjs/common";
import { Ctx, Input, Query, Router, UseMiddlewares } from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import {
	trialBalanceInput,
	trialBalanceOutput,
} from "./bookkeeping.contracts";
import { BookkeepingAccessMiddleware } from "./bookkeeping-access";
import { ReportsService } from "./reports.service";

@Router({ alias: "bookkeepingReports" })
@UseMiddlewares(AuthMiddleware, BookkeepingAccessMiddleware)
export class ReportsRouter {
	constructor(
		@Inject(ReportsService) private readonly reports: ReportsService,
	) {}

	@Query({ input: trialBalanceInput, output: trialBalanceOutput })
	async trialBalance(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof trialBalanceInput>,
	) {
		return this.reports.trialBalance(ctx.user.id, input);
	}
}
