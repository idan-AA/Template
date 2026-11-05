import { normalizeCurrency } from "@app/db/currency";
import { Decimal } from "./decimal";
import { LedgerError } from "./errors";
import { MAX_LINE_MINOR, sumBig } from "./money";
import { isDateOnly } from "./time";
import type { PostingContext, PostingInput, PostingLine } from "./types";

const CODE = /^[A-Z]{3}$/;

function fail(
	code: ConstructorParameters<typeof LedgerError>[0],
	message: string,
): never {
	throw new LedgerError(code, message);
}

function sideSum(
	lines: readonly PostingLine[],
	side: "DEBIT" | "CREDIT",
	pick: (line: PostingLine) => bigint,
): bigint {
	return sumBig(lines.filter((l) => l.side === side).map(pick));
}

export function validatePosting(
	input: PostingInput,
	ctx: PostingContext,
): void {
	const base = normalizeCurrency(ctx.baseCurrency);

	if (!isDateOnly(input.date))
		fail("INVALID_DATE", "The entry date is not a calendar date.");
	if (normalizeCurrency(input.baseCurrency) !== base) {
		fail(
			"BASE_CURRENCY_MISMATCH",
			"The entry is not in the ledger base currency.",
		);
	}
	if (input.lines.length < 2)
		fail("TOO_FEW_LINES", "An entry needs at least two lines.");

	for (const line of input.lines) {
		if (!CODE.test(line.currency))
			fail("INVALID_CURRENCY", "A line has a malformed currency.");
		if (line.amountMinor <= 0n || line.amountMinor > MAX_LINE_MINOR) {
			fail("INVALID_AMOUNT", "A line amount is outside the allowed range.");
		}
		if (
			line.baseAmountMinor < 0n ||
			line.baseAmountMinor > MAX_LINE_MINOR * 1000n
		) {
			fail(
				"INVALID_AMOUNT",
				"A line base amount is outside the allowed range.",
			);
		}
		let rate: Decimal;
		try {
			rate = new Decimal(line.fxRate);
		} catch {
			fail("INVALID_RATE", "A line has a malformed rate.");
		}
		if (!rate.isFinite() || rate.lessThanOrEqualTo(0)) {
			fail("INVALID_RATE", "A line rate must be above zero.");
		}
		if (line.currency === base) {
			if (!rate.eq(1) || line.baseAmountMinor !== line.amountMinor) {
				fail(
					"INVALID_RATE",
					"A base currency line must have rate 1 and equal amounts.",
				);
			}
		}
		if (line.kind === "FX_ADJUSTMENT" || line.kind === "ROUNDING") {
			if (line.currency !== base || !rate.eq(1)) {
				fail(
					"INVALID_LINE",
					"Adjustment lines must be in the base currency at rate 1.",
				);
			}
		}
		if (line.kind === "TAX" && !line.taxRateId) {
			fail("INVALID_TAX", "A tax line must name its tax rate.");
		}
		if (line.documentId && line.paymentId) {
			fail(
				"INVALID_TARGET",
				"A line can carry a document or a payment, not both.",
			);
		}
		const account = ctx.accounts?.get(line.accountId);
		if (ctx.accounts && !account)
			fail("INVALID_LINE", "A line names an unknown account.");
		if (account?.archived)
			fail("ARCHIVED_ACCOUNT", "A line posts to an archived account.");
	}

	const baseDebit = sideSum(input.lines, "DEBIT", (l) => l.baseAmountMinor);
	const baseCredit = sideSum(input.lines, "CREDIT", (l) => l.baseAmountMinor);
	if (baseDebit !== baseCredit) {
		fail(
			"UNBALANCED",
			`Base debits ${baseDebit} do not equal base credits ${baseCredit}.`,
		);
	}

	const counted = input.lines.filter((l) => l.kind !== "ROUNDING");
	const currencies = new Set(counted.map((l) => l.currency));
	if (currencies.size === 1) {
		const debit = sideSum(counted, "DEBIT", (l) => l.amountMinor);
		const credit = sideSum(counted, "CREDIT", (l) => l.amountMinor);
		if (debit !== credit) {
			fail(
				"UNBALANCED",
				`Debits ${debit} do not equal credits ${credit} in one currency.`,
			);
		}
	}

	const rounding = sumBig(
		input.lines.filter((l) => l.kind === "ROUNDING").map((l) => l.amountMinor),
	);
	const foreignCount = counted.filter((l) => l.currency !== base).length;
	if (rounding > BigInt(Math.floor(foreignCount / 2))) {
		fail(
			"ROUNDING_TOO_LARGE",
			"Rounding is larger than the lines can explain.",
		);
	}
}

export function isBalanced(lines: readonly PostingLine[]): boolean {
	return (
		sideSum(lines, "DEBIT", (l) => l.baseAmountMinor) ===
		sideSum(lines, "CREDIT", (l) => l.baseAmountMinor)
	);
}
