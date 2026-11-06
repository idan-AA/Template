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
import { SessionOnlyMiddleware } from "../trpc/middlewares/session-only.middleware";
import { restMeta } from "../trpc/openapi";
import {
	modulesListOutput,
	modulesStateOutput,
	setModuleInput,
} from "./modules.contracts";
import { ModulesService } from "./modules.service";

@Router({ alias: "modules" })
@UseMiddlewares(AuthMiddleware, SessionOnlyMiddleware)
export class ModulesRouter {
	constructor(
		@Inject(ModulesService) private readonly modules: ModulesService,
	) {}

	@Query({
		output: modulesStateOutput,
		meta: restMeta("GET", "/modules/state", ["Modules"]),
	})
	async state(@Ctx() ctx: AuthedTrpcContext) {
		return this.modules.state(ctx.user);
	}

	@Query({
		output: modulesListOutput,
		meta: restMeta("GET", "/modules", ["Modules"]),
	})
	async list(@Ctx() ctx: AuthedTrpcContext) {
		return this.modules.list(ctx.user);
	}

	@Mutation({
		input: setModuleInput,
		output: modulesListOutput,
		meta: restMeta("PATCH", "/modules/{moduleId}", ["Modules"]),
	})
	async set(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setModuleInput>,
	) {
		return this.modules.set(ctx.user, input);
	}
}
