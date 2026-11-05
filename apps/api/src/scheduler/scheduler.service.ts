import type { Db } from "@app/db";
import {
	Injectable,
	Logger,
	type OnApplicationShutdown,
	type OnModuleInit,
} from "@nestjs/common";
import { ArchiveRetentionService } from "../archive/archive-retention.service";
import { ConversionService } from "../currency/conversion.service";
import { RatesService } from "../currency/rates.service";
import { InjectDatabase } from "../database/database.constants";
import { MailboxSyncService } from "../sync/mailbox-sync.service";
import { RollupService } from "../telemetry/rollup.service";
import { TrackingRetentionService } from "../tracking/tracking-retention.service";
import { withAdvisoryLock } from "./advisory-lock";
import { type JobReport, runDueJob, type SchedulerJob } from "./job-runner";

const TICK_MS = 60_000;

const FIRST_TICK_DELAY_MS = 15_000;

@Injectable()
export class SchedulerService implements OnModuleInit, OnApplicationShutdown {
	private readonly logger = new Logger(SchedulerService.name);
	private readonly jobs: readonly SchedulerJob[];
	private timer: ReturnType<typeof setInterval> | null = null;
	private first: ReturnType<typeof setTimeout> | null = null;
	private ticking = false;

	constructor(
		@InjectDatabase() private readonly db: Db,
		sync: MailboxSyncService,
		rates: RatesService,
		conversion: ConversionService,
		rollup: RollupService,
		tracking: TrackingRetentionService,
		archive: ArchiveRetentionService,
	) {
		this.jobs = [
			{
				name: "mailboxes",
				lockKey: 1,
				schedule: { everyMinutes: 5 },
				run: () => sync.runDue(),
			},
			{
				name: "rates",
				lockKey: 2,
				schedule: { dailyAtUtcHour: 6 },
				run: async () => {
					const refresh = await rates.refresh();
					if (!refresh.ok) throw new Error("Exchange rate refresh failed");
					await conversion.fillMissing();
				},
			},
			{
				name: "telemetry-rollup",
				lockKey: 3,
				schedule: { dailyAtUtcHour: 7 },
				run: () => rollup.run(),
			},
			{
				name: "tracking-retention",
				lockKey: 4,
				schedule: { dailyAtUtcHour: 4 },
				run: () => tracking.run(),
			},
			{
				name: "archive-prune",
				lockKey: 5,
				schedule: { dailyAtUtcHour: 5 },
				run: () => archive.run(),
			},
		];
	}

	onModuleInit(): void {
		if (process.env.SCHEDULER_DISABLED === "1") {
			this.logger.log({ message: "Scheduler disabled by SCHEDULER_DISABLED" });
			return;
		}

		if (process.env.NODE_ENV === "test") return;

		this.logger.log({
			message: "Scheduler started",
			jobs: this.jobs.map((job) => job.name),
		});

		this.first = setTimeout(() => void this.tick(), FIRST_TICK_DELAY_MS);
		this.timer = setInterval(() => void this.tick(), TICK_MS);
		this.first.unref();
		this.timer.unref();
	}

	onApplicationShutdown(): void {
		if (this.first) clearTimeout(this.first);
		if (this.timer) clearInterval(this.timer);
	}

	async tick(now: Date = new Date()): Promise<readonly JobReport[]> {
		if (this.ticking) return [];
		this.ticking = true;

		const reports: JobReport[] = [];

		try {
			for (const job of this.jobs) {
				try {
					const report = await runDueJob(this.db, withAdvisoryLock, job, now);
					reports.push(report);

					if (report.outcome === "failed") {
						// TODO(error-alert-system): this repo has no error reporter yet, so a
						// failed job is only logged here and stored in SchedulerRun.lastError.
						// Report it through the reporter once one exists (skill: error-alert-system).
						this.logger.error({
							message: "Scheduled job failed",
							job: job.name,
							error: report.error,
						});
					} else if (report.outcome === "ran") {
						this.logger.log({ message: "Scheduled job ran", job: job.name });
					}
				} catch (error) {
					this.logger.error(
						{ message: "Scheduler could not run a job", job: job.name },
						error instanceof Error ? error.stack : String(error),
					);
				}
			}
		} finally {
			this.ticking = false;
		}

		return reports;
	}
}
