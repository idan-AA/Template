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
import {
	journalEntryOutput,
	journalIdInput,
	journalListInput,
	journalListOutput,
	journalPostInput,
	journalPostOutput,
	journalReverseInput,
} from "./bookkeeping.contracts";
import { BookkeepingAccessMiddleware } from "./bookkeeping-access";
import { JournalService } from "./journal.service";

@Router({ alias: "bookkeepingJournal" })
@UseMiddlewares(AuthMiddleware, BookkeepingAccessMiddleware)
export class JournalRouter {
	constructor(
		@Inject(JournalService) private readonly journal: JournalService,
	) {}

	@Query({ input: journalListInput, output: journalListOutput })
	async list(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof journalListInput>,
	) {
		return this.journal.list(ctx.user.id, input);
	}

	@Query({ input: journalIdInput, output: journalEntryOutput })
	async byId(@Ctx() ctx: AuthedTrpcContext, @Input("id") id: string) {
		return this.journal.byId(ctx.user.id, id);
	}

	@Mutation({ input: journalPostInput, output: journalPostOutput })
	async post(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof journalPostInput>,
	) {
		return this.journal.post(ctx.user.id, input);
	}

	@Mutation({ input: journalReverseInput, output: journalPostOutput })
	async reverse(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof journalReverseInput>,
	) {
		return this.journal.reverse(ctx.user.id, input);
	}
}
