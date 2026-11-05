import { describe, expect, setDefaultTimeout, test } from "bun:test";
import {
	buildApplyCreditEntry,
	buildDocumentEntry,
	buildManualJournalEntry,
	buildOpeningBalancesEntry,
	buildPaymentEntry,
	buildReversal,
	convertMinor,
	Decimal,
	type DocKind,
	type DocLineInput,
	type DocumentInput,
	type Fx,
	LedgerError,
	type PaymentKind,
	type PostingContext,
	type PostingInput,
	SimLedger,
	type TaxRateInput,
} from "../../bookkeeping/engine";
import {
	type Actor,
	loadPostingContext,
	post,
} from "../../bookkeeping/ledger/posting";
import {
	trialBalance,
	trialBalanceTotals,
} from "../../bookkeeping/ledger/queries";
import { exp3, fx, RATE_FIELDS } from "./helpers";
import {
	type Fixture,
	fixture,
	observe,
	refusal,
	USER,
} from "./ledger-helpers";

// Each spec clones a database; cloning is slow on some hosts.
setDefaultTimeout(120_000);

// 20 seeds by default; FUZZ_SEEDS=200 is the full CI-grade run.
const SEEDS = Number(process.env.FUZZ_SEEDS ?? 20);
const MAX_OPS = Number(process.env.FUZZ_MAX_OPS ?? 120);

function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

class Rng {
	private next: () => number;
	constructor(seed: number) {
		this.next = mulberry32(seed * 7919 + 13);
	}
	int(min: number, max: number): number {
		return min + Math.floor(this.next() * (max - min + 1));
	}
	pick<T>(items: readonly T[]): T {
		return items[this.int(0, items.length - 1)] as T;
	}
	chance(p: number): boolean {
		return this.next() < p;
	}
}

const BASES = ["USD", "JPY", "EUR"] as const;
const CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CHF"] as const;
const QUANTITIES = [
	"1",
	"1",
	"2",
	"0.5",
	"3.25",
	"1.3333",
	"10",
	"7.5",
	"12.3456",
];
const TAX_BPS = [null, null, 0, 500, 825, 1000, 1999, 2000];
const DOC_KINDS: DocKind[] = [
	"INVOICE",
	"BILL",
	"CREDIT_NOTE",
	"VENDOR_CREDIT",
];
const OPEN_DAY = "2026-11-01";

// extra non-system accounts, ids equal to the engine's symbolic names
const EXTRA = [
	["rev", "INCOME", "REVENUE"],
	["exp", "EXPENSE", "OPERATING_EXPENSE"],
	["exp2", "EXPENSE", "OPERATING_EXPENSE"],
	["bank", "ASSET", "BANK"],
	["taxpay", "LIABILITY", "TAX_LIABILITY"],
	["taxrec", "ASSET", "CURRENT_ASSET"],
	["equity", "EQUITY", "OWNER_EQUITY"],
] as const;

function day(offset: number): string {
	const d = new Date(Date.UTC(2026, 10, 1 + offset));
	return d.toISOString().slice(0, 10);
}

function randomRate(rng: Rng): string {
	return new Decimal(rng.int(1, 999_999))
		.div(new Decimal(10).pow(rng.int(3, 6)))
		.toString();
}

function randomTax(rng: Rng, kind: DocKind): TaxRateInput | null {
	const bp = rng.pick(TAX_BPS);
	if (bp === null) return null;
	const sales = kind === "INVOICE" || kind === "CREDIT_NOTE";
	return {
		id: `tr${bp}-${sales ? "s" : "p"}`,
		rateBp: bp,
		accountId: sales ? "taxpay" : "taxrec",
		recoverable: sales ? true : rng.chance(0.75),
	};
}

interface Doc {
	id: string;
	kind: DocKind;
	rate: string;
	natural: "DEBIT" | "CREDIT";
}

interface World {
	f: Fixture;
	ctx: PostingContext;
	sim: SimLedger;
	dbIds: Map<string, string>;
	soft: string | null;
	hard: string | null;
	stats: {
		posted: number;
		refusedByLock: number;
		overridden: number;
		reversals: number;
		payments: number;
		credits: number;
		manual: number;
		lockMoves: number;
		engineRefused: number;
	};
}

async function makeWorld(base: string): Promise<World> {
	const f = await fixture(`fz${base}`, { base });
	let n = 0;
	for (const [id, type, subtype] of EXTRA) {
		await f.db.ledgerAccount.create({
			data: { id, code: `F${++n}`, name: id, type, subtype },
		});
	}
	const ctx = await f.db.$transaction((tx) =>
		loadPostingContext(tx, "2026-11-04T00:00:00.000Z"),
	);
	return {
		f,
		ctx: { ...ctx, exponent: exp3 },
		sim: new SimLedger({ ...ctx, exponent: exp3 }),
		dbIds: new Map(),
		soft: null,
		hard: null,
		stats: {
			posted: 0,
			refusedByLock: 0,
			overridden: 0,
			reversals: 0,
			payments: 0,
			credits: 0,
			manual: 0,
			lockMoves: 0,
			engineRefused: 0,
		},
	};
}

/** Posts to the database first, applying the lock expectations, then mirrors into the oracle. */
async function submit(
	w: World,
	rng: Rng,
	input: PostingInput,
	simOriginalId?: string,
): Promise<boolean> {
	const locked =
		(w.hard !== null && input.date <= w.hard) ||
		(w.soft !== null && input.date <= w.soft);
	let actor: Actor = USER;
	if (locked && w.hard !== null && input.date > w.hard && rng.chance(0.5)) {
		actor = { ...USER, softLockOverride: true };
	}
	const dbInput: PostingInput = simOriginalId
		? { ...input, reversesId: w.dbIds.get(simOriginalId) ?? null }
		: input;

	const hardHit = w.hard !== null && input.date <= w.hard;
	const softHit = w.soft !== null && input.date <= w.soft;
	const mustRefuse = hardHit || (softHit && !actor.softLockOverride);

	if (mustRefuse) {
		const text = await refusal(() =>
			w.f.db.$transaction((tx) => post(tx, dbInput, actor)),
		);
		expect(text).toContain(
			hardHit ? "hard lock date" : "no override was given",
		);
		w.stats.refusedByLock++;
		return false;
	}
	const result = await w.f.db.$transaction((tx) => post(tx, dbInput, actor));
	expect(result.created).toBe(true);
	const simEntry = w.sim.post(input);
	w.dbIds.set(simEntry.id, result.entryId);
	w.stats.posted++;
	if (softHit) w.stats.overridden++;
	return true;
}

async function compare(w: World, label: string): Promise<void> {
	const tb = await trialBalance(w.f.db);
	const dbMap = new Map(
		tb.map((r) => [r.accountId, `${r.debitBase}/${r.creditBase}`]),
	);
	const simMap = new Map<string, string>();
	for (const [id, row] of w.sim.trialBalance())
		simMap.set(id, `${row.debitBase}/${row.creditBase}`);
	expect(Object.fromEntries([...dbMap].sort()), label).toEqual(
		Object.fromEntries([...simMap].sort()),
	);
	const totals = trialBalanceTotals(tb);
	expect(totals.debit, `${label} TB debits equal credits`).toBe(totals.credit);
	expect(totals.debit).toBe(w.sim.totalDebitBase());

	const q = await w.f.db.$queryRaw<
		Array<{
			posted: bigint;
			unbalanced: bigint;
			short: bigint;
			wrongBase: bigint;
			untagged: bigint;
			maxNo: number;
			cnt: bigint;
		}>
	>`
		SELECT
		  (SELECT count(*) FROM "journalEntry" WHERE "status" = 'POSTED') AS posted,
		  (SELECT count(*) FROM (SELECT e."id" FROM "journalEntry" e JOIN "journalLine" l ON l."entryId" = e."id" WHERE e."status" = 'POSTED' GROUP BY e."id" HAVING sum(l."baseDebitMinor") <> sum(l."baseCreditMinor")) x) AS unbalanced,
		  (SELECT count(*) FROM (SELECT e."id" FROM "journalEntry" e JOIN "journalLine" l ON l."entryId" = e."id" WHERE e."status" = 'POSTED' GROUP BY e."id" HAVING count(*) < 2) x) AS short,
		  (SELECT count(*) FROM "journalEntry" e, "ledgerSettings" s WHERE e."baseCurrency" <> s."baseCurrency") AS "wrongBase",
		  (SELECT count(*) FROM "journalLine" l JOIN "ledgerAccount" a ON a."id" = l."accountId"
		     WHERE a."systemRole" IN ('ACCOUNTS_RECEIVABLE','ACCOUNTS_PAYABLE') AND l."documentId" IS NULL AND l."paymentId" IS NULL) AS untagged,
		  (SELECT coalesce(max(substring("number" from 4)::int), 0) FROM "journalEntry" WHERE "status" = 'POSTED') AS "maxNo",
		  (SELECT count(DISTINCT "number") FROM "journalEntry" WHERE "status" = 'POSTED') AS cnt`;
	const r = q[0];
	expect(Number(r?.posted), `${label} entry count`).toBe(w.sim.entries.length);
	expect(r?.unbalanced, `${label} I1`).toBe(0n);
	expect(r?.short, `${label} I2`).toBe(0n);
	expect(r?.wrongBase, `${label} I11`).toBe(0n);
	expect(r?.untagged, `${label} AR/AP lines carry a tag`).toBe(0n);
	expect(r?.maxNo, `${label} gapless numbers`).toBe(Number(r?.cnt));
}

interface Run {
	w: World;
	rng: Rng;
	seed: number;
	base: string;
	currency: string;
	date: string;
	docs: Doc[];
	counters: { doc: number; pay: number; journal: number };
}

async function opDocument(r: Run): Promise<void> {
	const { w, rng, seed, base, currency, date } = r;
	const kind = rng.pick(DOC_KINDS);
	const id = `s${seed}d${r.counters.doc++}`;
	const amountsAre = rng.pick(["EXCLUSIVE", "INCLUSIVE", "NO_TAX"] as const);
	const lines: DocLineInput[] = [];
	for (let i = 0, n = rng.int(1, 5); i < n; i++) {
		lines.push({
			description: "item",
			quantity: i === 0 ? "1" : rng.pick(QUANTITIES),
			unitMinor: BigInt(rng.int(i === 0 ? 1000 : 0, 2_000_000)),
			discountBp: rng.chance(0.3) ? rng.int(0, 3000) : 0,
			accountId: kind === "INVOICE" || kind === "CREDIT_NOTE" ? "rev" : "exp",
			taxRate: amountsAre === "NO_TAX" ? null : randomTax(rng, kind),
		});
	}
	const rate = currency === base ? null : randomRate(rng);
	const input: DocumentInput = {
		id,
		kind,
		counterpartyId: "c1",
		currency,
		amountsAre,
		issueDate: date,
		lines,
		fx: rate ? fx(rate) : null,
	};
	const entry = buildDocumentEntry(input, w.ctx);
	if (await submit(w, rng, entry)) {
		const control = entry.lines.find((l) => l.documentId === id);
		r.docs.push({
			id,
			kind,
			rate: control?.fxRate ?? "1",
			natural: control?.side ?? "DEBIT",
		});
	}
}

async function opPayment(r: Run): Promise<void> {
	const { w, rng, seed, base, currency, date } = r;
	const payable = r.docs.filter(
		(d) => d.kind === "INVOICE" || d.kind === "BILL",
	);
	if (!payable.length) return;
	const target = rng.pick(payable);
	const open = w.sim.tagBalance({ documentId: target.id }, target.natural);
	if (open.txnMinor <= 0n) return;
	const payKind: PaymentKind = target.kind === "INVOICE" ? "RECEIPT" : "PAYOUT";
	const cap = open.txnMinor > 1_000_000n ? 1_000_000n : open.txnMinor;
	const portion = rng.chance(0.3)
		? open.txnMinor
		: BigInt(rng.int(1, Number(cap)));
	const allocated = portion > open.txnMinor ? open.txnMinor : portion;
	const amount = allocated + (rng.chance(0.2) ? BigInt(rng.int(1, 5000)) : 0n);
	const payFx: Fx | null = currency === base ? null : fx(randomRate(rng));
	const cash =
		currency === base
			? amount
			: convertMinor(amount, currency, base, payFx?.rate ?? "1", exp3);
	const bankInBase = currency !== base && rng.chance(0.5);
	const entry = buildPaymentEntry(
		{
			id: `s${seed}p${r.counters.pay++}`,
			kind: payKind,
			counterpartyId: "c1",
			date,
			currency,
			amountMinor: amount,
			bank: bankInBase
				? {
						accountId: "bank",
						currency: base,
						amountMinor: cash > 0n ? cash : 1n,
					}
				: { accountId: "bank", currency },
			fx: payFx,
			targets: [
				w.sim.target(
					{ documentId: target.id },
					target.natural,
					allocated,
					RATE_FIELDS(target.rate),
				),
			],
			keepUnallocatedAsCredit: true,
		},
		w.ctx,
	);
	if (await submit(w, rng, entry)) w.stats.payments++;
}

async function opCredit(r: Run): Promise<void> {
	const { w, rng, seed, currency, date } = r;
	const pair = rng.chance(0.5)
		? (["INVOICE", "CREDIT_NOTE", "AR"] as const)
		: (["BILL", "VENDOR_CREDIT", "AP"] as const);
	const open = (d: Doc) => w.sim.tagBalance({ documentId: d.id }, d.natural);
	const target = r.docs.find(
		(d) => d.kind === pair[0] && open(d).txnMinor > 0n,
	);
	const credit = r.docs.find(
		(d) => d.kind === pair[1] && open(d).txnMinor > 0n,
	);
	if (!target || !credit) return;
	const t = open(target);
	const c = open(credit);
	const amount = t.txnMinor < c.txnMinor ? t.txnMinor : c.txnMinor;
	const entry = buildApplyCreditEntry(
		{
			id: `s${seed}a${r.counters.pay++}`,
			control: pair[2],
			counterpartyId: "c1",
			date,
			currency,
			amountMinor: amount,
			credit: w.sim.target(
				{ documentId: credit.id },
				credit.natural,
				amount,
				RATE_FIELDS(credit.rate),
			),
			target: w.sim.target(
				{ documentId: target.id },
				target.natural,
				amount,
				RATE_FIELDS(target.rate),
			),
		},
		w.ctx,
	);
	if (await submit(w, rng, entry)) w.stats.credits++;
}

async function opReverse(r: Run): Promise<void> {
	const { w, rng, seed, date } = r;
	const eligible = w.sim.entries.filter(
		(e) => e.source !== "REVERSAL" && !w.sim.isReversed(e.id),
	);
	if (!eligible.length) return;
	const original = rng.pick(eligible);
	const input = buildReversal(
		original,
		{ date, reason: `fuzz ${seed}` },
		w.ctx,
	);
	if (await submit(w, rng, input, original.id)) w.stats.reversals++;
}

async function opManual(r: Run): Promise<void> {
	const { w, rng, seed, base, currency, date } = r;
	const cur = rng.chance(0.5) ? base : currency;
	const amount = BigInt(rng.int(1, 5_000_000));
	const rate = cur === base ? null : randomRate(rng);
	const l = (
		accountId: string,
		side: "DEBIT" | "CREDIT",
		amountMinor = amount,
	) => ({
		accountId,
		side,
		amountMinor,
		currency: cur,
		fx: rate ? fx(rate) : null,
	});
	const lines = rng.chance(0.3)
		? [
				l("exp", "DEBIT"),
				l("exp2", "DEBIT", amount + 7n),
				l("equity", "CREDIT", amount * 2n + 7n),
			]
		: [
				l(rng.pick(["exp", "exp2", "rev"]), "DEBIT"),
				l(rng.pick(["equity", "rev"]), "CREDIT"),
			];
	const adjustment = rng.chance(0.3);
	const input = buildManualJournalEntry(
		{
			id: `s${seed}j${r.counters.journal++}`,
			source: adjustment ? "ADJUSTMENT" : "MANUAL",
			date,
			memo: adjustment ? "adjusting" : null,
			lines,
		},
		w.ctx,
	);
	if (await submit(w, rng, input)) w.stats.manual++;
}

async function opLock(r: Run): Promise<void> {
	const { w, rng, seed } = r;
	const d = day(seed + rng.int(-25, 10));
	if (rng.chance(0.7)) {
		const next = w.soft === null || d > w.soft ? d : w.soft;
		await w.f.db.ledgerSettings.update({
			where: { id: "ledger" },
			data: { lockDate: new Date(`${next}T00:00:00.000Z`) },
		});
		w.soft = next;
	} else if (w.soft !== null) {
		const lo = w.hard ?? day(-60);
		const target = d > w.soft ? w.soft : d < lo ? lo : d;
		await w.f.db.ledgerSettings.update({
			where: { id: "ledger" },
			data: { hardLockDate: new Date(`${target}T00:00:00.000Z`) },
		});
		w.hard = target;
	}
	w.stats.lockMoves++;
}

async function runOp(r: Run, roll: number): Promise<void> {
	if (roll <= 26) await opDocument(r);
	else if (roll <= 50) await opPayment(r);
	else if (roll <= 58) await opCredit(r);
	else if (roll <= 72) await opReverse(r);
	else if (roll <= 90) await opManual(r);
	else if (roll <= 96) await opLock(r);
}

async function openingBalances(r: Run): Promise<void> {
	const { w, rng, base } = r;
	const input = buildOpeningBalancesEntry(
		{
			conversionDate: OPEN_DAY,
			balances: [
				{
					accountId: "bank",
					side: "DEBIT",
					amountMinor: BigInt(rng.int(100_000, 9_000_000)),
					currency: base,
					fx: null,
				},
				{
					accountId: "equity",
					side: "CREDIT",
					amountMinor: BigInt(rng.int(1000, 90_000)),
					currency: base,
					fx: null,
				},
			],
		},
		w.ctx,
	);
	await submit(w, rng, input);
}

async function runSeed(w: World, seed: number, first: boolean): Promise<void> {
	const rng = new Rng(seed);
	const r: Run = {
		w,
		rng,
		seed,
		base: w.ctx.baseCurrency,
		currency: rng.pick(CURRENCIES),
		date: "",
		docs: [],
		counters: { doc: 0, pay: 0, journal: 0 },
	};
	const ops = rng.int(30, MAX_OPS);
	if (first) await openingBalances(r);

	for (let op = 0; op < ops; op++) {
		r.date = day(seed + rng.int(-10, 30));
		try {
			await runOp(r, rng.int(1, 100));
		} catch (error) {
			if (error instanceof LedgerError) {
				w.stats.engineRefused++;
				continue;
			}
			throw new Error(`seed ${seed} op ${op}: ${(error as Error).message}`);
		}
		if (op % 25 === 24) {
			const totals = trialBalanceTotals(await trialBalance(w.f.db));
			expect(totals.debit, `seed ${seed} op ${op}`).toBe(totals.credit);
		}
	}
}

describe(`T4 fuzz against a real Postgres, ${SEEDS} seeds, engine as oracle`, () => {
	test("database trial balance equals the engine's trial balance after every seed", async () => {
		const worlds: World[] = [];
		for (const base of BASES) worlds.push(await makeWorld(base));
		let done = 0;
		const failures: string[] = [];
		await Promise.all(
			worlds.map(async (w, index) => {
				let first = true;
				for (let seed = 1 + index; seed <= SEEDS; seed += BASES.length) {
					try {
						await runSeed(w, seed, first);
						first = false;
						await compare(w, `seed ${seed} base ${w.ctx.baseCurrency}`);
						done++;
					} catch (error) {
						failures.push(
							`seed ${seed} (base ${w.ctx.baseCurrency}) FAILED: ${(error as Error).message}`,
						);
						observe(
							"fuzz.txt",
							`FAILED seed ${seed} base ${w.ctx.baseCurrency}: ${(error as Error).message}\n`,
						);
						return;
					}
				}
			}),
		);
		const total = worlds.reduce(
			(a, w) => ({
				posted: a.posted + w.stats.posted,
				refusedByLock: a.refusedByLock + w.stats.refusedByLock,
				overridden: a.overridden + w.stats.overridden,
				reversals: a.reversals + w.stats.reversals,
				payments: a.payments + w.stats.payments,
				credits: a.credits + w.stats.credits,
				manual: a.manual + w.stats.manual,
				lockMoves: a.lockMoves + w.stats.lockMoves,
				engineRefused: a.engineRefused + w.stats.engineRefused,
			}),
			{
				posted: 0,
				refusedByLock: 0,
				overridden: 0,
				reversals: 0,
				payments: 0,
				credits: 0,
				manual: 0,
				lockMoves: 0,
				engineRefused: 0,
			},
		);
		const summary = `seeds completed: ${done}/${SEEDS}\nentries posted to the database: ${total.posted}\n${JSON.stringify(total)}\n`;
		observe("fuzz.txt", summary);
		console.log(summary);
		for (const w of worlds) await w.f.close();
		expect(failures).toEqual([]);
		expect(done).toBe(SEEDS);
		expect(total.refusedByLock).toBeGreaterThan(0);
		expect(total.overridden).toBeGreaterThan(0);
		expect(total.reversals).toBeGreaterThan(0);
		expect(total.payments).toBeGreaterThan(0);
	}, 1_800_000);
});
