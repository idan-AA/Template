import { describe, expect, test } from "bun:test";
import {
	buildApplyCreditEntry,
	buildBankMoveEntry,
	buildDocumentEntry,
	buildManualJournalEntry,
	buildOpeningBalancesEntry,
	buildParkEntry,
	buildPaymentEntry,
	buildReversal,
	buildTransferEntry,
	LedgerError,
	SimLedger,
} from "../../bookkeeping/engine";
import {
	assertNets,
	doc,
	fx,
	line,
	makeCtx,
	P825,
	RATE_FIELDS,
	T825,
} from "./helpers";

const ctx = makeCtx("USD");

function busyLedger(): SimLedger {
	const sim = new SimLedger(ctx);

	sim.post(
		buildOpeningBalancesEntry(
			{
				conversionDate: "2026-01-01",
				balances: [
					{
						accountId: "bank",
						side: "DEBIT",
						amountMinor: 500000n,
						currency: "USD",
						fx: null,
					},
					{
						accountId: "equity",
						side: "CREDIT",
						amountMinor: 400000n,
						currency: "USD",
						fx: null,
					},
				],
			},
			ctx,
		),
	);

	sim.post(
		buildDocumentEntry(
			doc({
				id: "inv1",
				currency: "EUR",
				fx: fx("1.0834"),
				lines: [line("rev", "3", 33333n, T825), line("rev2", "1.5", 1999n)],
			}),
			ctx,
		),
	);
	sim.post(
		buildDocumentEntry(
			doc({ id: "inv2", lines: [line("rev", "1", 250000n, T825)] }),
			ctx,
		),
	);
	sim.post(
		buildDocumentEntry(
			doc({
				id: "cn1",
				kind: "CREDIT_NOTE",
				lines: [line("rev", "1", 50000n, T825)],
			}),
			ctx,
		),
	);
	sim.post(
		buildDocumentEntry(
			doc({
				id: "bill1",
				kind: "BILL",
				currency: "JPY",
				fx: fx("0.0067"),
				lines: [line("exp", "1", 1234567n)],
			}),
			ctx,
		),
	);
	sim.post(
		buildDocumentEntry(
			doc({
				id: "bill2",
				kind: "BILL",
				lines: [line("exp", "1", 80000n, P825)],
			}),
			ctx,
		),
	);
	sim.post(
		buildDocumentEntry(
			doc({
				id: "vc1",
				kind: "VENDOR_CREDIT",
				lines: [line("exp", "1", 20000n)],
			}),
			ctx,
		),
	);

	const eurTarget = sim.target(
		{ documentId: "inv1" },
		"DEBIT",
		40000n,
		RATE_FIELDS("1.0834"),
	);
	sim.post(
		buildPaymentEntry(
			{
				id: "pay1",
				kind: "RECEIPT",
				counterpartyId: "c1",
				date: "2026-11-05",
				currency: "EUR",
				amountMinor: 45000n,
				bank: { accountId: "bank", currency: "USD", amountMinor: 49000n },
				fx: fx("1.0900"),
				targets: [eurTarget],
				keepUnallocatedAsCredit: true,
			},
			ctx,
		),
	);

	sim.post(
		buildApplyCreditEntry(
			{
				id: "al1",
				control: "AR",
				counterpartyId: "c1",
				date: "2026-11-06",
				currency: "USD",
				amountMinor: 30000n,
				credit: sim.target(
					{ documentId: "cn1" },
					"CREDIT",
					30000n,
					RATE_FIELDS("1"),
				),
				target: sim.target(
					{ documentId: "inv2" },
					"DEBIT",
					30000n,
					RATE_FIELDS("1"),
				),
			},
			ctx,
		),
	);

	sim.post(
		buildPaymentEntry(
			{
				id: "ref1",
				kind: "CUSTOMER_REFUND",
				counterpartyId: "c1",
				date: "2026-11-07",
				currency: "USD",
				amountMinor: 20000n,
				bank: { accountId: "bank", currency: "USD" },
				fx: null,
				targets: [
					sim.target({ documentId: "cn1" }, "CREDIT", 20000n, RATE_FIELDS("1")),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		),
	);

	sim.post(
		buildPaymentEntry(
			{
				id: "pay2",
				kind: "PAYOUT",
				counterpartyId: "c1",
				date: "2026-11-08",
				currency: "JPY",
				amountMinor: 600000n,
				bank: { accountId: "bank", currency: "USD", amountMinor: 4100n },
				fx: fx("0.0068"),
				targets: [
					sim.target(
						{ documentId: "bill1" },
						"CREDIT",
						600000n,
						RATE_FIELDS("0.0067"),
					),
				],
				keepUnallocatedAsCredit: false,
			},
			ctx,
		),
	);

	sim.post(
		buildBankMoveEntry(
			{
				key: "s1",
				bankAccountId: "bank",
				bankCurrency: "USD",
				direction: "OUT",
				amountMinor: 10825n,
				date: "2026-11-09",
				fx: null,
				splits: [{ accountId: "exp", grossMinor: 10825n, taxRate: P825 }],
			},
			ctx,
		),
	);
	sim.post(
		buildBankMoveEntry(
			{
				key: "r1",
				bankAccountId: "bank",
				bankCurrency: "USD",
				direction: "IN",
				amountMinor: 10825n,
				date: "2026-11-09",
				fx: null,
				splits: [{ accountId: "rev", grossMinor: 10825n, taxRate: T825 }],
			},
			ctx,
		),
	);
	sim.post(
		buildParkEntry(
			{
				key: "pk1",
				bankAccountId: "bank",
				bankCurrency: "USD",
				direction: "OUT",
				amountMinor: 999n,
				date: "2026-11-09",
				fx: null,
			},
			ctx,
		),
	);
	sim.post(
		buildTransferEntry(
			{
				key: "tr1",
				fromAccountId: "bank",
				fromCurrency: "USD",
				toAccountId: "bank2",
				toCurrency: "USD",
				amountMinor: 70000n,
				date: "2026-11-10",
				fx: null,
			},
			ctx,
		),
	);
	sim.post(
		buildManualJournalEntry(
			{
				id: "j1",
				source: "ADJUSTMENT",
				date: "2026-11-30",
				memo: "depreciation",
				lines: [
					{
						accountId: "exp",
						side: "DEBIT",
						amountMinor: 12345n,
						currency: "USD",
						fx: null,
					},
					{
						accountId: "fixed",
						side: "CREDIT",
						amountMinor: 12345n,
						currency: "USD",
						fx: null,
					},
				],
			},
			ctx,
		),
	);
	return sim;
}

describe("a busy ledger", () => {
	test("balances before any reversal", () => {
		const sim = busyLedger();
		expect(sim.entries.length).toBeGreaterThan(12);
		expect(sim.totalDebitBase()).toBe(sim.totalCreditBase());
	});

	test("reversing everything nets every account and every tag to zero", () => {
		const sim = busyLedger();
		const originals = [...sim.entries].filter(
			(e) => e.source !== "OPENING_BALANCE",
		);
		for (const original of originals) {
			sim.post(
				buildReversal(
					original,
					{
						date: "2026-12-01",
						reason: "test",
						alreadyReversed: sim.isReversed(original.id),
					},
					ctx,
				),
			);
		}
		const tags = new Set<string>();
		for (const l of sim.allLines()) {
			if (l.documentId) tags.add(`d:${l.documentId}`);
			if (l.paymentId) tags.add(`p:${l.paymentId}`);
		}
		for (const tag of tags) {
			const [kind, id] = tag.split(":") as [string, string];
			const key = kind === "d" ? { documentId: id } : { paymentId: id };
			expect(sim.tagBalance(key, "DEBIT")).toEqual({
				txnMinor: 0n,
				baseMinor: 0n,
			});
		}
		for (const account of [
			"ar",
			"ap",
			"rev",
			"rev2",
			"exp",
			"taxpay",
			"taxrec",
			"fx",
			"rnd",
			"susp",
			"bank2",
			"fixed",
		]) {
			expect(sim.accountBalance(account)).toBe(0n);
		}
		expect(sim.accountBalance("bank")).toBe(500000n);
		expect(sim.totalDebitBase()).toBe(sim.totalCreditBase());
	});

	test("each entry reverses cleanly on its own", () => {
		const base = busyLedger();
		for (const original of base.entries) {
			if (original.source === "OPENING_BALANCE") continue;
			const sim = new SimLedger(ctx);
			const copy = sim.post(original.input);
			sim.post(buildReversal(copy, { date: "2026-12-01", reason: "x" }, ctx));
			assertNets(sim);
			for (const l of copy.lines) {
				const key = l.documentId
					? { documentId: l.documentId }
					: l.paymentId
						? { paymentId: l.paymentId }
						: null;
				if (key)
					expect(sim.tagBalance(key, "DEBIT")).toEqual({
						txnMinor: 0n,
						baseMinor: 0n,
					});
			}
		}
	});

	test("an entry cannot be reversed twice", () => {
		const sim = busyLedger();
		const original = sim.entries.find((e) => e.source === "INVOICE");
		if (!original) throw new Error("no invoice");
		const input = buildReversal(
			original,
			{ date: "2026-12-01", reason: "x" },
			ctx,
		);
		sim.post(input);
		const other = { ...input, sourceKey: "reversal:other" };
		try {
			sim.post(other);
			throw new Error("a second reversal was accepted");
		} catch (error) {
			expect(error).toBeInstanceOf(LedgerError);
			expect((error as LedgerError).code).toBe("ALREADY_REVERSED");
		}
	});

	test("every receivable and payable line is tagged to a document or a payment", () => {
		const sim = busyLedger();
		for (const l of sim.allLines()) {
			if (l.accountId === "ar" || l.accountId === "ap") {
				expect(Boolean(l.documentId) || Boolean(l.paymentId)).toBe(true);
			}
		}
	});

	test("the receivable control account equals the sum of its tags", () => {
		const sim = busyLedger();
		const tags = new Map<string, bigint>();
		for (const l of sim.allLines()) {
			if (l.accountId !== "ar") continue;
			const key = l.documentId ?? l.paymentId ?? "";
			const sign = l.side === "DEBIT" ? 1n : -1n;
			tags.set(key, (tags.get(key) ?? 0n) + sign * l.baseAmountMinor);
		}
		let total = 0n;
		for (const value of tags.values()) total += value;
		expect(total).toBe(sim.accountBalance("ar"));
	});
});
