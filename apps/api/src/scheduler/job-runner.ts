import type { Db } from "@app/db";
import type { WithLock } from "./advisory-lock";
import { isDue, type JobSchedule } from "./schedule";

export interface SchedulerJob {
	readonly name: string;
	readonly lockKey: number;
	readonly schedule: JobSchedule;
	readonly run: () => Promise<unknown>;
}

type JobOutcome = "ran" | "failed" | "not-due" | "locked";

export interface JobReport {
	readonly job: string;
	readonly outcome: JobOutcome;
	readonly error?: string;
}

export async function runDueJob(
	db: Db,
	withLock: WithLock,
	job: SchedulerJob,
	now: Date,
): Promise<JobReport> {
	const locked = await withLock(job.lockKey, async (): Promise<JobReport> => {
		const row = await db.schedulerRun.findUnique({ where: { job: job.name } });

		if (!isDue(row?.lastSuccessAt ?? null, job.schedule, now)) {
			return { job: job.name, outcome: "not-due" };
		}

		try {
			await job.run();
			await db.schedulerRun.upsert({
				where: { job: job.name },
				create: { job: job.name, lastSuccessAt: new Date() },
				update: { lastSuccessAt: new Date(), lastError: null },
			});

			return { job: job.name, outcome: "ran" };
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			await db.schedulerRun.upsert({
				where: { job: job.name },
				create: {
					job: job.name,
					lastFailureAt: new Date(),
					lastError: message,
				},
				update: { lastFailureAt: new Date(), lastError: message },
			});

			return { job: job.name, outcome: "failed", error: message };
		}
	});

	return locked.acquired ? locked.value : { job: job.name, outcome: "locked" };
}
