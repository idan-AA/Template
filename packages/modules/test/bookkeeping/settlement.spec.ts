import { describe, expect, test } from "bun:test";
import {
	buildDocumentEntry,
	buildPaymentEntry,
	convertMinor,
	type DocKind,
	LedgerError,
	type PaymentKind,
	SimLedger,
	settlementBaseMinor,
	sumBig,
} from "../../bookkeeping/engine";
import { doc, exp3, fx, line, makeCtx, RATE_FIELDS } from "./helpers";

function codeOf(fn: () => unknown): string {
	try {
		fn();
	} catch (error) {
		if (error instanceof LedgerError) return error.code;
		throw error;
	}
	return "NO_ERROR";
}

describe("settlementBaseMinor", () => {
	const cases: Array<[string, bigint, bigint, bigint, bigint]> = [
		[
			"the whole remainder takes the whole base",
			10000n,
			10000n,
			11000n,
			11000n,
		],
		["a partial slice rounds half away", 3333n, 10000n, 11000n, 3666n],
		["a tiny slice can be zero", 1n, 3n, 1n, 0n],
		["two thirds of one unit rounds up", 2n, 3n, 1n, 1n],
		["a half rounds up", 1n, 2n, 5n, 3n],
		["a zero base remains zero", 5n, 10n, 0n, 0n],
	];
	for (const [name, allocated, remaining, remainingBase, expected] of cases) {
		test(name, () => {
			expect(
				settlementBaseMinor({
					allocatedMinor: allocated,
					remainingMinor: remaining,
					remainingBaseMinor: remainingBase,
				}),
			).toBe(expected);
		});
	}

	test("refuses more than is open, nothing, and a negative base", () => {
		expect(
			codeOf(() =>
				settlementBaseMinor({
					allocatedMinor: 11n,
					remainingMinor: 10n,
					remainingBaseMinor: 5n,
				}),
			),
		).toBe("OVER_ALLOCATED");
		expect(
			codeOf(() =>
				settlementBaseMinor({
					allocatedMinor: 0n,
					remainingMinor: 10n,
					remainingBaseMinor: 5n,
				}),
			),
		).toBe("INVALID_AMOUNT");
		expect(
			codeOf(() =>
				settlementBaseMinor({
					allocatedMinor: 5n,
					remainingMinor: 10n,
					remainingBaseMinor: -1n,
				}),
			),
		).toBe("INVALID_AMOUNT");
		expect(
			codeOf(() =>
				settlementBaseMinor({
					allocatedMinor: 5n,
					remainingMinor: 0n,
					remainingBaseMinor: 0n,
				}),
			),
		).toBe("OVER_ALLOCATED");
	});

	test("three payments in thirds release exactly the invoice base", () => {
		const ctx = makeCtx("USD");
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(
				doc({
					currency: "EUR",
					fx: fx("1.1"),
					lines: [line("rev", "1", 10000n)],
				}),
				ctx,
			),
		);
		const released: bigint[] = [];
		for (const [index, amount] of [3333n, 3333n, 3334n].entries()) {
			const target = sim.target(
				{ documentId: "d1" },
				"DEBIT",
				amount,
				RATE_FIELDS("1.1"),
			);
			released.push(settlementBaseMinor(target));
			sim.post(
				buildPaymentEntry(
					{
						id: `p${index}`,
						kind: "RECEIPT",
						counterpartyId: "c1",
						date: "2026-11-05",
						currency: "EUR",
						amountMinor: amount,
						bank: { accountId: "bank", currency: "EUR" },
						fx: fx("1.1"),
						targets: [target],
						keepUnallocatedAsCredit: false,
					},
					ctx,
				),
			);
		}
		expect(released).toEqual([3666n, 3666n, 3668n]);
		expect(sumBig(released)).toBe(11000n);
		expect(sim.tagBalance({ documentId: "d1" }, "DEBIT")).toEqual({
			txnMinor: 0n,
			baseMinor: 0n,
		});
	});
});

interface Scenario {
	base: string;
	currency: string;
	docRate: string | null;
	payRates: string[];
	unit: bigint;
}

const SCENARIOS: Scenario[] = [
	{ base: "USD", currency: "USD", docRate: null, payRates: [], unit: 123457n },
	{
		base: "USD",
		currency: "EUR",
		docRate: "1.0834",
		payRates: ["1.0834", "1.1375", "1.0292"],
		unit: 98765n,
	},
	{
		base: "USD",
		currency: "JPY",
		docRate: "0.00667",
		payRates: ["0.00667", "0.00700", "0.00634"],
		unit: 1234567n,
	},
	{
		base: "USD",
		currency: "KWD",
		docRate: "3.2517",
		payRates: ["3.2517", "3.4143", "3.0891"],
		unit: 1234567n,
	},
	{ base: "JPY", currency: "JPY", docRate: null, payRates: [], unit: 7654321n },
	{
		base: "JPY",
		currency: "USD",
		docRate: "149.83",
		payRates: ["149.83", "157.32", "142.34"],
		unit: 123457n,
	},
	{
		base: "JPY",
		currency: "KWD",
		docRate: "487.3",
		payRates: ["487.3", "511.665", "462.935"],
		unit: 1234567n,
	},
];

const SPLITS: number[][] = [
	[10000],
	[3000, 7000],
	[3333, 3333, 3334],
	[1, 9999],
	[5000, 4999, 1],
];

const KINDS: Array<{
	doc: DocKind;
	pay: PaymentKind;
	natural: "DEBIT" | "CREDIT";
}> = [
	{ doc: "INVOICE", pay: "RECEIPT", natural: "DEBIT" },
	{ doc: "BILL", pay: "PAYOUT", natural: "CREDIT" },
];

function settleSplit(
	kind: (typeof KINDS)[number],
	scenario: (typeof SCENARIOS)[number],
	mode: "BANK_IN_DOC_CURRENCY" | "BANK_IN_BASE",
	payRate: string | null,
	split: (typeof SPLITS)[number],
	ctx: ReturnType<typeof makeCtx>,
): void {
	const sim = new SimLedger(ctx);
	const issue = sim.post(
		buildDocumentEntry(
			doc({
				id: "x1",
				kind: kind.doc,
				currency: scenario.currency,
				fx: scenario.docRate ? fx(scenario.docRate) : null,
				lines: [
					line(kind.doc === "INVOICE" ? "rev" : "exp", "1", scenario.unit),
				],
			}),
			ctx,
		),
	);
	const control = issue.lines.find((l) => l.documentId === "x1");
	const invoiceBase = control?.baseAmountMinor ?? 0n;

	let remaining = scenario.unit;
	let bankBaseTotal = 0n;
	for (const [index, part] of split.entries()) {
		const last = index === split.length - 1;
		const amount = last
			? remaining
			: (scenario.unit * BigInt(part)) / 10000n || 1n;
		if (amount <= 0n || amount > remaining) continue;
		const target = sim.target(
			{ documentId: "x1" },
			kind.natural,
			amount,
			RATE_FIELDS(scenario.docRate ?? "1"),
		);
		const payFx = payRate ? fx(payRate) : null;
		const cashBase = payRate
			? convertMinor(amount, scenario.currency, scenario.base, payRate, exp3)
			: amount;
		const entry = buildPaymentEntry(
			{
				id: `pay${index}`,
				kind: kind.pay,
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: scenario.currency,
				amountMinor: amount,
				bank:
					mode === "BANK_IN_BASE"
						? {
								accountId: "bank",
								currency: scenario.base,
								amountMinor: cashBase,
							}
						: { accountId: "bank", currency: scenario.currency },
				fx: payFx,
				targets: [target],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		sim.post(entry);
		bankBaseTotal +=
			entry.lines.find((l) => l.accountId === "bank")?.baseAmountMinor ?? 0n;
		remaining -= amount;
		const open = sim.tagBalance({ documentId: "x1" }, kind.natural);
		expect(open.txnMinor).toBe(remaining);
		expect(open.baseMinor >= 0n).toBe(true);
		if (remaining === 0n) expect(open.baseMinor).toBe(0n);
	}

	expect(sim.tagBalance({ documentId: "x1" }, kind.natural)).toEqual({
		txnMinor: 0n,
		baseMinor: 0n,
	});
	expect(sim.totalDebitBase()).toBe(sim.totalCreditBase());

	const fxBalance = -sim.accountBalance("fx");
	const expected =
		kind.pay === "RECEIPT"
			? bankBaseTotal - invoiceBase
			: invoiceBase - bankBaseTotal;
	expect(fxBalance).toBe(expected);
}

describe("FX settlement matrix", () => {
	for (const kind of KINDS) {
		for (const scenario of SCENARIOS) {
			const modes: Array<"BANK_IN_DOC_CURRENCY" | "BANK_IN_BASE"> =
				scenario.currency === scenario.base
					? ["BANK_IN_BASE"]
					: ["BANK_IN_DOC_CURRENCY", "BANK_IN_BASE"];
			for (const mode of modes) {
				test(`${kind.doc} ${scenario.currency} into ${scenario.base} books, ${mode}`, () => {
					const ctx = makeCtx(scenario.base);
					const rateFactors = scenario.payRates.length
						? scenario.payRates
						: [null];
					for (const payRate of rateFactors) {
						for (const split of SPLITS) {
							settleSplit(kind, scenario, mode, payRate, split, ctx);
						}
					}
				});
			}
		}
	}
});

describe("settlement guards", () => {
	test("two payments cannot both take the same remainder", () => {
		const ctx = makeCtx("USD");
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(doc({ lines: [line("rev", "1", 1000n)] }), ctx),
		);
		const stale = sim.target(
			{ documentId: "d1" },
			"DEBIT",
			800n,
			RATE_FIELDS("1"),
		);
		sim.post(
			buildPaymentEntry(
				{
					id: "a",
					kind: "RECEIPT",
					counterpartyId: "c1",
					date: "2026-11-05",
					currency: "USD",
					amountMinor: 800n,
					bank: { accountId: "bank", currency: "USD" },
					fx: null,
					targets: [stale],
					keepUnallocatedAsCredit: false,
				},
				ctx,
			),
		);
		const fresh = sim.target(
			{ documentId: "d1" },
			"DEBIT",
			800n,
			RATE_FIELDS("1"),
		);
		expect(
			codeOf(() =>
				buildPaymentEntry(
					{
						id: "b",
						kind: "RECEIPT",
						counterpartyId: "c1",
						date: "2026-11-05",
						currency: "USD",
						amountMinor: 800n,
						bank: { accountId: "bank", currency: "USD" },
						fx: null,
						targets: [fresh],
						keepUnallocatedAsCredit: false,
					},
					ctx,
				),
			),
		).toBe("OVER_ALLOCATED");
	});
});
