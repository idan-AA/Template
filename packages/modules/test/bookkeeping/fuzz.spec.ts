import { describe, expect, test } from "bun:test";
import {
	buildApplyCreditEntry,
	buildDocumentEntry,
	buildPaymentEntry,
	buildReversal,
	computeDocument,
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
	sumBig,
	type TaxRateInput,
} from "../../bookkeeping/engine";
import { exp3, fx, makeCtx, NOW, RATE_FIELDS } from "./helpers";

const RUNS = Number(process.env.FUZZ_RUNS ?? 3000);
const SEED = Number(process.env.FUZZ_SEED ?? 20261104);

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
		this.next = mulberry32(seed);
	}
	float(): number {
		return this.next();
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
const CURRENCIES = ["USD", "EUR", "JPY", "GBP", "KWD", "CHF"] as const;
const QUANTITIES = [
	"1",
	"1",
	"1",
	"2",
	"0.5",
	"3.25",
	"1.3333",
	"10",
	"7.5",
	"0.0001",
	"12.3456",
];
const TAX_BPS = [null, null, 0, 500, 825, 1000, 1999, 2000, 7250];
const DOC_KINDS: DocKind[] = [
	"INVOICE",
	"BILL",
	"CREDIT_NOTE",
	"VENDOR_CREDIT",
];

function randomRate(rng: Rng): string {
	const mantissa = rng.int(1, 999_999);
	const places = rng.int(3, 6);
	return new Decimal(mantissa).div(new Decimal(10).pow(places)).toString();
}

function randomTax(
	rng: Rng,
	kind: DocKind,
	index: number,
): TaxRateInput | null {
	const bp = rng.pick(TAX_BPS);
	if (bp === null) return null;
	const sales = kind === "INVOICE" || kind === "CREDIT_NOTE";
	return {
		id: `tr${bp}-${sales ? "s" : "p"}${bp === 7250 ? index % 2 : 0}`,
		rateBp: bp,
		accountId: sales ? "taxpay" : "taxrec",
		recoverable: sales ? true : rng.chance(0.75),
	};
}

function randomDoc(
	rng: Rng,
	id: string,
	base: string,
	kind: DocKind,
): DocumentInput {
	const currency = rng.pick(CURRENCIES);
	const amountsAre = rng.pick(["EXCLUSIVE", "INCLUSIVE", "NO_TAX"] as const);
	const lineCount = rng.int(1, 8);
	const lines: DocLineInput[] = [];
	for (let i = 0; i < lineCount; i++) {
		lines.push({
			description: "item",
			quantity: i === 0 ? "1" : rng.pick(QUANTITIES),
			unitMinor: BigInt(
				i === 0 ? rng.int(1000, 2_000_000) : rng.int(0, 2_000_000),
			),
			discountBp: rng.chance(0.3) ? rng.int(0, 3000) : 0,
			accountId: kind === "INVOICE" || kind === "CREDIT_NOTE" ? "rev" : "exp",
			taxRate: amountsAre === "NO_TAX" ? null : randomTax(rng, kind, i),
		});
	}
	const foreign = currency !== base;
	return {
		id,
		kind,
		counterpartyId: "c1",
		currency,
		amountsAre,
		issueDate: "2026-11-04",
		lines,
		fx: foreign ? fx(randomRate(rng)) : null,
	};
}

function ctxFor(base: string): PostingContext {
	return makeCtx(base);
}

describe(`document fuzz, ${RUNS} documents, seed ${SEED}`, () => {
	test("every random document posts balanced and reverses to zero", () => {
		const rng = new Rng(SEED);
		let posted = 0;
		let refused = 0;
		let withRounding = 0;
		for (let run = 0; run < RUNS; run++) {
			const base = rng.pick(BASES);
			const ctx = ctxFor(base);
			const kind = rng.pick(DOC_KINDS);
			const input = randomDoc(rng, `doc${run}`, base, kind);
			let entry: PostingInput;
			try {
				entry = buildDocumentEntry(input, ctx);
			} catch (error) {
				if (error instanceof LedgerError) {
					refused++;
					continue;
				}
				throw new Error(`seed ${SEED} run ${run}: ${(error as Error).message}`);
			}
			posted++;

			const debit = sumBig(
				entry.lines
					.filter((l) => l.side === "DEBIT")
					.map((l) => l.baseAmountMinor),
			);
			const credit = sumBig(
				entry.lines
					.filter((l) => l.side === "CREDIT")
					.map((l) => l.baseAmountMinor),
			);
			expect(debit).toBe(credit);

			const computed = computeDocument(input, exp3);
			const controlLine = entry.lines.find((l) => l.documentId === input.id);
			expect(controlLine?.amountMinor).toBe(computed.totalMinor);

			const nonRounding = entry.lines.filter((l) => l.kind !== "ROUNDING");
			const txnDebit = sumBig(
				nonRounding.filter((l) => l.side === "DEBIT").map((l) => l.amountMinor),
			);
			const txnCredit = sumBig(
				nonRounding
					.filter((l) => l.side === "CREDIT")
					.map((l) => l.amountMinor),
			);
			expect(txnDebit).toBe(txnCredit);

			const taxLines = sumBig(
				entry.lines.filter((l) => l.kind === "TAX").map((l) => l.amountMinor),
			);
			const rolledIn = sumBig(
				computed.lines
					.filter((l) => l.taxRate && !l.taxRate.recoverable)
					.map((l) => l.taxMinor),
			);
			expect(taxLines + rolledIn).toBe(computed.taxMinor);

			const rounding = entry.lines.filter((l) => l.kind === "ROUNDING");
			if (rounding.length) withRounding++;
			expect(rounding.length).toBeLessThanOrEqual(1);

			const sim = new SimLedger(ctx);
			const first = sim.post(entry);
			const natural = controlLine?.side ?? "DEBIT";
			const open = sim.tagBalance({ documentId: input.id }, natural);
			expect(open.txnMinor).toBe(computed.totalMinor);
			expect(open.baseMinor).toBe(controlLine?.baseAmountMinor ?? -1n);

			sim.post(
				buildReversal(first, { date: "2026-11-05", reason: "fuzz" }, ctx),
			);
			expect(sim.tagBalance({ documentId: input.id }, natural)).toEqual({
				txnMinor: 0n,
				baseMinor: 0n,
			});
			for (const row of sim.trialBalance().values()) {
				expect(row.debitBase).toBe(row.creditBase);
			}
		}
		expect(posted).toBeGreaterThan(RUNS * 0.9);
		expect(posted + refused).toBe(RUNS);
		expect(withRounding).toBeGreaterThan(0);
	});
});

type FuzzDoc = {
	id: string;
	kind: DocKind;
	currency: string;
	rate: string;
	natural: "DEBIT" | "CREDIT";
};

function settleRemaining(
	sim: SimLedger,
	ctx: PostingContext,
	docs: readonly FuzzDoc[],
	rng: Rng,
	run: number,
	base: string,
	currency: string,
): void {
	for (const d of docs) {
		const remaining = sim.tagBalance({ documentId: d.id }, d.natural);
		if (remaining.txnMinor === 0n) continue;
		const payKind: PaymentKind = d.kind === "INVOICE" ? "RECEIPT" : "PAYOUT";
		const payFx: Fx | null = currency === base ? null : fx(randomRate(rng));
		const cash =
			currency === base
				? remaining.txnMinor
				: convertMinor(
						remaining.txnMinor,
						currency,
						base,
						payFx?.rate ?? "1",
						exp3,
					);
		sim.post(
			buildPaymentEntry(
				{
					id: `r${run}final${d.id}`,
					kind: payKind,
					counterpartyId: "c1",
					date: "2026-11-20",
					currency,
					amountMinor: remaining.txnMinor,
					bank:
						currency === base
							? { accountId: "bank", currency }
							: {
									accountId: "bank",
									currency: base,
									amountMinor: cash > 0n ? cash : 1n,
								},
					fx: payFx,
					targets: [
						sim.target(
							{ documentId: d.id },
							d.natural,
							remaining.txnMinor,
							RATE_FIELDS(d.rate),
						),
					],
					keepUnallocatedAsCredit: false,
				},
				ctx,
			),
		);
		expect(sim.tagBalance({ documentId: d.id }, d.natural)).toEqual({
			txnMinor: 0n,
			baseMinor: 0n,
		});
	}
}

function assertLedgerTies(sim: SimLedger): void {
	expect(sim.totalDebitBase()).toBe(sim.totalCreditBase());
	for (const l of sim.allLines()) {
		if (l.accountId === "ar" || l.accountId === "ap") {
			expect(Boolean(l.documentId) || Boolean(l.paymentId)).toBe(true);
		}
	}

	let subLedger = 0n;
	const tags = new Map<string, bigint>();
	for (const l of sim.allLines()) {
		if (l.accountId !== "ar" && l.accountId !== "ap") continue;
		const key = `${l.accountId}:${l.documentId ?? l.paymentId}`;
		const sign = l.side === "DEBIT" ? 1n : -1n;
		tags.set(key, (tags.get(key) ?? 0n) + sign * l.baseAmountMinor);
	}
	for (const value of tags.values()) subLedger += value;
	expect(subLedger).toBe(sim.accountBalance("ar") + sim.accountBalance("ap"));
}

function settlementLedger(rng: Rng, run: number): number {
	let steps = 0;
	const base = rng.pick(BASES);
	const ctx = ctxFor(base);
	const sim = new SimLedger(ctx);
	const docs: Array<{
		id: string;
		kind: DocKind;
		currency: string;
		rate: string;
		natural: "DEBIT" | "CREDIT";
	}> = [];

	const docCount = rng.int(1, 4);
	const currency = rng.pick(CURRENCIES);
	for (let d = 0; d < docCount; d++) {
		const kind: DocKind = rng.chance(0.5) ? "INVOICE" : "BILL";
		const input = {
			...randomDoc(rng, `r${run}d${d}`, base, kind),
			currency,
		};
		input.fx = currency === base ? null : fx(randomRate(rng));
		try {
			const entry = sim.post(buildDocumentEntry(input, ctx));
			const control = entry.lines.find((l) => l.documentId === input.id);
			docs.push({
				id: input.id,
				kind,
				currency,
				rate: control?.fxRate ?? "1",
				natural: control?.side ?? "DEBIT",
			});
		} catch (error) {
			if (!(error instanceof LedgerError)) throw error;
		}
	}
	if (docs.length === 0) return steps;

	const payments: Array<{ id: string; entryIds: string[] }> = [];
	const operations = rng.int(3, 14);
	for (let op = 0; op < operations; op++) {
		steps++;
		const target = rng.pick(docs);
		const open = sim.tagBalance({ documentId: target.id }, target.natural);
		if (open.txnMinor <= 0n) continue;
		const payKind: PaymentKind =
			target.kind === "INVOICE" ? "RECEIPT" : "PAYOUT";
		const portion = rng.chance(0.3)
			? open.txnMinor
			: BigInt(
					rng.int(
						1,
						Number(open.txnMinor > 1_000_000n ? 1_000_000n : open.txnMinor),
					),
				);
		const allocated = portion > open.txnMinor ? open.txnMinor : portion;
		const extra = rng.chance(0.2) ? BigInt(rng.int(1, 5000)) : 0n;
		const amount = allocated + extra;
		const payFx: Fx | null = currency === base ? null : fx(randomRate(rng));
		const bankInBase = currency !== base && rng.chance(0.5);
		const cash =
			currency === base
				? amount
				: convertMinor(amount, currency, base, payFx?.rate ?? "1", exp3);
		const id = `r${run}p${op}`;
		try {
			const entry = buildPaymentEntry(
				{
					id,
					kind: payKind,
					counterpartyId: "c1",
					date: "2026-11-05",
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
						sim.target(
							{ documentId: target.id },
							target.natural,
							allocated,
							RATE_FIELDS(target.rate),
						),
					],
					keepUnallocatedAsCredit: true,
				},
				ctx,
			);
			const posted = sim.post(entry);
			payments.push({ id, entryIds: [posted.id] });
		} catch (error) {
			if (!(error instanceof LedgerError))
				throw new Error(`run ${run} op ${op}: ${(error as Error).message}`);
		}

		const after = sim.tagBalance({ documentId: target.id }, target.natural);
		expect(after.txnMinor >= 0n).toBe(true);
		expect(after.baseMinor >= 0n).toBe(true);
		if (after.txnMinor === 0n) expect(after.baseMinor).toBe(0n);

		if (rng.chance(0.15) && payments.length) {
			const victim = rng.pick(payments);
			const entryId = victim.entryIds[0];
			if (entryId && !sim.isReversed(entryId)) {
				sim.post(
					buildReversal(
						sim.entry(entryId),
						{ date: "2026-11-06", reason: "void" },
						ctx,
					),
				);
			}
		}
	}

	settleRemaining(sim, ctx, docs, rng, run, base, currency);

	assertLedgerTies(sim);
	return steps;
}

describe(`settlement fuzz, ${Math.max(200, RUNS / 6)} ledgers, seed ${SEED}`, () => {
	test("random payments, credits and voids keep the books balanced and the sub ledger tied", () => {
		const rng = new Rng(SEED + 1);
		const ledgers = Math.max(200, Math.floor(RUNS / 6));
		let steps = 0;
		for (let run = 0; run < ledgers; run++) {
			steps += settlementLedger(rng, run);
		}
		expect(steps).toBeGreaterThan(ledgers);
		expect(NOW).toBeTruthy();
	});

	test("random credit applications keep both sides tied", () => {
		const rng = new Rng(SEED + 2);
		const ledgers = Math.max(100, Math.floor(RUNS / 10));
		for (let run = 0; run < ledgers; run++) {
			const base = rng.pick(BASES);
			const ctx = ctxFor(base);
			const sim = new SimLedger(ctx);
			const currency = rng.pick(CURRENCIES);
			const rate = currency === base ? null : randomRate(rng);
			const mk = (id: string, kind: DocKind) =>
				sim.post(
					buildDocumentEntry(
						{
							id,
							kind,
							counterpartyId: "c1",
							currency,
							amountsAre: "NO_TAX",
							issueDate: "2026-11-04",
							lines: [
								{
									description: "x",
									quantity: "1",
									unitMinor: BigInt(rng.int(10_000, 2_000_000)),
									discountBp: 0,
									accountId:
										kind === "INVOICE" || kind === "CREDIT_NOTE"
											? "rev"
											: "exp",
									taxRate: null,
								},
							],
							fx: rate ? fx(rate) : null,
						},
						ctx,
					),
				);
			mk("inv", "INVOICE");
			const creditNoteEntry = mk("cn", "CREDIT_NOTE");
			const invoiceOpen = sim.tagBalance({ documentId: "inv" }, "DEBIT");
			const creditOpen = sim.tagBalance({ documentId: "cn" }, "CREDIT");
			const cap =
				invoiceOpen.txnMinor < creditOpen.txnMinor
					? invoiceOpen.txnMinor
					: creditOpen.txnMinor;
			const chunks = rng.int(1, 4);
			let left = cap;
			for (let c = 0; c < chunks && left > 0n; c++) {
				const amount =
					c === chunks - 1 ? left : BigInt(rng.int(1, Number(left)));
				sim.post(
					buildApplyCreditEntry(
						{
							id: `al${run}-${c}`,
							control: "AR",
							counterpartyId: "c1",
							date: "2026-11-05",
							currency,
							amountMinor: amount,
							credit: sim.target(
								{ documentId: "cn" },
								"CREDIT",
								amount,
								RATE_FIELDS(rate ?? "1"),
							),
							target: sim.target(
								{ documentId: "inv" },
								"DEBIT",
								amount,
								RATE_FIELDS(rate ?? "1"),
							),
						},
						ctx,
					),
				);
				left -= amount;
			}
			expect(sim.totalDebitBase()).toBe(sim.totalCreditBase());
			const invoiceAfter = sim.tagBalance({ documentId: "inv" }, "DEBIT");
			const creditAfter = sim.tagBalance({ documentId: "cn" }, "CREDIT");
			expect(invoiceAfter.txnMinor).toBe(invoiceOpen.txnMinor - cap);
			expect(creditAfter.txnMinor).toBe(creditOpen.txnMinor - cap);
			expect(invoiceAfter.baseMinor >= 0n && creditAfter.baseMinor >= 0n).toBe(
				true,
			);
			if (invoiceAfter.txnMinor === 0n) expect(invoiceAfter.baseMinor).toBe(0n);
			if (creditAfter.txnMinor === 0n) expect(creditAfter.baseMinor).toBe(0n);
			expect(creditNoteEntry.id).toBeTruthy();
		}
	});
});
