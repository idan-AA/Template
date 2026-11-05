import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { AccountRouter } from "./account.router";
import { AccountService } from "./account.service";

@Module({
	imports: [TrpcModule],
	providers: [AccountService, AccountRouter],
	exports: [AccountService],
})
export class AccountModule {}
