import { normalizeCurrency } from "@app/db/currency";
import { LedgerError } from "../errors";
import { baseDifference, convertAndRound, toPostingLine } from "../fx";
import { assertLineAmount } from "../money";
import { type DateOnly, dayBefore } from "../time";
import {
	type AccountInfo,
	type Fx,
	oppositeSide,
	type PostingContext,
	type PostingInput,
	type RawLine,
	type Side,
} from "../types";
import { validatePosting } from "../validate";

export interface JournalLineInput {
	accountId: string;
	side: Side;
	amountMinor: bigint;
	currency: string;
	fx: Fx | null;
	counterpartyId?: string | null;
	memo?: string | null;
}

export interface ManualJournalInput {
	id: string;
	source: "MANUAL" | "ADJUSTMENT";
	date: DateOnly;
	memo: string | null;
	lines: JournalLineInput[];
}

export interface OpeningBalancesInput {
	conversionDate: DateOnly;
	balances: JournalLineInput[];
}

const CONTROL_SUBTYPES = new Set([
	"ACCOUNTS_RECEIVABLE",
	"ACCOUNTS_PAYABLE",
	"BANK",
	"CASH",
	"CREDIT_CARD",
]);

function requireAccount(ctx: PostingContext, id: string): AccountInfo {
	if (!ctx.accounts) {
		throw new LedgerError(
			"ACCOUNTS_REQUIRED",
			"Account details are needed to check this entry.",
		);
	}
	const account = ctx.accounts.get(id);
	if (!account)
		throw new LedgerError("INVALID_LINE", "A line names an unknown account.");
	return account;
}

function isControlAccount(account: AccountInfo): boolean {
	return (
		CONTROL_SUBTYPES.has(account.subtype) ||
		account.systemRole === "ACCOUNTS_RECEIVABLE" ||
		account.systemRole === "ACCOUNTS_PAYABLE"
	);
}

function toRaw(line: JournalLineInput): RawLine {
	assertLineAmount(line.amountMinor);
	return {
		accountId: line.accountId,
		kind: "NORMAL",
		side: line.side,
		currency: line.currency,
		amountMinor: line.amountMinor,
		fx: line.fx,
		counterpartyId: line.counterpartyId ?? null,
		memo: line.memo ?? null,
	};
}

export function buildManualJournalEntry(
	input: ManualJournalInput,
	ctx: PostingContext,
): PostingInput {
	if (input.source === "ADJUSTMENT" && !input.memo?.trim()) {
		throw new LedgerError("MEMO_REQUIRED", "An adjusting entry needs a memo.");
	}
	for (const line of input.lines) {
		const account = requireAccount(ctx, line.accountId);
		if (isControlAccount(account)) {
			throw new LedgerError(
				"MANUAL_JOURNAL_FORBIDDEN_ACCOUNT",
				"Receivable, payable, bank and card accounts cannot be used in a manual journal.",
			);
		}
	}
	const entry: PostingInput = {
		source: input.source,
		sourceId: input.id,
		sourceKey: `manual:${input.id}`,
		date: input.date,
		memo: input.memo,
		baseCurrency: ctx.baseCurrency,
		lines: convertAndRound(input.lines.map(toRaw), ctx),
	};
	validatePosting(entry, ctx);
	return entry;
}

export function buildOpeningBalancesEntry(
	input: OpeningBalancesInput,
	ctx: PostingContext,
): PostingInput {
	const obe = ctx.systemAccounts.openingBalanceEquity;
	for (const line of input.balances) {
		const account = requireAccount(ctx, line.accountId);
		if (
			line.accountId === obe ||
			account.type === "INCOME" ||
			account.type === "EXPENSE" ||
			account.subtype === "ACCOUNTS_RECEIVABLE" ||
			account.subtype === "ACCOUNTS_PAYABLE"
		) {
			throw new LedgerError(
				"OPENING_ACCOUNT_NOT_ALLOWED",
				"Opening balances cover balance sheet accounts other than receivable and payable.",
			);
		}
	}
	const converted = input.balances.map((line) =>
		toPostingLine(toRaw(line), ctx),
	);
	const difference = baseDifference(converted);
	const lines = [...converted];
	if (difference !== 0n) {
		const side: Side = difference > 0n ? "CREDIT" : "DEBIT";
		const amount = difference > 0n ? difference : -difference;
		lines.push({
			accountId: obe,
			kind: "NORMAL",
			side,
			currency: normalizeCurrency(ctx.baseCurrency),
			amountMinor: amount,
			baseAmountMinor: amount,
			fxRate: "1",
			fxOrigin: "IDENTITY",
			fxRateAt: ctx.now,
			counterpartyId: null,
			documentId: null,
			paymentId: null,
			taxRateId: null,
			memo: "Opening Balance Equity",
		});
	}
	const entry: PostingInput = {
		source: "OPENING_BALANCE",
		sourceId: null,
		sourceKey: "opening:balances",
		date: dayBefore(input.conversionDate),
		memo: "Opening balances",
		baseCurrency: ctx.baseCurrency,
		lines,
	};
	validatePosting(entry, ctx);
	return entry;
}

export { oppositeSide };
