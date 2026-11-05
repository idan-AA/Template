import { describe, expect, test } from "bun:test";
import {
	LedgerError,
	type PostingInput,
	type PostingLine,
	validatePosting,
} from "../../bookkeeping/engine";
import { makeCtx, NOW } from "./helpers";

const ctx = makeCtx("USD");

function base(overrides: Partial<PostingLine> = {}): PostingLine {
	return {
		accountId: "exp",
		kind: "NORMAL",
		side: "DEBIT",
		currency: "USD",
		amountMinor: 1000n,
		baseAmountMinor: 1000n,
		fxRate: "1",
		fxOrigin: "IDENTITY",
		fxRateAt: NOW,
		counterpartyId: null,
		documentId: null,
		paymentId: null,
		taxRateId: null,
		memo: null,
		...overrides,
	};
}

function entry(
	lines: PostingLine[],
	overrides: Partial<PostingInput> = {},
): PostingInput {
	return {
		source: "MANUAL",
		sourceId: "m",
		sourceKey: "manual:m",
		date: "2026-11-04",
		memo: null,
		baseCurrency: "USD",
		lines,
		...overrides,
	};
}

const good = () => [base(), base({ accountId: "equity", side: "CREDIT" })];

function codeOf(input: PostingInput): string {
	try {
		validatePosting(input, ctx);
	} catch (error) {
		if (error instanceof LedgerError) return error.code;
		throw error;
	}
	return "NO_ERROR";
}

describe("validatePosting", () => {
	const cases: Array<[string, PostingInput, string]> = [
		["a balanced entry passes", entry(good()), "NO_ERROR"],
		["one line", entry([base()]), "TOO_FEW_LINES"],
		["no lines", entry([]), "TOO_FEW_LINES"],
		[
			"base debits and credits differ",
			entry([
				base(),
				base({
					accountId: "equity",
					side: "CREDIT",
					amountMinor: 999n,
					baseAmountMinor: 999n,
				}),
			]),
			"UNBALANCED",
		],
		[
			"balanced in base but not in the shared currency",
			entry([
				base({
					currency: "EUR",
					amountMinor: 1000n,
					baseAmountMinor: 1100n,
					fxRate: "1.1",
					fxOrigin: "MANUAL",
				}),
				base({
					accountId: "equity",
					side: "CREDIT",
					currency: "EUR",
					amountMinor: 990n,
					baseAmountMinor: 1100n,
					fxRate: "1.1111",
					fxOrigin: "MANUAL",
				}),
			]),
			"UNBALANCED",
		],
		[
			"a zero amount",
			entry([
				base({ amountMinor: 0n, baseAmountMinor: 0n }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_AMOUNT",
		],
		[
			"a negative amount",
			entry([
				base({ amountMinor: -5n }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_AMOUNT",
		],
		[
			"an amount over the cap",
			entry([
				base({ amountMinor: 100_000_000_000_001n }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_AMOUNT",
		],
		[
			"a negative base amount",
			entry([
				base({ baseAmountMinor: -1n }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_AMOUNT",
		],
		[
			"a malformed currency",
			entry([
				base({ currency: "usd" }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_CURRENCY",
		],
		[
			"a zero rate",
			entry([
				base({ fxRate: "0" }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_RATE",
		],
		[
			"a text rate",
			entry([
				base({ fxRate: "abc" }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_RATE",
		],
		[
			"base currency line with a rate other than one",
			entry([
				base({ fxRate: "1.5" }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_RATE",
		],
		[
			"base currency line whose base differs from its amount",
			entry([
				base({ baseAmountMinor: 999n }),
				base({ accountId: "equity", side: "CREDIT", baseAmountMinor: 999n }),
			]),
			"INVALID_RATE",
		],
		[
			"a rounding line in a foreign currency",
			entry([
				base({
					currency: "EUR",
					baseAmountMinor: 1100n,
					fxRate: "1.1",
					fxOrigin: "MANUAL",
				}),
				base({
					accountId: "equity",
					side: "CREDIT",
					baseAmountMinor: 1100n,
					currency: "EUR",
					fxRate: "1.1",
					fxOrigin: "MANUAL",
					kind: "ROUNDING",
				}),
			]),
			"INVALID_LINE",
		],
		[
			"a tax line without a tax rate",
			entry([
				base(),
				base({ accountId: "taxpay", side: "CREDIT", kind: "TAX" }),
			]),
			"INVALID_TAX",
		],
		[
			"a line tagged to a document and a payment",
			entry([
				base({ documentId: "d", paymentId: "p" }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_TARGET",
		],
		[
			"an archived account",
			entry([
				base({ accountId: "old" }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"ARCHIVED_ACCOUNT",
		],
		[
			"an unknown account",
			entry([
				base({ accountId: "ghost" }),
				base({ accountId: "equity", side: "CREDIT" }),
			]),
			"INVALID_LINE",
		],
		[
			"an impossible date",
			entry(good(), { date: "2026-02-30" }),
			"INVALID_DATE",
		],
		[
			"a different base currency",
			entry(good(), { baseCurrency: "EUR" }),
			"BASE_CURRENCY_MISMATCH",
		],
		[
			"a rounding line cannot hide a one cent error in a single currency entry",
			entry([
				base(),
				base({
					accountId: "equity",
					side: "CREDIT",
					amountMinor: 999n,
					baseAmountMinor: 999n,
				}),
				base({
					accountId: "rnd",
					side: "CREDIT",
					kind: "ROUNDING",
					amountMinor: 1n,
					baseAmountMinor: 1n,
				}),
			]),
			"UNBALANCED",
		],
	];

	for (const [name, input, expected] of cases) {
		test(name, () => expect(codeOf(input)).toBe(expected));
	}

	test("rounding is allowed up to half the number of foreign lines", () => {
		const foreign = (
			accountId: string,
			side: "DEBIT" | "CREDIT",
			amount: bigint,
			baseAmount: bigint,
		) =>
			base({
				accountId,
				side,
				currency: "EUR",
				amountMinor: amount,
				baseAmountMinor: baseAmount,
				fxRate: "1.0005",
				fxOrigin: "MANUAL",
			});
		const lines = [
			foreign("ar", "DEBIT", 6666n, 6669n),
			foreign("rev", "CREDIT", 3333n, 3335n),
			foreign("rev2", "CREDIT", 3333n, 3335n),
			base({
				accountId: "rnd",
				side: "DEBIT",
				kind: "ROUNDING",
				amountMinor: 1n,
				baseAmountMinor: 1n,
			}),
		];
		expect(codeOf(entry(lines))).toBe("NO_ERROR");
		const tooMuch = [
			...lines.slice(0, 3),
			base({
				accountId: "rnd",
				side: "DEBIT",
				kind: "ROUNDING",
				amountMinor: 2n,
				baseAmountMinor: 2n,
			}),
		];
		expect(codeOf(entry(tooMuch))).toBe("UNBALANCED");
	});

	test("the accounts map is optional", () => {
		const noMap = { ...ctx, accounts: undefined };
		expect(() =>
			validatePosting(
				entry([
					base({ accountId: "whatever" }),
					base({ accountId: "other", side: "CREDIT" }),
				]),
				noMap,
			),
		).not.toThrow();
	});
});
