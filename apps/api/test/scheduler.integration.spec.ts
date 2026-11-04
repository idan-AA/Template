import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db } from "@app/db";
import { withAdvisoryLock } from "../src/scheduler/advisory-lock";
import { runDueJob, type SchedulerJob } from "../src/scheduler/job-runner";
import { isDue, latestSlot } from "../src/scheduler/schedule";

const RUN_ID = process.env.TEST_RUN_ID ?? `${process.pid}`;
const NAME = `test-job-${RUN_ID}`;
const LOCK_KEY = 9_000_000 + (process.pid % 1000);

function at(iso: string): Date {
	return new Date(iso);
}

function job(run: () => Promise<unknown>): SchedulerJob {
	return {
		name: NAME,
		lockKey: LOCK_KEY,
		schedule: { dailyAtUtcHour: 6 },
		run,
	};
}

describe("schedule slots", () => {
	it("floors a five minute job to its slot", () => {
		const slot = latestSlot({ everyMinutes: 5 }, at("2026-11-04T10:07:31Z"));
		expect(slot.toISOString()).toBe("2026-11-04T10:05:00.000Z");
	});

	it("uses today's slot once the hour has passed", () => {
		const slot = latestSlot({ dailyAtUtcHour: 6 }, at("2026-11-04T06:00:00Z"));
		expect(slot.toISOString()).toBe("2026-11-04T06:00:00.000Z");
	});

	it("uses yesterday's slot before the hour", () => {
		const slot = latestSlot({ dailyAtUtcHour: 6 }, at("2026-11-04T05:59:59Z"));
		expect(slot.toISOString()).toBe("2026-11-03T06:00:00.000Z");
	});

	it("is due when it never ran", () => {
		expect(isDue(null, { dailyAtUtcHour: 6 }, at("2026-11-04T10:00:00Z"))).toBe(
			true,
		);
	});

	it("is not due after a success in the current slot", () => {
		expect(
			isDue(
				at("2026-11-04T06:00:05Z"),
				{ dailyAtUtcHour: 6 },
				at("2026-11-04T23:00:00Z"),
			),
		).toBe(false);
	});

	it("catches up a slot missed during downtime", () => {
		expect(
			isDue(
				at("2026-11-03T06:00:05Z"),
				{ dailyAtUtcHour: 6 },
				at("2026-11-04T09:00:00Z"),
			),
		).toBe(true);
	});
});

describe("runDueJob", () => {
	beforeEach(async () => {
		await db.schedulerRun.deleteMany({ where: { job: NAME } });
	});

	afterAll(async () => {
		await db.schedulerRun.deleteMany({ where: { job: NAME } });
	});

	it("runs a job that never ran and records the success", async () => {
		let runs = 0;
		const report = await runDueJob(
			db,
			withAdvisoryLock,
			job(async () => {
				runs += 1;
			}),
			new Date(),
		);

		expect(report.outcome).toBe("ran");
		expect(runs).toBe(1);

		const row = await db.schedulerRun.findUnique({ where: { job: NAME } });
		expect(row?.lastSuccessAt).not.toBeNull();
	});

	it("does not run again inside the same slot", async () => {
		let runs = 0;
		const counted = job(async () => {
			runs += 1;
		});

		await runDueJob(db, withAdvisoryLock, counted, new Date());
		const second = await runDueJob(db, withAdvisoryLock, counted, new Date());

		expect(second.outcome).toBe("not-due");
		expect(runs).toBe(1);
	});

	it("runs once after downtime across a daily slot", async () => {
		await db.schedulerRun.create({
			data: { job: NAME, lastSuccessAt: at("2026-11-02T06:00:05Z") },
		});

		let runs = 0;
		const counted = job(async () => {
			runs += 1;
		});
		const now = at("2026-11-04T09:00:00Z");

		const first = await runDueJob(db, withAdvisoryLock, counted, now);
		const second = await runDueJob(db, withAdvisoryLock, counted, now);

		expect(first.outcome).toBe("ran");
		expect(second.outcome).toBe("not-due");
		expect(runs).toBe(1);
	});

	it("does not advance the success time when the job fails", async () => {
		const before = at("2026-11-02T06:00:05Z");
		await db.schedulerRun.create({
			data: { job: NAME, lastSuccessAt: before },
		});

		const report = await runDueJob(
			db,
			withAdvisoryLock,
			job(async () => {
				throw new Error("boom");
			}),
			at("2026-11-04T09:00:00Z"),
		);

		expect(report.outcome).toBe("failed");
		expect(report.error).toBe("boom");

		const row = await db.schedulerRun.findUnique({ where: { job: NAME } });
		expect(row?.lastSuccessAt?.getTime()).toBe(before.getTime());
		expect(row?.lastError).toBe("boom");
		expect(row?.lastFailureAt).not.toBeNull();
	});

	it("runs a due job once when two runners start together", async () => {
		let runs = 0;
		const slow = job(async () => {
			runs += 1;
			await new Promise((resolve) => setTimeout(resolve, 300));
		});

		const [a, b] = await Promise.all([
			runDueJob(db, withAdvisoryLock, slow, new Date()),
			runDueJob(db, withAdvisoryLock, slow, new Date()),
		]);

		expect(runs).toBe(1);
		expect([a.outcome, b.outcome].sort()).toEqual(["locked", "ran"]);
	});
});
