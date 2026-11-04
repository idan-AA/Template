import { Module } from "@nestjs/common";
import { ArchiveModule } from "../archive/archive.module";
import { CurrencyModule } from "../currency/currency.module";
import { SyncModule } from "../sync/sync.module";
import { TelemetryModule } from "../telemetry/telemetry.module";
import { TrackingModule } from "../tracking/tracking.module";
import { SchedulerService } from "./scheduler.service";

@Module({
	imports: [
		ArchiveModule,
		CurrencyModule,
		SyncModule,
		TelemetryModule,
		TrackingModule,
	],
	providers: [SchedulerService],
})
export class SchedulerModule {}
