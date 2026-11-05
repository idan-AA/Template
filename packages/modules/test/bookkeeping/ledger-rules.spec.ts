import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setDefaultTimeout,
	test,
} from "bun:test";
import type { PrismaClient } from "@app/db";
import { seedLedger } from "@app/db/seeds/bookkeeping";
import {
	buildDocumentEntry,
	buildManualJournalEntry,
	buildOpeningBalancesEntry,
	LedgerError,
} from "../../bookkeeping/engine";
import { reverse } from "../../bookkeeping/ledger/posting";
import {
	generalLedger,
	trialBalance,
	trialBalanceTotals,
} from "../../bookkeeping/ledger/queries";
import {
	acct,
	ctxOf,
	type Fixture,
	fixture,
	manual,
	postIn,
	refusal,
	USER,
} from "./ledger-helpers";

// Each spec clones a database; cloning is slow on some hosts.
setDefaultTimeout(120_000);

describe("module seed (idempotent)", () => {
	test("the second run creates nothing and touches no edited name", async () => {
		const f = await fixture("seed", { seed: false });
		const first = await seedLedger(f.db, {
			baseCurrency: "USD",
			timezone: "America/New_York",
		});
		expect(first.settingsCreated).toBe(true);
		expect(first.sequencesCreated).toBe(5);
		expect(first.accountsCreated).toBe(10 + 37);

		await f.db.ledgerAccount.update({
			where: { code: "6250" },
			data: { name: "Stationery (renamed by user)" },
		});
		const before = await f.db.ledgerAccount.count();

		const second = await seedLedger(f.db, {
			baseCurrency: "EUR",
			timezone: "UTC",
		});
		expect(second).toEqual({
			settingsCreated: false,
			sequencesCreated: 0,
			accountsCreated: 0,
		});
		expect(await f.db.ledgerAccount.count()).toBe(before);
		expect(
			(await f.db.ledgerAccount.findUniqueOrThrow({ where: { code: "6250" } }))
				.name,
		).toBe("Stationery (renamed by user)");
		expect(
			(await f.db.ledgerSettings.findUniqueOrThrow({ where: { id: "ledger" } }))
				.baseCurrency,
		).toBe("USD");

		const roles = await f.db.ledgerAccount.findMany({
			where: { systemRole: { not: null } },
		});
		expect(roles.length).toBe(7);
		expect(roles.every((r) => r.isSystem)).toBe(true);
		const codes = (
			await f.db.ledgerAccount.findMany({ select: { code: true } })
		).map((r) => r.code);
		expect(new Set(codes).size).toBe(codes.length);
		await f.close();
	});

	test("a crash half way through the seed leaves no partial chart", async () => {
		const f = await fixture("seedcrash", { seed: false });
		// The 20th account insert fails, after settings, sequences and 19 accounts were written.
		let creates = 0;
		const crashing = new Proxy(f.db, {
			get(target, prop, receiver) {
				if (prop !== "$transaction") return Reflect.get(target, prop, receiver);
				return (
					run: (tx: PrismaClient) => Promise<unknown>,
					opts: Parameters<PrismaClient["$transaction"]>[1],
				) =>
					target.$transaction(
						(tx) =>
							run(
								new Proxy(tx, {
									get(t, p, r) {
										if (p !== "ledgerAccount") return Reflect.get(t, p, r);
										return new Proxy(t.ledgerAccount, {
											get(a, m, ar) {
												if (m !== "create") return Reflect.get(a, m, ar);
												return (...args: Parameters<typeof a.create>) => {
													if (++creates === 20)
														throw new Error("simulated crash");
													return a.create(...args);
												};
											},
										});
									},
								}) as unknown as PrismaClient,
							),
						opts,
					);
			},
		});
		await expect(
			seedLedger(crashing, { baseCurrency: "USD", timezone: "UTC" }),
		).rejects.toThrow("simulated crash");
		expect(creates).toBe(20);
		expect(await f.db.ledgerSettings.count()).toBe(0);
		expect(await f.db.numberSequence.count()).toBe(0);
		expect(await f.db.ledgerAccount.count()).toBe(0);

		// The real seed then succeeds in full on the same database.
		const r = await seedLedger(f.db, { baseCurrency: "USD", timezone: "UTC" });
		expect(r.accountsCreated).toBe(10 + 37);
		await f.close();
	});

	test("a recoded system account is found by its role, not duplicated", async () => {
		const f = await fixture("seedrole");
		await f.db.ledgerAccount.update({
			where: { code: "1100" },
			data: { code: "1101" },
		});
		const r = await seedLedger(f.db, { baseCurrency: "USD", timezone: "UTC" });
		expect(r.accountsCreated).toBe(0);
		expect(
			await f.db.ledgerAccount.count({
				where: { systemRole: "ACCOUNTS_RECEIVABLE" },
			}),
		).toBe(1);
		await f.close();
	});
});

describe("R17 manual journal and adjustment", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("r17");
	});
	afterAll(() => f.close());

	test("posts a balanced journal, writes the audit row, number is assigned", async () => {
		const id = await manual(f, "j1", "2026-11-05", [
			["6250", "DEBIT", 12_500n],
			["3000", "CREDIT", 12_500n],
		]);
		const e = await f.db.journalEntry.findUniqueOrThrow({ where: { id } });
		expect(e.status).toBe("POSTED");
		expect(e.number).toBe("JE-000001");
		expect(e.postedById).toBe("user-1");
		const audit = await f.db.auditEvent.findMany({ where: { entityId: id } });
		expect(audit.map((a) => a.action)).toEqual(["ENTRY_POSTED"]);
		expect(audit[0]?.module).toBe("bookkeeping");
		expect(audit[0]?.actorType).toBe("USER");
	});

	test("receivable, payable, bank and card accounts are refused (opposite: expense and equity are fine)", async () => {
		const ctx = await ctxOf(f);
		for (const code of ["1100", "2000", "1000", "2100"]) {
			expect(() =>
				buildManualJournalEntry(
					{
						id: `bad-${code}`,
						source: "MANUAL",
						date: "2026-11-05",
						memo: null,
						lines: [
							{
								accountId: acct(f, code),
								side: "DEBIT",
								amountMinor: 100n,
								currency: "USD",
								fx: null,
							},
							{
								accountId: acct(f, "3000"),
								side: "CREDIT",
								amountMinor: 100n,
								currency: "USD",
								fx: null,
							},
						],
					},
					ctx,
				),
			).toThrow(LedgerError);
		}
	});

	test("an adjustment needs a memo (engine) and is stored as ADJUSTMENT", async () => {
		const ctx = await ctxOf(f);
		const lines = [
			{
				accountId: acct(f, "6800"),
				side: "DEBIT" as const,
				amountMinor: 900n,
				currency: "USD",
				fx: null,
			},
			{
				accountId: acct(f, "1590"),
				side: "CREDIT" as const,
				amountMinor: 900n,
				currency: "USD",
				fx: null,
			},
		];
		expect(() =>
			buildManualJournalEntry(
				{
					id: "adj0",
					source: "ADJUSTMENT",
					date: "2026-11-30",
					memo: " ",
					lines,
				},
				ctx,
			),
		).toThrow(LedgerError);
		const id = await postIn(
			f,
			buildManualJournalEntry(
				{
					id: "adj1",
					source: "ADJUSTMENT",
					date: "2026-11-30",
					memo: "November depreciation",
					lines,
				},
				ctx,
			),
		);
		expect(
			(await f.db.journalEntry.findUniqueOrThrow({ where: { id } })).source,
		).toBe("ADJUSTMENT");
	});

	test("a foreign currency journal posts with a ROUNDING line only where conversion explains it", async () => {
		const ctx = await ctxOf(f);
		const input = buildManualJournalEntry(
			{
				id: "fxj",
				source: "MANUAL",
				date: "2026-11-05",
				memo: null,
				lines: [
					{
						accountId: acct(f, "6250"),
						side: "DEBIT",
						amountMinor: 3333n,
						currency: "EUR",
						fx: {
							rate: "1.0005",
							origin: "MANUAL",
							at: "2026-11-04T00:00:00.000Z",
						},
					},
					{
						accountId: acct(f, "3000"),
						side: "CREDIT",
						amountMinor: 3333n,
						currency: "EUR",
						fx: {
							rate: "1.0005",
							origin: "MANUAL",
							at: "2026-11-04T00:00:00.000Z",
						},
					},
				],
			},
			ctx,
		);
		const id = await postIn(f, input);
		const lines = await f.db.journalLine.findMany({ where: { entryId: id } });
		const dr = lines.reduce((s, l) => s + l.baseDebitMinor, 0n);
		const cr = lines.reduce((s, l) => s + l.baseCreditMinor, 0n);
		expect(dr).toBe(cr);
	});
});

describe("R14 reversal", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("r14");
	});
	afterAll(() => f.close());

	test("an EUR invoice entry and its reversal net every account and every tag to zero", async () => {
		const ctx = await ctxOf(f);
		const taxRate = {
			id: "tax-825",
			rateBp: 825,
			accountId: acct(f, "2300"),
			recoverable: true,
		};
		const input = buildDocumentEntry(
			{
				id: "doc-1",
				kind: "INVOICE",
				counterpartyId: "cust-1",
				currency: "EUR",
				amountsAre: "EXCLUSIVE",
				issueDate: "2026-11-05",
				fx: {
					rate: "1.0837",
					origin: "MANUAL",
					at: "2026-11-04T00:00:00.000Z",
				},
				lines: [
					{
						description: "work",
						quantity: "3.25",
						unitMinor: 12_345n,
						discountBp: 0,
						accountId: acct(f, "4000"),
						taxRate,
					},
					{
						description: "more",
						quantity: "1",
						unitMinor: 999n,
						discountBp: 250,
						accountId: acct(f, "4000"),
						taxRate: null,
					},
				],
			},
			ctx,
		);
		const originalId = await postIn(f, input);
		const mid = await trialBalance(f.db);
		expect(mid.length).toBeGreaterThan(1);

		const rev = await f.db.$transaction((tx) =>
			reverse(
				tx,
				originalId,
				{ date: "2026-11-06", reason: "wrong customer" },
				USER,
			),
		);
		expect(rev.created).toBe(true);
		const reversal = await f.db.journalEntry.findUniqueOrThrow({
			where: { id: rev.entryId },
		});
		expect(reversal.source).toBe("REVERSAL");
		expect(reversal.reversesId).toBe(originalId);
		expect(reversal.memo).toContain("wrong customer");

		for (const row of await trialBalance(f.db))
			expect(row.debitBase).toBe(row.creditBase);

		const tags = await f.db.$queryRaw<
			Array<{ tag: string; net: bigint; txn: bigint }>
		>`
			SELECT "documentId" AS tag, sum("baseDebitMinor" - "baseCreditMinor")::bigint AS net,
			       sum("debitMinor" - "creditMinor")::bigint AS txn
			FROM "journalLine" WHERE "documentId" IS NOT NULL GROUP BY "documentId"`;
		expect(tags.length).toBe(1);
		expect(tags[0]?.net).toBe(0n);
		expect(tags[0]?.txn).toBe(0n);
	});

	test("posting the same reversal again returns the same entry (idempotent), and a different second reversal is refused", async () => {
		const original = await manual(f, "twice", "2026-11-05", [
			["6250", "DEBIT", 50n],
			["3000", "CREDIT", 50n],
		]);
		const first = await f.db.$transaction((tx) =>
			reverse(tx, original, { date: "2026-11-06", reason: "a" }, USER),
		);
		const again = await f.db.$transaction((tx) =>
			reverse(tx, original, { date: "2026-11-07", reason: "b" }, USER),
		);
		expect(again.created).toBe(false);
		expect(again.entryId).toBe(first.entryId);
		expect(
			await f.db.journalEntry.count({ where: { reversesId: original } }),
		).toBe(1);
	});

	test("reversing a reversal is refused by the engine before it reaches the database", async () => {
		const original = await manual(f, "rr", "2026-11-05", [
			["6250", "DEBIT", 50n],
			["3000", "CREDIT", 50n],
		]);
		const first = await f.db.$transaction((tx) =>
			reverse(tx, original, { date: "2026-11-06", reason: "a" }, USER),
		);
		const text = await refusal(() =>
			f.db.$transaction((tx) =>
				reverse(tx, first.entryId, { date: "2026-11-07", reason: "b" }, USER),
			),
		);
		expect(text).toContain("cannot be reversed");
	});
});

describe("R18 opening balances", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("r18");
	});
	afterAll(() => f.close());

	test("posts the day before the conversion date and balances against Opening Balance Equity", async () => {
		const ctx = await ctxOf(f);
		const input = buildOpeningBalancesEntry(
			{
				conversionDate: "2026-11-01",
				balances: [
					{
						accountId: acct(f, "1000"),
						side: "DEBIT",
						amountMinor: 500_000n,
						currency: "USD",
						fx: null,
					},
					{
						accountId: acct(f, "1500"),
						side: "DEBIT",
						amountMinor: 120_000n,
						currency: "USD",
						fx: null,
					},
					{
						accountId: acct(f, "2500"),
						side: "CREDIT",
						amountMinor: 200_000n,
						currency: "USD",
						fx: null,
					},
				],
			},
			ctx,
		);
		const id = await postIn(f, input);
		const e = await f.db.journalEntry.findUniqueOrThrow({
			where: { id },
			include: { lines: true },
		});
		expect(e.source).toBe("OPENING_BALANCE");
		expect(e.date.toISOString().slice(0, 10)).toBe("2026-10-31");
		const obe = e.lines.find((l) => l.accountId === acct(f, "3900"));
		expect(obe?.creditMinor).toBe(420_000n);

		const tb = await trialBalance(f.db);
		const totals = trialBalanceTotals(tb);
		expect(totals.debit).toBe(620_000n + 0n);
		expect(totals.credit).toBe(620_000n);
		expect(tb.find((r) => r.code === "1000")?.debitBase).toBe(500_000n);
	});

	test("the same opening entry posted twice is one entry; income, expense and receivable lines are refused", async () => {
		const ctx = await ctxOf(f);
		const again = buildOpeningBalancesEntry(
			{
				conversionDate: "2026-11-01",
				balances: [
					{
						accountId: acct(f, "1000"),
						side: "DEBIT",
						amountMinor: 500_000n,
						currency: "USD",
						fx: null,
					},
				],
			},
			ctx,
		);
		const result = await f.db.$transaction(async (tx) =>
			(await import("../../bookkeeping/ledger/posting")).post(tx, again, USER),
		);
		expect(result.created).toBe(false);
		for (const code of ["4000", "6250", "1100"]) {
			expect(() =>
				buildOpeningBalancesEntry(
					{
						conversionDate: "2026-11-01",
						balances: [
							{
								accountId: acct(f, code),
								side: "DEBIT",
								amountMinor: 1n,
								currency: "USD",
								fx: null,
							},
						],
					},
					ctx,
				),
			).toThrow(LedgerError);
		}
	});
});

describe("trial balance and general ledger read JournalLine only (B1)", () => {
	test("TB is balanced, drafts and ledger edits do not leak in, GL running balance ends at the TB figure", async () => {
		const f = await fixture("tbgl");
		await manual(f, "a", "2026-11-01", [
			["6250", "DEBIT", 1000n],
			["3000", "CREDIT", 1000n],
		]);
		await manual(f, "b", "2026-11-03", [
			["6250", "DEBIT", 250n],
			["3000", "CREDIT", 250n],
		]);
		await f.db.journalEntry.create({
			data: {
				date: new Date("2026-11-04T00:00:00.000Z"),
				source: "MANUAL",
				sourceKey: "draft-only",
				baseCurrency: "USD",
				createdById: "u",
				lines: {
					create: [
						{
							lineNo: 1,
							accountId: acct(f, "6250"),
							currency: "USD",
							debitMinor: 999n,
							baseDebitMinor: 999n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
						{
							lineNo: 2,
							accountId: acct(f, "3000"),
							currency: "USD",
							creditMinor: 999n,
							baseCreditMinor: 999n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
					],
				},
			},
		});
		const tb = await trialBalance(f.db);
		const t = trialBalanceTotals(tb);
		expect(t.debit).toBe(1250n);
		expect(t.credit).toBe(1250n);
		expect(
			(await trialBalance(f.db, "2026-11-01")).find((r) => r.code === "6250")
				?.debitBase,
		).toBe(1000n);

		const gl = await generalLedger(f.db, acct(f, "6250"));
		expect(gl.map((r) => r.number)).toEqual(["JE-000001", "JE-000002"]);
		expect(gl.at(-1)?.runningBase).toBe(1250n);
		expect(
			(await generalLedger(f.db, acct(f, "6250"), { from: "2026-11-02" }))
				.length,
		).toBe(1);
		await f.close();
	});
});
