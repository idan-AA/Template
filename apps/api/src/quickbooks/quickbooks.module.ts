import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { QuickbooksConnectionService } from "./connection.service";
import { QuickbooksCallbackController } from "./quickbooks-callback.controller";
import { QuickbooksAccess, QuickbooksAccessMiddleware } from "./quickbooks-access";
import { QuickbooksRouter } from "./quickbooks.router";

/**
 * The QuickBooks module's Nest module. `apps/api/src/modules/registry.ts` mounts it on
 * every deploy; what keeps it out of reach while the module is off is the
 * `AuthMiddleware` gate on the router's alias (listed in the module's meta.ts) and the
 * module check in the callback controller.
 */
@Module({
	imports: [TrpcModule],
	controllers: [QuickbooksCallbackController],
	providers: [
		QuickbooksAccess,
		QuickbooksAccessMiddleware,
		QuickbooksConnectionService,
		QuickbooksRouter,
	],
	exports: [QuickbooksConnectionService],
})
export class QuickbooksModule {}
