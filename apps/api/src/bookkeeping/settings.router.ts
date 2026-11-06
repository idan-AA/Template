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
	sequenceUpdateInput,
	settingsOutput,
	settingsUpdateInput,
} from "./bookkeeping.contracts";
import { BookkeepingAccessMiddleware } from "./bookkeeping-access";
import { SettingsService } from "./settings.service";

@Router({ alias: "bookkeepingSettings" })
@UseMiddlewares(AuthMiddleware, BookkeepingAccessMiddleware)
export class SettingsRouter {
	constructor(
		@Inject(SettingsService) private readonly settings: SettingsService,
	) {}

	@Query({ output: settingsOutput })
	async get(@Ctx() ctx: AuthedTrpcContext) {
		return this.settings.get(ctx.user.id);
	}

	@Mutation({ input: settingsUpdateInput, output: settingsOutput })
	async update(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof settingsUpdateInput>,
	) {
		return this.settings.update(ctx.user.id, input);
	}

	@Mutation({ input: sequenceUpdateInput, output: settingsOutput })
	async updateSequence(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sequenceUpdateInput>,
	) {
		return this.settings.updateSequence(ctx.user.id, input);
	}
}
