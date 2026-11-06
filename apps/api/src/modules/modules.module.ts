import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ModulesRouter } from "./modules.router";
import { ModulesService } from "./modules.service";

@Module({
	imports: [TrpcModule],
	providers: [ModulesService, ModulesRouter],
	exports: [ModulesService],
})
export class ModulesModule {}
