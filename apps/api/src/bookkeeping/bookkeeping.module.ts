import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { AccountsRouter } from "./accounts.router";
import { AccountsService } from "./accounts.service";
import { BookkeepingRouter } from "./bookkeeping.router";
import {
	BookkeepingAccess,
	BookkeepingAccessMiddleware,
} from "./bookkeeping-access";
import { JournalRouter } from "./journal.router";
import { JournalService } from "./journal.service";
import { ReportsRouter } from "./reports.router";
import { ReportsService } from "./reports.service";
import { SettingsRouter } from "./settings.router";
import { SettingsService } from "./settings.service";
import { SummaryService } from "./summary.service";

/**
 * The bookkeeping module's Nest module. `apps/api/src/modules/registry.ts` mounts it only on a
 * deploy that has bookkeeping switched on, so with it off none of these procedures exist.
 */
@Module({
	imports: [TrpcModule],
	providers: [
		BookkeepingAccess,
		BookkeepingAccessMiddleware,
		AccountsService,
		JournalService,
		SettingsService,
		ReportsService,
		SummaryService,
		BookkeepingRouter,
		AccountsRouter,
		JournalRouter,
		SettingsRouter,
		ReportsRouter,
	],
})
export class BookkeepingModule {}
