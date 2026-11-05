import { describe, expect, test } from "bun:test";
import * as engine from "../../bookkeeping/engine";
import {
	assertVoidable,
	buildApplyCreditEntry,
	buildBankMoveEntry,
	buildDocumentEntry,
	buildManualJournalEntry,
	buildOpeningBalancesEntry,
	buildParkEntry,
	buildPaymentEntry,
	buildReversal,
	buildTransferEntry,
	buildVoidDocument,
	buildVoidPayment,
	LedgerError,
	type PostingInput,
	SimLedger,
} from "../../bookkeeping/engine";
import {
	doc,
	fx,
	line,
	makeCtx,
	NONREC,
	NOW,
	P825,
	RATE_FIELDS,
	shape,
	T825,
	T1000,
} from "./helpers";

function codeOf(fn: () => unknown): string {
	try {
		fn();
	} catch (error) {
		if (error instanceof LedgerError) return error.code;
		throw error;
	}
	return "NO_ERROR";
}

const ctx = makeCtx("USD");

describe("R1 invoice issue", () => {
	test("exclusive tax, two lines", () => {
		const entry = buildDocumentEntry(
			doc({
				lines: [line("rev", "2", 5000n, T825), line("rev2", "1", 2500n)],
			}),
			ctx,
		);
		expect(entry.source).toBe("INVOICE");
		expect(entry.sourceKey).toBe("invoice:d1:issue");
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|USD 13325|13325|d:d1",
			"NORMAL|rev|CREDIT|USD 10000|10000|t:t825",
			"NORMAL|rev2|CREDIT|USD 2500|2500|",
			"TAX|taxpay|CREDIT|USD 825|825|t:t825",
		]);
		expect(entry.lines.every((l) => l.counterpartyId === "c1")).toBe(true);
	});

	test("inclusive tax", () => {
		const entry = buildDocumentEntry(
			doc({ amountsAre: "INCLUSIVE", lines: [line("rev", "1", 10825n, T825)] }),
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|USD 10825|10825|d:d1",
			"NORMAL|rev|CREDIT|USD 10000|10000|t:t825",
			"TAX|taxpay|CREDIT|USD 825|825|t:t825",
		]);
	});

	test("foreign currency converts every line", () => {
		const entry = buildDocumentEntry(
			doc({
				currency: "EUR",
				fx: fx("1.1"),
				lines: [line("rev", "1", 10000n, T1000)],
			}),
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|EUR 11000|12100|d:d1",
			"NORMAL|rev|CREDIT|EUR 10000|11000|t:t1000",
			"TAX|taxpay|CREDIT|EUR 1000|1100|t:t1000",
		]);
		expect(entry.lines.every((l) => l.fxRate === "1.1")).toBe(true);
	});

	test("a rounding line absorbs conversion drift", () => {
		const entry = buildDocumentEntry(
			doc({
				currency: "EUR",
				fx: fx("1.0005"),
				lines: [line("rev", "1", 3333n), line("rev2", "1", 3333n)],
			}),
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|EUR 6666|6669|d:d1",
			"NORMAL|rev|CREDIT|EUR 3333|3335|",
			"NORMAL|rev2|CREDIT|EUR 3333|3335|",
			"ROUNDING|rnd|DEBIT|USD 1|1|",
		]);
	});

	test("zero decimal currency", () => {
		const entry = buildDocumentEntry(
			doc({
				currency: "JPY",
				fx: fx("0.0067"),
				lines: [line("rev", "1", 10000n)],
			}),
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|JPY 10000|6700|d:d1",
			"NORMAL|rev|CREDIT|JPY 10000|6700|",
		]);
	});

	test("three decimal currency", () => {
		const entry = buildDocumentEntry(
			doc({
				currency: "KWD",
				fx: fx("3.2"),
				lines: [line("rev", "1", 12345n)],
			}),
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|KWD 12345|3950|d:d1",
			"NORMAL|rev|CREDIT|KWD 12345|3950|",
		]);
	});

	test("base currency with zero decimals", () => {
		const entry = buildDocumentEntry(
			doc({
				currency: "USD",
				fx: fx("150"),
				lines: [line("rev", "1", 10000n)],
			}),
			makeCtx("JPY"),
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|USD 10000|15000|d:d1",
			"NORMAL|rev|CREDIT|USD 10000|15000|",
		]);
	});

	test("an opening invoice posts against opening balance equity", () => {
		const entry = buildDocumentEntry(
			doc({ isOpening: true, lines: [line("rev", "1", 5000n)] }),
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|USD 5000|5000|d:d1",
			"NORMAL|obe|CREDIT|USD 5000|5000|",
		]);
	});

	test("a missing rate blocks posting", () => {
		expect(
			codeOf(() =>
				buildDocumentEntry(
					doc({ currency: "EUR", lines: [line("rev", "1", 100n)] }),
					ctx,
				),
			),
		).toBe("MISSING_RATE");
	});

	test("a bad rate blocks posting", () => {
		for (const rate of ["0", "-2", "abc"]) {
			expect(
				codeOf(() =>
					buildDocumentEntry(
						doc({
							currency: "EUR",
							fx: fx(rate),
							lines: [line("rev", "1", 100n)],
						}),
						ctx,
					),
				),
			).toBe("INVALID_RATE");
		}
	});

	test("a base currency document needs no rate", () => {
		expect(
			codeOf(() =>
				buildDocumentEntry(doc({ lines: [line("rev", "1", 100n)] }), ctx),
			),
		).toBe("NO_ERROR");
	});

	test("a free line is dropped from the entry but the entry stays valid", () => {
		const entry = buildDocumentEntry(
			doc({ lines: [line("rev", "1", 1000n), line("rev2", "1", 0n)] }),
			ctx,
		);
		expect(entry.lines).toHaveLength(2);
	});
});

describe("R2 bill issue", () => {
	test("recoverable tax", () => {
		const entry = buildDocumentEntry(
			doc({
				id: "b1",
				kind: "BILL",
				lines: [line("exp", "1", 10000n, P825)],
			}),
			ctx,
		);
		expect(entry.sourceKey).toBe("bill:b1:issue");
		expect(shape(entry)).toEqual([
			"NORMAL|ap|CREDIT|USD 10825|10825|d:b1",
			"NORMAL|exp|DEBIT|USD 10000|10000|t:p825",
			"TAX|taxrec|DEBIT|USD 825|825|t:p825",
		]);
	});

	test("unrecovered tax is rolled into the expense", () => {
		const entry = buildDocumentEntry(
			doc({
				id: "b1",
				kind: "BILL",
				lines: [line("exp", "1", 10000n, NONREC)],
			}),
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ap|CREDIT|USD 10825|10825|d:b1",
			"NORMAL|exp|DEBIT|USD 10825|10825|t:nr",
		]);
	});
});

describe("R3 customer credit note and R4 vendor credit", () => {
	test("credit note mirrors the invoice", () => {
		const entry = buildDocumentEntry(
			doc({
				id: "cn1",
				kind: "CREDIT_NOTE",
				lines: [line("rev", "2", 5000n, T825), line("rev2", "1", 2500n)],
			}),
			ctx,
		);
		expect(entry.sourceKey).toBe("credit_note:cn1:issue");
		expect(shape(entry)).toEqual([
			"NORMAL|ar|CREDIT|USD 13325|13325|d:cn1",
			"NORMAL|rev|DEBIT|USD 10000|10000|t:t825",
			"NORMAL|rev2|DEBIT|USD 2500|2500|",
			"TAX|taxpay|DEBIT|USD 825|825|t:t825",
		]);
	});

	test("vendor credit mirrors the bill", () => {
		const entry = buildDocumentEntry(
			doc({
				id: "vc1",
				kind: "VENDOR_CREDIT",
				lines: [line("exp", "1", 10000n, P825)],
			}),
			ctx,
		);
		expect(entry.sourceKey).toBe("vendor_credit:vc1:issue");
		expect(shape(entry)).toEqual([
			"NORMAL|ap|DEBIT|USD 10825|10825|d:vc1",
			"NORMAL|exp|CREDIT|USD 10000|10000|t:p825",
			"TAX|taxrec|CREDIT|USD 825|825|t:p825",
		]);
	});
});

function ledgerWithInvoice(total = 10000n) {
	const sim = new SimLedger(ctx);
	sim.post(buildDocumentEntry(doc({ lines: [line("rev", "1", total)] }), ctx));
	return sim;
}

describe("R5 customer payment", () => {
	const at = RATE_FIELDS("1");

	test("paid in full", () => {
		const sim = ledgerWithInvoice(13325n);
		const entry = buildPaymentEntry(
			{
				id: "pay1",
				kind: "RECEIPT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 13325n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [sim.target({ documentId: "d1" }, "DEBIT", 13325n, at)],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(entry.sourceKey).toBe("payment:pay1");
		expect(shape(entry)).toEqual([
			"NORMAL|ar|CREDIT|USD 13325|13325|d:d1",
			"NORMAL|bank|DEBIT|USD 13325|13325|",
		]);
	});

	test("partial payment", () => {
		const sim = ledgerWithInvoice(13325n);
		const entry = buildPaymentEntry(
			{
				id: "pay1",
				kind: "RECEIPT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 5000n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [sim.target({ documentId: "d1" }, "DEBIT", 5000n, at)],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|CREDIT|USD 5000|5000|d:d1",
			"NORMAL|bank|DEBIT|USD 5000|5000|",
		]);
	});

	test("overpayment stays as credit on account when confirmed", () => {
		const sim = ledgerWithInvoice(13325n);
		const input = {
			id: "pay1",
			kind: "RECEIPT" as const,
			counterpartyId: "c1",
			date: "2026-11-05",
			currency: "USD",
			amountMinor: 14000n,
			bank: { accountId: "bank", currency: "USD" },
			fx: null,
			targets: [sim.target({ documentId: "d1" }, "DEBIT", 13325n, at)],
			keepUnallocatedAsCredit: true,
		};
		expect(shape(buildPaymentEntry(input, ctx))).toEqual([
			"NORMAL|ar|CREDIT|USD 13325|13325|d:d1",
			"NORMAL|ar|CREDIT|USD 675|675|p:pay1",
			"NORMAL|bank|DEBIT|USD 14000|14000|",
		]);
		expect(
			codeOf(() =>
				buildPaymentEntry({ ...input, keepUnallocatedAsCredit: false }, ctx),
			),
		).toBe("OVERPAYMENT_NOT_CONFIRMED");
	});

	test("a payment with no target is a pure credit on account", () => {
		const entry = buildPaymentEntry(
			{
				id: "pay1",
				kind: "RECEIPT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 700n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [],
				keepUnallocatedAsCredit: true,
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|CREDIT|USD 700|700|p:pay1",
			"NORMAL|bank|DEBIT|USD 700|700|",
		]);
	});

	test("applying more than is open is refused", () => {
		const sim = ledgerWithInvoice(1000n);
		expect(
			codeOf(() =>
				buildPaymentEntry(
					{
						id: "pay1",
						kind: "RECEIPT",
						counterpartyId: "c1",
						date: "2026-11-05",
						currency: "USD",
						amountMinor: 2000n,
						bank: { accountId: "bank", currency: "USD" },
						fx: null,
						targets: [sim.target({ documentId: "d1" }, "DEBIT", 2000n, at)],
						keepUnallocatedAsCredit: true,
					},
					ctx,
				),
			),
		).toBe("OVER_ALLOCATED");
	});

	test("allocating more than the payment is refused", () => {
		const sim = ledgerWithInvoice(5000n);
		expect(
			codeOf(() =>
				buildPaymentEntry(
					{
						id: "pay1",
						kind: "RECEIPT",
						counterpartyId: "c1",
						date: "2026-11-05",
						currency: "USD",
						amountMinor: 1000n,
						bank: { accountId: "bank", currency: "USD" },
						fx: null,
						targets: [sim.target({ documentId: "d1" }, "DEBIT", 4000n, at)],
						keepUnallocatedAsCredit: true,
					},
					ctx,
				),
			),
		).toBe("OVER_ALLOCATED");
	});

	test("a target must name exactly one of document or payment", () => {
		const sim = ledgerWithInvoice(5000n);
		const good = sim.target({ documentId: "d1" }, "DEBIT", 1000n, at);
		for (const bad of [
			{ ...good, documentId: null, paymentId: null },
			{ ...good, paymentId: "x" },
		]) {
			expect(
				codeOf(() =>
					buildPaymentEntry(
						{
							id: "pay1",
							kind: "RECEIPT",
							counterpartyId: "c1",
							date: "2026-11-05",
							currency: "USD",
							amountMinor: 1000n,
							bank: { accountId: "bank", currency: "USD" },
							fx: null,
							targets: [bad],
							keepUnallocatedAsCredit: false,
						},
						ctx,
					),
				),
			).toBe("INVALID_TARGET");
		}
	});

	test("foreign payment into a base currency bank books the gain or loss", () => {
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
		const first = buildPaymentEntry(
			{
				id: "pay1",
				kind: "RECEIPT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "EUR",
				amountMinor: 4000n,
				bank: { accountId: "bank", currency: "USD", amountMinor: 4800n },
				fx: fx("1.2"),
				targets: [
					sim.target({ documentId: "d1" }, "DEBIT", 4000n, RATE_FIELDS("1.1")),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(shape(first)).toEqual([
			"NORMAL|ar|CREDIT|EUR 4000|4400|d:d1",
			"NORMAL|bank|DEBIT|USD 4800|4800|",
			"FX_ADJUSTMENT|fx|CREDIT|USD 400|400|",
		]);
		sim.post(first);
		const second = buildPaymentEntry(
			{
				id: "pay2",
				kind: "RECEIPT",
				counterpartyId: "c1",
				date: "2026-11-06",
				currency: "EUR",
				amountMinor: 6000n,
				bank: { accountId: "bank", currency: "USD", amountMinor: 6000n },
				fx: fx("1"),
				targets: [
					sim.target({ documentId: "d1" }, "DEBIT", 6000n, RATE_FIELDS("1.1")),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(shape(second)).toEqual([
			"NORMAL|ar|CREDIT|EUR 6000|6600|d:d1",
			"NORMAL|bank|DEBIT|USD 6000|6000|",
			"FX_ADJUSTMENT|fx|DEBIT|USD 600|600|",
		]);
		sim.post(second);
		expect(sim.tagBalance({ documentId: "d1" }, "DEBIT")).toEqual({
			txnMinor: 0n,
			baseMinor: 0n,
		});
	});

	test("a bank in the payment currency converts at the payment rate", () => {
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
		const entry = buildPaymentEntry(
			{
				id: "pay1",
				kind: "RECEIPT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "EUR",
				amountMinor: 10000n,
				bank: { accountId: "bank", currency: "EUR" },
				fx: fx("1.15"),
				targets: [
					sim.target({ documentId: "d1" }, "DEBIT", 10000n, RATE_FIELDS("1.1")),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|CREDIT|EUR 10000|11000|d:d1",
			"NORMAL|bank|DEBIT|EUR 10000|11500|",
			"FX_ADJUSTMENT|fx|CREDIT|USD 500|500|",
		]);
	});

	test("a foreign payment needs its own rate and a usable bank", () => {
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
		const base = {
			id: "pay1",
			kind: "RECEIPT" as const,
			counterpartyId: "c1",
			date: "2026-11-05",
			currency: "EUR",
			amountMinor: 10000n,
			targets: [
				sim.target({ documentId: "d1" }, "DEBIT", 10000n, RATE_FIELDS("1.1")),
			],
			keepUnallocatedAsCredit: false,
		};
		expect(
			codeOf(() =>
				buildPaymentEntry(
					{ ...base, bank: { accountId: "bank", currency: "EUR" }, fx: null },
					ctx,
				),
			),
		).toBe("MISSING_RATE");
		expect(
			codeOf(() =>
				buildPaymentEntry(
					{
						...base,
						bank: { accountId: "bank", currency: "USD" },
						fx: fx("1.1"),
					},
					ctx,
				),
			),
		).toBe("BANK_AMOUNT_REQUIRED");
		expect(
			codeOf(() =>
				buildPaymentEntry(
					{
						...base,
						bank: { accountId: "bank", currency: "GBP" },
						fx: fx("1.1"),
					},
					ctx,
				),
			),
		).toBe("BANK_CURRENCY_UNSUPPORTED");
	});
});

describe("R6 vendor payment", () => {
	test("bill paid in full", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(
				doc({
					id: "b1",
					kind: "BILL",
					lines: [line("exp", "1", 10000n, P825)],
				}),
				ctx,
			),
		);
		const entry = buildPaymentEntry(
			{
				id: "pay1",
				kind: "PAYOUT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 10825n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [
					sim.target({ documentId: "b1" }, "CREDIT", 10825n, RATE_FIELDS("1")),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ap|DEBIT|USD 10825|10825|d:b1",
			"NORMAL|bank|CREDIT|USD 10825|10825|",
		]);
	});

	test("an unapplied prepayment sits on the payable", () => {
		const entry = buildPaymentEntry(
			{
				id: "pay9",
				kind: "PAYOUT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 3000n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [],
				keepUnallocatedAsCredit: true,
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ap|DEBIT|USD 3000|3000|p:pay9",
			"NORMAL|bank|CREDIT|USD 3000|3000|",
		]);
	});
});

describe("R7 and R8 refunds", () => {
	test("customer refund consumes a credit note", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(
				doc({
					id: "cn1",
					kind: "CREDIT_NOTE",
					lines: [line("rev", "1", 13325n)],
				}),
				ctx,
			),
		);
		const entry = buildPaymentEntry(
			{
				id: "ref1",
				kind: "CUSTOMER_REFUND",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 13325n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [
					sim.target({ documentId: "cn1" }, "CREDIT", 13325n, RATE_FIELDS("1")),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|USD 13325|13325|d:cn1",
			"NORMAL|bank|CREDIT|USD 13325|13325|",
		]);
		sim.post(entry);
		expect(sim.tagBalance({ documentId: "cn1" }, "CREDIT").txnMinor).toBe(0n);
	});

	test("vendor refund consumes a vendor credit", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(
				doc({
					id: "vc1",
					kind: "VENDOR_CREDIT",
					lines: [line("exp", "1", 10825n)],
				}),
				ctx,
			),
		);
		const entry = buildPaymentEntry(
			{
				id: "ref2",
				kind: "VENDOR_REFUND",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 10825n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [
					sim.target({ documentId: "vc1" }, "DEBIT", 10825n, RATE_FIELDS("1")),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ap|CREDIT|USD 10825|10825|d:vc1",
			"NORMAL|bank|DEBIT|USD 10825|10825|",
		]);
	});

	test("a refund cannot leave an unapplied remainder", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(
				doc({
					id: "cn1",
					kind: "CREDIT_NOTE",
					lines: [line("rev", "1", 1000n)],
				}),
				ctx,
			),
		);
		expect(
			codeOf(() =>
				buildPaymentEntry(
					{
						id: "ref1",
						kind: "CUSTOMER_REFUND",
						counterpartyId: "c1",
						date: "2026-11-05",
						currency: "USD",
						amountMinor: 1500n,
						bank: { accountId: "bank", currency: "USD" },
						fx: null,
						targets: [
							sim.target(
								{ documentId: "cn1" },
								"CREDIT",
								1000n,
								RATE_FIELDS("1"),
							),
						],
						keepUnallocatedAsCredit: true,
					},
					ctx,
				),
			),
		).toBe("UNALLOCATED_NOT_ALLOWED");
	});
});

describe("R9 apply credit", () => {
	test("credit note applied to an invoice", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(doc({ lines: [line("rev", "1", 13325n)] }), ctx),
		);
		sim.post(
			buildDocumentEntry(
				doc({
					id: "cn1",
					kind: "CREDIT_NOTE",
					lines: [line("rev", "1", 13325n)],
				}),
				ctx,
			),
		);
		const entry = buildApplyCreditEntry(
			{
				id: "al1",
				control: "AR",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 5000n,
				credit: sim.target(
					{ documentId: "cn1" },
					"CREDIT",
					5000n,
					RATE_FIELDS("1"),
				),
				target: sim.target(
					{ documentId: "d1" },
					"DEBIT",
					5000n,
					RATE_FIELDS("1"),
				),
			},
			ctx,
		);
		expect(entry.sourceKey).toBe("allocation:al1");
		expect(shape(entry)).toEqual([
			"NORMAL|ar|DEBIT|USD 5000|5000|d:cn1",
			"NORMAL|ar|CREDIT|USD 5000|5000|d:d1",
		]);
		sim.post(entry);
		expect(sim.tagBalance({ documentId: "d1" }, "DEBIT").txnMinor).toBe(8325n);
		expect(sim.tagBalance({ documentId: "cn1" }, "CREDIT").txnMinor).toBe(
			8325n,
		);
	});

	test("vendor credit applied to a bill", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(
				doc({ id: "b1", kind: "BILL", lines: [line("exp", "1", 10000n)] }),
				ctx,
			),
		);
		sim.post(
			buildDocumentEntry(
				doc({
					id: "vc1",
					kind: "VENDOR_CREDIT",
					lines: [line("exp", "1", 3000n)],
				}),
				ctx,
			),
		);
		const entry = buildApplyCreditEntry(
			{
				id: "al2",
				control: "AP",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "USD",
				amountMinor: 3000n,
				credit: sim.target(
					{ documentId: "vc1" },
					"DEBIT",
					3000n,
					RATE_FIELDS("1"),
				),
				target: sim.target(
					{ documentId: "b1" },
					"CREDIT",
					3000n,
					RATE_FIELDS("1"),
				),
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|ap|CREDIT|USD 3000|3000|d:vc1",
			"NORMAL|ap|DEBIT|USD 3000|3000|d:b1",
		]);
	});

	test("an overpayment credit can be applied later", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(doc({ lines: [line("rev", "1", 1000n)] }), ctx),
		);
		sim.post(
			buildPaymentEntry(
				{
					id: "pay1",
					kind: "RECEIPT",
					counterpartyId: "c1",
					date: "2026-11-05",
					currency: "USD",
					amountMinor: 400n,
					bank: { accountId: "bank", currency: "USD" },
					fx: null,
					targets: [],
					keepUnallocatedAsCredit: true,
				},
				ctx,
			),
		);
		const entry = buildApplyCreditEntry(
			{
				id: "al3",
				control: "AR",
				counterpartyId: "c1",
				date: "2026-11-06",
				currency: "USD",
				amountMinor: 400n,
				credit: sim.target(
					{ paymentId: "pay1" },
					"CREDIT",
					400n,
					RATE_FIELDS("1"),
				),
				target: sim.target(
					{ documentId: "d1" },
					"DEBIT",
					400n,
					RATE_FIELDS("1"),
				),
			},
			ctx,
		);
		sim.post(entry);
		expect(sim.tagBalance({ paymentId: "pay1" }, "CREDIT").txnMinor).toBe(0n);
		expect(sim.tagBalance({ documentId: "d1" }, "DEBIT").txnMinor).toBe(600n);
	});

	test("applying more than either side holds is refused", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(doc({ lines: [line("rev", "1", 1000n)] }), ctx),
		);
		sim.post(
			buildDocumentEntry(
				doc({
					id: "cn1",
					kind: "CREDIT_NOTE",
					lines: [line("rev", "1", 300n)],
				}),
				ctx,
			),
		);
		expect(
			codeOf(() =>
				buildApplyCreditEntry(
					{
						id: "al4",
						control: "AR",
						counterpartyId: "c1",
						date: "2026-11-05",
						currency: "USD",
						amountMinor: 500n,
						credit: sim.target(
							{ documentId: "cn1" },
							"CREDIT",
							500n,
							RATE_FIELDS("1"),
						),
						target: sim.target(
							{ documentId: "d1" },
							"DEBIT",
							500n,
							RATE_FIELDS("1"),
						),
					},
					ctx,
				),
			),
		).toBe("OVER_ALLOCATED");
	});
});

describe("R10 unapply and R14 reversal", () => {
	function invoiceEntry() {
		const sim = new SimLedger(ctx);
		const entry = sim.post(
			buildDocumentEntry(doc({ lines: [line("rev", "2", 5000n, T825)] }), ctx),
		);
		return { sim, entry };
	}

	test("mirrors every line and copies the base amounts", () => {
		const { entry } = invoiceEntry();
		const reversal = buildReversal(
			entry,
			{ date: "2026-11-06", reason: "wrong customer" },
			ctx,
		);
		expect(reversal.source).toBe("REVERSAL");
		expect(reversal.reversesId).toBe(entry.id);
		expect(reversal.sourceKey).toBe(`reversal:${entry.id}`);
		expect(reversal.memo).toBe("Reversal of JE-000001: wrong customer");
		expect(shape(reversal)).toEqual([
			"NORMAL|ar|CREDIT|USD 10825|10825|d:d1",
			"NORMAL|rev|DEBIT|USD 10000|10000|t:t825",
			"TAX|taxpay|DEBIT|USD 825|825|t:t825",
		]);
	});

	test("base amounts are copied, not re-converted at a new rate", () => {
		const sim = new SimLedger(ctx);
		const entry = sim.post(
			buildDocumentEntry(
				doc({
					currency: "EUR",
					fx: fx("1.1"),
					lines: [line("rev", "1", 10000n)],
				}),
				ctx,
			),
		);
		const reversal = buildReversal(
			entry,
			{ date: "2026-11-06", reason: "x" },
			ctx,
		);
		sim.post(reversal);
		expect(sim.tagBalance({ documentId: "d1" }, "DEBIT")).toEqual({
			txnMinor: 0n,
			baseMinor: 0n,
		});
	});

	test("a reversal cannot be reversed", () => {
		const { sim, entry } = invoiceEntry();
		const posted = sim.post(
			buildReversal(entry, { date: "2026-11-06", reason: "x" }, ctx),
		);
		expect(
			codeOf(() =>
				buildReversal(posted, { date: "2026-11-07", reason: "y" }, ctx),
			),
		).toBe("REVERSAL_OF_REVERSAL");
	});

	test("an entry reverses once", () => {
		const { sim, entry } = invoiceEntry();
		sim.post(buildReversal(entry, { date: "2026-11-06", reason: "x" }, ctx));
		expect(
			codeOf(() =>
				buildReversal(
					entry,
					{
						date: "2026-11-07",
						reason: "y",
						alreadyReversed: sim.isReversed(entry.id),
					},
					ctx,
				),
			),
		).toBe("ALREADY_REVERSED");
	});

	test("a reason is required", () => {
		const { entry } = invoiceEntry();
		expect(
			codeOf(() =>
				buildReversal(entry, { date: "2026-11-06", reason: "   " }, ctx),
			),
		).toBe("MEMO_REQUIRED");
	});

	test("the same reversal posted twice is one entry", () => {
		const { sim, entry } = invoiceEntry();
		const input = buildReversal(
			entry,
			{ date: "2026-11-06", reason: "x" },
			ctx,
		);
		const first = sim.post(input);
		const again = sim.post(input);
		expect(again.id).toBe(first.id);
		expect(sim.entries).toHaveLength(2);
	});
});

describe("R15 void document", () => {
	const issued = {
		id: "d1",
		status: "ISSUED" as const,
		totalMinor: 100n,
		balanceMinor: 100n,
	};

	test("only an untouched issued document can be voided", () => {
		expect(codeOf(() => assertVoidable(issued))).toBe("NO_ERROR");
		expect(codeOf(() => assertVoidable({ ...issued, status: "DRAFT" }))).toBe(
			"DOCUMENT_NOT_ISSUED",
		);
		expect(codeOf(() => assertVoidable({ ...issued, status: "VOID" }))).toBe(
			"DOCUMENT_NOT_ISSUED",
		);
		expect(codeOf(() => assertVoidable({ ...issued, balanceMinor: 40n }))).toBe(
			"DOCUMENT_HAS_SETTLEMENTS",
		);
		expect(codeOf(() => assertVoidable({ ...issued, balanceMinor: 0n }))).toBe(
			"DOCUMENT_HAS_SETTLEMENTS",
		);
	});

	test("voiding reverses the issue entry and zeroes the open balance", () => {
		const sim = new SimLedger(ctx);
		const entry = sim.post(
			buildDocumentEntry(doc({ lines: [line("rev", "1", 100n)] }), ctx),
		);
		const reversal = buildVoidDocument(
			issued,
			entry,
			{ date: "2026-11-06", reason: "duplicate" },
			ctx,
		);
		sim.post(reversal);
		expect(sim.tagBalance({ documentId: "d1" }, "DEBIT").txnMinor).toBe(0n);
		expect(
			codeOf(() =>
				buildVoidDocument(
					{ ...issued, balanceMinor: 1n },
					entry,
					{ date: "2026-11-06", reason: "x" },
					ctx,
				),
			),
		).toBe("DOCUMENT_HAS_SETTLEMENTS");
	});
});

describe("R16 void payment", () => {
	test("reverses the payment entry and its allocation entries", () => {
		const sim = new SimLedger(ctx);
		sim.post(
			buildDocumentEntry(doc({ lines: [line("rev", "1", 1000n)] }), ctx),
		);
		const payment = sim.post(
			buildPaymentEntry(
				{
					id: "pay1",
					kind: "RECEIPT",
					counterpartyId: "c1",
					date: "2026-11-05",
					currency: "USD",
					amountMinor: 1500n,
					bank: { accountId: "bank", currency: "USD" },
					fx: null,
					targets: [
						sim.target({ documentId: "d1" }, "DEBIT", 1000n, RATE_FIELDS("1")),
					],
					keepUnallocatedAsCredit: true,
				},
				ctx,
			),
		);
		const reversals = buildVoidPayment(
			payment,
			[],
			{ date: "2026-11-06", reason: "returned" },
			ctx,
		);
		expect(reversals).toHaveLength(1);
		for (const reversal of reversals) sim.post(reversal);
		expect(sim.tagBalance({ documentId: "d1" }, "DEBIT").txnMinor).toBe(1000n);
		expect(sim.tagBalance({ paymentId: "pay1" }, "CREDIT").txnMinor).toBe(0n);
		expect(sim.accountBalance("bank")).toBe(0n);
	});
});

describe("R11 and R12 bank movements", () => {
	const base = {
		key: "k1",
		bankAccountId: "bank",
		bankCurrency: "USD",
		date: "2026-11-05",
		fx: null,
	};

	test("spend with recoverable tax", () => {
		const entry = buildBankMoveEntry(
			{
				...base,
				direction: "OUT",
				amountMinor: 10825n,
				splits: [{ accountId: "exp", grossMinor: 10825n, taxRate: P825 }],
			},
			ctx,
		);
		expect(entry.source).toBe("BANK_SPEND");
		expect(entry.sourceKey).toBe("bank:bank:k1");
		expect(shape(entry)).toEqual([
			"NORMAL|bank|CREDIT|USD 10825|10825|",
			"NORMAL|exp|DEBIT|USD 10000|10000|t:p825",
			"TAX|taxrec|DEBIT|USD 825|825|t:p825",
		]);
	});

	test("spend split across two accounts with unrecovered tax on one", () => {
		const entry = buildBankMoveEntry(
			{
				...base,
				direction: "OUT",
				amountMinor: 20000n,
				splits: [
					{ accountId: "exp", grossMinor: 5000n, taxRate: null },
					{ accountId: "exp2", grossMinor: 15000n, taxRate: NONREC },
				],
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|bank|CREDIT|USD 20000|20000|",
			"NORMAL|exp|DEBIT|USD 5000|5000|",
			"NORMAL|exp2|DEBIT|USD 15000|15000|t:nr",
		]);
	});

	test("receive money with sales tax", () => {
		const entry = buildBankMoveEntry(
			{
				...base,
				direction: "IN",
				amountMinor: 10825n,
				splits: [{ accountId: "rev", grossMinor: 10825n, taxRate: T825 }],
			},
			ctx,
		);
		expect(entry.source).toBe("BANK_RECEIVE");
		expect(shape(entry)).toEqual([
			"NORMAL|bank|DEBIT|USD 10825|10825|",
			"NORMAL|rev|CREDIT|USD 10000|10000|t:t825",
			"TAX|taxpay|CREDIT|USD 825|825|t:t825",
		]);
	});

	test("unrecovered tax on money received is refused", () => {
		expect(
			codeOf(() =>
				buildBankMoveEntry(
					{
						...base,
						direction: "IN",
						amountMinor: 100n,
						splits: [{ accountId: "rev", grossMinor: 100n, taxRate: NONREC }],
					},
					ctx,
				),
			),
		).toBe("INVALID_TAX");
	});

	test("splits must add up to the bank line", () => {
		for (const splits of [
			[{ accountId: "exp", grossMinor: 900n, taxRate: null }],
			[
				{ accountId: "exp", grossMinor: 600n, taxRate: null },
				{ accountId: "exp2", grossMinor: 500n, taxRate: null },
			],
			[],
		]) {
			expect(
				codeOf(() =>
					buildBankMoveEntry(
						{ ...base, direction: "OUT", amountMinor: 1000n, splits },
						ctx,
					),
				),
			).toBe("SPLIT_MISMATCH");
		}
	});

	test("parking sends the whole line to the suspense account", () => {
		const entry = buildParkEntry(
			{ ...base, direction: "OUT", amountMinor: 4200n },
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|bank|CREDIT|USD 4200|4200|",
			"NORMAL|susp|DEBIT|USD 4200|4200|",
		]);
	});

	test("a foreign bank account converts at the line rate", () => {
		const entry = buildBankMoveEntry(
			{
				...base,
				bankCurrency: "EUR",
				fx: fx("1.1"),
				direction: "OUT",
				amountMinor: 10000n,
				splits: [{ accountId: "exp", grossMinor: 10000n, taxRate: null }],
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|bank|CREDIT|EUR 10000|11000|",
			"NORMAL|exp|DEBIT|EUR 10000|11000|",
		]);
	});
});

describe("R13 transfer", () => {
	const input = {
		key: "t1",
		fromAccountId: "bank",
		fromCurrency: "USD",
		toAccountId: "bank2",
		toCurrency: "USD",
		amountMinor: 5000n,
		date: "2026-11-05",
		fx: null,
	};

	test("moves money between two accounts", () => {
		const entry = buildTransferEntry(input, ctx);
		expect(entry.source).toBe("TRANSFER");
		expect(shape(entry)).toEqual([
			"NORMAL|bank2|DEBIT|USD 5000|5000|",
			"NORMAL|bank|CREDIT|USD 5000|5000|",
		]);
	});

	test("refuses different currencies and the same account", () => {
		expect(
			codeOf(() => buildTransferEntry({ ...input, toCurrency: "EUR" }, ctx)),
		).toBe("CROSS_CURRENCY_TRANSFER");
		expect(
			codeOf(() => buildTransferEntry({ ...input, toAccountId: "bank" }, ctx)),
		).toBe("INVALID_TARGET");
	});

	test("a foreign transfer converts both sides at one rate", () => {
		const entry = buildTransferEntry(
			{ ...input, fromCurrency: "EUR", toCurrency: "EUR", fx: fx("1.1") },
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|bank2|DEBIT|EUR 5000|5500|",
			"NORMAL|bank|CREDIT|EUR 5000|5500|",
		]);
	});
});

describe("R17 manual journal", () => {
	const lines = [
		{
			accountId: "exp",
			side: "DEBIT" as const,
			amountMinor: 1000n,
			currency: "USD",
			fx: null,
		},
		{
			accountId: "equity",
			side: "CREDIT" as const,
			amountMinor: 1000n,
			currency: "USD",
			fx: null,
		},
	];

	test("a plain journal", () => {
		const entry = buildManualJournalEntry(
			{
				id: "j1",
				source: "MANUAL",
				date: "2026-11-05",
				memo: "accrual",
				lines,
			},
			ctx,
		);
		expect(entry.sourceKey).toBe("manual:j1");
		expect(shape(entry)).toEqual([
			"NORMAL|exp|DEBIT|USD 1000|1000|",
			"NORMAL|equity|CREDIT|USD 1000|1000|",
		]);
	});

	test("control accounts are off limits", () => {
		for (const forbidden of ["ar", "ap", "bank", "bank2", "card"]) {
			expect(
				codeOf(() =>
					buildManualJournalEntry(
						{
							id: "j1",
							source: "MANUAL",
							date: "2026-11-05",
							memo: null,
							lines: [{ ...lines[0]!, accountId: forbidden }, lines[1]!],
						},
						ctx,
					),
				),
			).toBe("MANUAL_JOURNAL_FORBIDDEN_ACCOUNT");
		}
	});

	test("an adjustment needs a memo", () => {
		for (const memo of [null, "", "   "]) {
			expect(
				codeOf(() =>
					buildManualJournalEntry(
						{ id: "j1", source: "ADJUSTMENT", date: "2026-11-05", memo, lines },
						ctx,
					),
				),
			).toBe("MEMO_REQUIRED");
		}
		expect(
			codeOf(() =>
				buildManualJournalEntry(
					{
						id: "j1",
						source: "ADJUSTMENT",
						date: "2026-11-05",
						memo: "depreciation",
						lines,
					},
					ctx,
				),
			),
		).toBe("NO_ERROR");
	});

	test("an unbalanced journal is refused", () => {
		expect(
			codeOf(() =>
				buildManualJournalEntry(
					{
						id: "j1",
						source: "MANUAL",
						date: "2026-11-05",
						memo: null,
						lines: [lines[0]!, { ...lines[1]!, amountMinor: 900n }],
					},
					ctx,
				),
			),
		).toBe("UNBALANCED");
	});

	test("an archived or unknown account is refused", () => {
		expect(
			codeOf(() =>
				buildManualJournalEntry(
					{
						id: "j1",
						source: "MANUAL",
						date: "2026-11-05",
						memo: null,
						lines: [{ ...lines[0]!, accountId: "old" }, lines[1]!],
					},
					ctx,
				),
			),
		).toBe("ARCHIVED_ACCOUNT");
		expect(
			codeOf(() =>
				buildManualJournalEntry(
					{
						id: "j1",
						source: "MANUAL",
						date: "2026-11-05",
						memo: null,
						lines: [{ ...lines[0]!, accountId: "nope" }, lines[1]!],
					},
					ctx,
				),
			),
		).toBe("INVALID_LINE");
	});

	test("account details are required to check the rules", () => {
		expect(
			codeOf(() =>
				buildManualJournalEntry(
					{ id: "j1", source: "MANUAL", date: "2026-11-05", memo: null, lines },
					makeCtx("USD", { accounts: false }),
				),
			),
		).toBe("ACCOUNTS_REQUIRED");
	});

	test("lines in two currencies balance in base", () => {
		const entry = buildManualJournalEntry(
			{
				id: "j1",
				source: "MANUAL",
				date: "2026-11-05",
				memo: null,
				lines: [
					{
						accountId: "exp",
						side: "DEBIT",
						amountMinor: 1000n,
						currency: "EUR",
						fx: fx("1.1"),
					},
					{
						accountId: "equity",
						side: "CREDIT",
						amountMinor: 1100n,
						currency: "USD",
						fx: null,
					},
				],
			},
			ctx,
		);
		expect(shape(entry)).toEqual([
			"NORMAL|exp|DEBIT|EUR 1000|1100|",
			"NORMAL|equity|CREDIT|USD 1100|1100|",
		]);
	});
});

describe("R18 opening balances", () => {
	const line = (
		accountId: string,
		side: "DEBIT" | "CREDIT",
		amountMinor: bigint,
	) => ({
		accountId,
		side,
		amountMinor,
		currency: "USD",
		fx: null,
	});

	test("balancing figure goes to opening balance equity, dated the day before", () => {
		const entry = buildOpeningBalancesEntry(
			{
				conversionDate: "2026-01-01",
				balances: [
					line("bank", "DEBIT", 100000n),
					line("fixed", "DEBIT", 50000n),
					line("loan", "CREDIT", 30000n),
				],
			},
			ctx,
		);
		expect(entry.source).toBe("OPENING_BALANCE");
		expect(entry.date).toBe("2025-12-31");
		expect(entry.sourceKey).toBe("opening:balances");
		expect(shape(entry)).toEqual([
			"NORMAL|bank|DEBIT|USD 100000|100000|",
			"NORMAL|fixed|DEBIT|USD 50000|50000|",
			"NORMAL|loan|CREDIT|USD 30000|30000|",
			"NORMAL|obe|CREDIT|USD 120000|120000|",
		]);
	});

	test("a debit side shortfall puts opening balance equity on the debit side", () => {
		const entry = buildOpeningBalancesEntry(
			{
				conversionDate: "2026-01-01",
				balances: [
					line("loan", "CREDIT", 30000n),
					line("bank", "DEBIT", 10000n),
				],
			},
			ctx,
		);
		expect(entry.lines.at(-1)?.side).toBe("DEBIT");
		expect(entry.lines.at(-1)?.baseAmountMinor).toBe(20000n);
	});

	test("an already balanced set needs no balancing line", () => {
		const entry = buildOpeningBalancesEntry(
			{
				conversionDate: "2026-01-01",
				balances: [line("bank", "DEBIT", 100n), line("equity", "CREDIT", 100n)],
			},
			ctx,
		);
		expect(entry.lines).toHaveLength(2);
	});

	test("receivable, payable, income, expense and the equity account itself are refused", () => {
		for (const accountId of ["ar", "ap", "rev", "exp", "obe"]) {
			expect(
				codeOf(() =>
					buildOpeningBalancesEntry(
						{
							conversionDate: "2026-01-01",
							balances: [line(accountId, "DEBIT", 100n)],
						},
						ctx,
					),
				),
			).toBe("OPENING_ACCOUNT_NOT_ALLOWED");
		}
	});
});

describe("R19 year end", () => {
	test("there is no closing entry builder", () => {
		const names = Object.keys(engine);
		expect(names.filter((name) => /clos|yearend|retained/i.test(name))).toEqual(
			[],
		);
	});
});

describe("idempotent keys", () => {
	test("every builder keys its entry on the thing that caused it", () => {
		const keys: string[] = [
			buildDocumentEntry(doc({ lines: [line("rev", "1", 100n)] }), ctx)
				.sourceKey,
			buildTransferEntry(
				{
					key: "t9",
					fromAccountId: "bank",
					fromCurrency: "USD",
					toAccountId: "bank2",
					toCurrency: "USD",
					amountMinor: 1n,
					date: "2026-11-05",
					fx: null,
				},
				ctx,
			).sourceKey,
		];
		expect(keys).toEqual(["invoice:d1:issue", "transfer:t9"]);
	});

	test("posting the same entry twice returns the first", () => {
		const sim = new SimLedger(ctx);
		const input: PostingInput = buildDocumentEntry(
			doc({ lines: [line("rev", "1", 100n)] }),
			ctx,
		);
		const a = sim.post(input);
		const b = sim.post(input);
		expect(b.id).toBe(a.id);
		expect(sim.entries).toHaveLength(1);
		expect(NOW).toBeTruthy();
	});
});
