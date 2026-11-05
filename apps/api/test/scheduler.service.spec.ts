import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db } from "@app/db";
import { withAdvisoryLock } from "../src/scheduler/advisory-lock";
import { SchedulerService } from "../src/scheduler/scheduler.service";

const JOBS = [
	"mailboxes",
	"rates",
	"telemetry-rollup",
	"tracking-retention",
	"archive-prune",
];

function build(overrides: { mailboxes?: () => Promise<unknown> } = {}) {
	const calls = { mailboxes: 0, rollup: 0 };
	const service = new SchedulerService(
		db,
		{
			runDue: async () => {
				calls.mailboxes += 1;
				if (overrides.mailboxes) await overrides.mailboxes();
			},
		} as never,
		{ refresh: async () => ({ ok: true }) } as never,
		{ fillMissing: async () => undefined } as never,
		{
			run: async () => {
				calls.rollup += 1;
			},
		} as never,
		{ run: async () => undefined } as never,
		{ run: async () => undefined } as never,
	);

	return { service, calls };
}

describe("SchedulerService.tick", () => {
	beforeEach(async () => {
		await db.schedulerRun.deleteMany({ where: { job: { in: JOBS } } });
	});

	afterAll(async () => {
		await db.schedulerRun.deleteMany({ where: { job: { in: JOBS } } });
	});

	it("runs every job that never ran, once, on the first tick", async () => {
		const { service, calls } = build();
		const reports = await service.tick(new Date());

		expect(reports.map((r) => r.outcome)).toEqual(Array(5).fill("ran"));
		expect(calls.mailboxes).toBe(1);

		const second = await service.tick(new Date());
		expect(second.every((r) => r.outcome === "not-due")).toBe(true);
		expect(calls.mailboxes).toBe(1);
	});

	it("a job that throws cannot make tick throw, and the other jobs still run", async () => {
		const { service, calls } = build({
			mailboxes: async () => {
				throw new Error("mailbox provider down");
			},
		});

		const reports = await service.tick(new Date());
		const byJob = Object.fromEntries(reports.map((r) => [r.job, r]));

		expect(byJob.mailboxes?.outcome).toBe("failed");
		expect(byJob.mailboxes?.error).toBe("mailbox provider down");
		expect(byJob["telemetry-rollup"]?.outcome).toBe("ran");
		expect(calls.rollup).toBe(1);

		const row = await db.schedulerRun.findUnique({
			where: { job: "mailboxes" },
		});
		expect(row?.lastSuccessAt).toBeNull();
		expect(row?.lastError).toBe("mailbox provider down");
	});

	it("retries a failed job on the next tick", async () => {
		let fail = true;
		const { service, calls } = build({
			mailboxes: async () => {
				if (fail) throw new Error("still down");
			},
		});

		await service.tick(new Date());
		fail = false;
		const again = await service.tick(new Date());

		expect(again.find((r) => r.job === "mailboxes")?.outcome).toBe("ran");
		expect(calls.mailboxes).toBe(2);
	});

	it("skips a tick that starts while the previous one is still running", async () => {
		let release: () => void = () => {};
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const { service } = build({ mailboxes: () => gate });

		const first = service.tick(new Date());
		await new Promise((resolve) => setTimeout(resolve, 100));
		const overlapping = await service.tick(new Date());

		expect(overlapping).toEqual([]);
		release();
		await first;
	});
});

describe("withAdvisoryLock failure modes", () => {
	it("rejects instead of hanging or crashing when the database is unreachable", async () => {
		const saved = process.env.DATABASE_URL;
		process.env.DATABASE_URL =
			"postgresql://nobody:nobody@127.0.0.1:1/none?schema=public";

		try {
			await expect(withAdvisoryLock(42, async () => "x")).rejects.toBeDefined();
		} finally {
			process.env.DATABASE_URL = saved;
		}
	});

	it("does not crash the process when the lock connection is killed mid-job", async () => {
		const result = await withAdvisoryLock(43, async () => {
			await db.$executeRawUnsafe(
				`SELECT pg_terminate_backend(pid) FROM pg_locks l JOIN pg_stat_activity a USING (pid)
				 WHERE l.locktype = 'advisory' AND l.classid = 7251001 AND l.objid = 43 AND pid <> pg_backend_pid()`,
			);
			await new Promise((resolve) => setTimeout(resolve, 200));
			return "finished";
		});

		expect(result).toEqual({ acquired: true, value: "finished" });
	});
});
