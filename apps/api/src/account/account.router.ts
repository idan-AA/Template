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
import type { AuthedTrpcContext, BaseTrpcContext } from "../trpc/context.types";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import {
	accountStateOutput,
	bootstrapStatusOutput,
	changePasswordInput,
	changePasswordOutput,
	createOwnerInput,
	createOwnerOutput,
} from "./account.contracts";
import { AccountService } from "./account.service";
import { clientAddress } from "./client-address";

/**
 * `bootstrapStatus` and `createOwner` carry no AuthMiddleware on purpose: they
 * are public, and safe because `createOwner` refuses once any user exists. They
 * are left out of the REST bridge.
 */
@Router({ alias: "account" })
export class AccountRouter {
	constructor(
		@Inject(AccountService) private readonly account: AccountService,
	) {}

	@Query({ output: bootstrapStatusOutput })
	async bootstrapStatus() {
		return this.account.bootstrapStatus();
	}

	@Mutation({ input: createOwnerInput, output: createOwnerOutput })
	async createOwner(
		@Ctx() ctx: BaseTrpcContext,
		@Input() input: z.infer<typeof createOwnerInput>,
	) {
		return this.account.createOwner(input, clientAddress(ctx.req));
	}

	@Query({ output: accountStateOutput })
	@UseMiddlewares(AuthMiddleware)
	async state(@Ctx() ctx: AuthedTrpcContext) {
		return this.account.state(ctx.user.id);
	}

	@Mutation({ input: changePasswordInput, output: changePasswordOutput })
	@UseMiddlewares(AuthMiddleware)
	async changePassword(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof changePasswordInput>,
	) {
		return this.account.changePassword(
			ctx.user.id,
			ctx.session?.session.id ?? "",
			input,
		);
	}
}
