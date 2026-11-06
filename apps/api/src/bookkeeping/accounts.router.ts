import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { AccountsService } from "./accounts.service";
import {
	accountCreateInput,
	accountIdOutput,
	accountLedgerInput,
	accountLedgerOutput,
	accountListInput,
	accountListOutput,
	accountUpdateArgs,
} from "./bookkeeping.contracts";
import { BookkeepingAccessMiddleware } from "./bookkeeping-access";

@Router({ alias: "bookkeepingAccounts" })
@UseMiddlewares(AuthMiddleware, BookkeepingAccessMiddleware)
export class AccountsRouter {
	constructor(
		@Inject(AccountsService) private readonly accounts: AccountsService,
	) {}

	@Query({ input: accountListInput, output: accountListOutput })
	async list(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof accountListInput>,
	) {
		return this.accounts.list(ctx.user.id, input);
	}

	@Query({ input: accountLedgerInput, output: accountLedgerOutput })
	async ledger(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof accountLedgerInput>,
	) {
		return this.accounts.ledger(ctx.user.id, input);
	}

	@Mutation({ input: accountCreateInput, output: accountIdOutput })
	async create(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof accountCreateInput>,
	) {
		return this.accounts.create(ctx.user.id, input);
	}

	@Mutation({ input: accountUpdateArgs, output: accountIdOutput })
	async update(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof accountUpdateArgs>,
	) {
		return this.accounts.update(ctx.user.id, input.id, input.data);
	}
}
