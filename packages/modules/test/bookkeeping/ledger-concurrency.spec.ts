import { describe, expect, setDefaultTimeout, test } from "bun:test";
import {
	buildManualJournalEntry,
	type PostingInput,
} from "../../bookkeeping/engine";
import { post } from "../../bookkeeping/ledger/posting";
import {
	acct,
	ctxOf,
	type Fixture,
	fixture,
	refusal,
	USER,
} from "./ledger-helpers";

// Each spec clones a database; cloning is slow on some hosts.
setDefaultTimeout(120_000);

async function journal(
	f: Fixture,
	id: string,
	date: string,
	amount: bigint,
): Promise<PostingInput> {
	const ctx = await ctxOf(f);
	return buildManualJournalEntry(
		{
			id,
			source: "MANUAL",
			date,
			memo: null,
			lines: [
				{
					accountId: acct(f, "6250"),
					side: "DEBIT",
					amountMinor: amount,
					currency: ctx.baseCurrency,
					fx: null,
				},
				{
					accountId: acct(f, "3000"),
					side: "CREDIT",
					amountMinor: amount,
					currency: ctx.baseCurrency,
					fx: null,
				},
			],
		},
		ctx,
	);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("T9 concurrency", () => {
	test("eight posters racing one sourceKey produce exactly one entry", async () => {
		const f = await fixture("t9key");
		const input = await journal(f, "same", "2026-11-05", 777n);
		const results = await Promise.all(
			Array.from({ length: 8 }, () =>
				f.db.$transaction((tx) => post(tx, input, USER)),
			),
		);
		expect(results.filter((r) => r.created).length).toBe(1);
		expect(new Set(results.map((r) => r.entryId)).size).toBe(1);
		expect(await f.db.journalEntry.count()).toBe(1);
		expect(await f.db.auditEvent.count()).toBe(1);
		await f.close();
	});

	test("twenty concurrent posters get consecutive numbers: no gap, no duplicate", async () => {
		const f = await fixture("t9num");
		const inputs = await Promise.all(
			Array.from({ length: 20 }, (_, i) =>
				journal(f, `n${i}`, "2026-11-05", BigInt(100 + i)),
			),
		);
		const results = await Promise.all(
			inputs.map((input) => f.db.$transaction((tx) => post(tx, input, USER))),
		);
		const numbers = results.map((r) => r.number).sort();
		expect(numbers).toEqual(
			Array.from(
				{ length: 20 },
				(_, i) => `JE-${String(i + 1).padStart(6, "0")}`,
			),
		);
		const seq = await f.db.numberSequence.findUniqueOrThrow({
			where: { key: "ENTRY" },
		});
		expect(seq.nextValue).toBe(21);
		await f.close();
	});

	test("two posters racing for the same number: the second waits and takes the next one", async () => {
		const f = await fixture("t9two");
		const a = await journal(f, "ra", "2026-11-05", 10n);
		const b = await journal(f, "rb", "2026-11-05", 20n);
		let releaseA: () => void = () => {};
		const gate = new Promise<void>((r) => {
			releaseA = r;
		});
		let aDone = false;
		let bDone = false;
		const first = f.db
			.$transaction(async (tx) => {
				const r = await post(tx, a, USER);
				await gate;
				return r;
			})
			.then((r) => {
				aDone = true;
				return r;
			});
		await sleep(300);
		const second = f.db
			.$transaction((tx) => post(tx, b, USER))
			.then((r) => {
				bDone = true;
				return r;
			});
		await sleep(500);
		expect(aDone).toBe(false);
		expect(bDone).toBe(false);
		releaseA();
		const [ra, rb] = await Promise.all([first, second]);
		expect(ra.number).toBe("JE-000001");
		expect(rb.number).toBe("JE-000002");
		await f.close();
	});

	test("a rolled back post returns its number: the next post is consecutive", async () => {
		const f = await fixture("t9rb");
		const a = await journal(f, "ok1", "2026-11-05", 10n);
		const b = await journal(f, "rolled", "2026-11-05", 20n);
		const c = await journal(f, "ok2", "2026-11-05", 30n);
		await f.db.$transaction((tx) => post(tx, a, USER));
		await refusal(() =>
			f.db.$transaction(async (tx) => {
				const r = await post(tx, b, USER);
				expect(r.number).toBe("JE-000002");
				throw new Error("caller failed after posting");
			}),
		);
		const third = await f.db.$transaction((tx) => post(tx, c, USER));
		expect(third.number).toBe("JE-000002");
		expect(
			await f.db.journalEntry.count({ where: { sourceKey: "manual:rolled" } }),
		).toBe(0);
		await f.close();
	});

	test("a lock date change during a post: the post lands before it or is refused after it, never inside", async () => {
		const f = await fixture("t9lock");
		const early = await journal(f, "inflight", "2026-11-05", 10n);
		const late = await journal(f, "afterlock", "2026-11-05", 20n);
		let releaseA: () => void = () => {};
		const gate = new Promise<void>((r) => {
			releaseA = r;
		});
		let lockDone = false;
		const inflight = f.db.$transaction(async (tx) => {
			const r = await post(tx, early, USER);
			await gate;
			return r;
		});
		await sleep(300);
		const lock = f.db.ledgerSettings
			.update({
				where: { id: "ledger" },
				data: { lockDate: new Date("2026-11-30T00:00:00.000Z") },
			})
			.then(() => {
				lockDone = true;
			});
		await sleep(500);
		expect(lockDone).toBe(false);
		releaseA();
		const landed = await inflight;
		await lock;
		expect(lockDone).toBe(true);
		expect(landed.created).toBe(true);
		const text = await refusal(() =>
			f.db.$transaction((tx) => post(tx, late, USER)),
		);
		expect(text).toContain("on or before the lock date");
		expect(await f.db.journalEntry.count({ where: { status: "POSTED" } })).toBe(
			1,
		);
		await f.close();
	});
});
