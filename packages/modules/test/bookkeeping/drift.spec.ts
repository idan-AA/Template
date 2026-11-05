import { describe, expect, test } from "bun:test";
import { buildManualJournalEntry, LedgerError } from "../../bookkeeping/engine";
import { fx, makeCtx } from "./helpers";

const ctx = makeCtx("USD");

function codeOf(fn: () => unknown): string {
	try {
		fn();
	} catch (error) {
		if (error instanceof LedgerError) return error.code;
		throw error;
	}
	return "NO_ERROR";
}

function journal(
	a: bigint,
	b: bigint,
	currencyA = "USD",
	currencyB = "USD",
	rate: string | null = null,
) {
	return () =>
		buildManualJournalEntry(
			{
				id: "j",
				source: "MANUAL",
				date: "2026-11-05",
				memo: null,
				lines: [
					{
						accountId: "exp",
						side: "DEBIT",
						amountMinor: a,
						currency: currencyA,
						fx: rate ? fx(rate) : null,
					},
					{
						accountId: "equity",
						side: "CREDIT",
						amountMinor: b,
						currency: currencyB,
						fx: rate ? fx(rate) : null,
					},
				],
			},
			ctx,
		);
}

describe("rounding can never hide a user error", () => {
	test("a one cent difference in the base currency is refused", () => {
		expect(codeOf(journal(1000n, 999n))).toBe("UNBALANCED");
		expect(codeOf(journal(999n, 1000n))).toBe("UNBALANCED");
	});

	test("a one unit difference in one foreign currency is refused", () => {
		expect(codeOf(journal(1000n, 999n, "EUR", "EUR", "1.1"))).toBe(
			"UNBALANCED",
		);
	});

	test("a mixed currency entry off by more than conversion can explain is refused", () => {
		expect(codeOf(journal(1000n, 1099n, "EUR", "USD", "1.1"))).toBe(
			"ROUNDING_TOO_LARGE",
		);
	});

	test("equal amounts in one foreign currency are fine at any rate", () => {
		for (const rate of ["1.0005", "0.99995", "3.14159", "0.0067"]) {
			expect(codeOf(journal(3333n, 3333n, "EUR", "EUR", rate))).toBe(
				"NO_ERROR",
			);
		}
	});
});
