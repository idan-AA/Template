import { normalizeCurrency } from "@app/db/currency";
import { splitGross } from "../document";
import { LedgerError } from "../errors";
import { balanceWith, convertAndRound, resolveFx } from "../fx";
import { assertLineAmount, sumBig } from "../money";
import type { DateOnly } from "../time";
import {
	type EntrySource,
	type Fx,
	oppositeSide,
	type PostingContext,
	type PostingInput,
	type RawLine,
	type Side,
	type TaxRateInput,
} from "../types";
import { validatePosting } from "../validate";

export interface BankSplit {
	accountId: string;
	grossMinor: bigint;
	taxRate: TaxRateInput | null;
	counterpartyId?: string | null;
	memo?: string | null;
}

export interface BankMoveInput {
	key: string;
	bankAccountId: string;
	bankCurrency: string;
	direction: "OUT" | "IN";
	amountMinor: bigint;
	date: DateOnly;
	fx: Fx | null;
	splits: BankSplit[];
	counterpartyId?: string | null;
	memo?: string | null;
}

export function buildBankMoveEntry(
	input: BankMoveInput,
	ctx: PostingContext,
): PostingInput {
	assertLineAmount(input.amountMinor);
	if (input.splits.length === 0) {
		throw new LedgerError(
			"SPLIT_MISMATCH",
			"Choose where this money went or came from.",
		);
	}
	const total = sumBig(input.splits.map((s) => s.grossMinor));
	if (total !== input.amountMinor) {
		throw new LedgerError(
			"SPLIT_MISMATCH",
			"The split amounts must add up to the bank line.",
		);
	}

	const outgoing = input.direction === "OUT";
	const splitSide: Side = outgoing ? "DEBIT" : "CREDIT";
	const bankSide = oppositeSide(splitSide);
	const currency = normalizeCurrency(input.bankCurrency);
	const bankFx = resolveFx(currency, input.fx, ctx);

	const raws: RawLine[] = [
		{
			accountId: input.bankAccountId,
			kind: "NORMAL",
			side: bankSide,
			currency,
			amountMinor: input.amountMinor,
			fx: bankFx,
			counterpartyId: input.counterpartyId ?? null,
		},
	];

	const taxes = new Map<string, { rate: TaxRateInput; tax: bigint }>();
	for (const split of input.splits) {
		assertLineAmount(split.grossMinor);
		if (split.taxRate && !split.taxRate.recoverable && !outgoing) {
			throw new LedgerError(
				"INVALID_TAX",
				"Only purchase tax can be left unrecovered.",
			);
		}
		const { net, tax } = splitGross(split.grossMinor, split.taxRate);
		const rolledIn = split.taxRate !== null && !split.taxRate.recoverable;
		const posted = rolledIn ? split.grossMinor : net;
		raws.push({
			accountId: split.accountId,
			kind: "NORMAL",
			side: splitSide,
			currency,
			amountMinor: posted,
			fx: bankFx,
			counterpartyId: split.counterpartyId ?? input.counterpartyId ?? null,
			taxRateId: split.taxRate?.id ?? null,
			memo: split.memo ?? null,
		});
		if (split.taxRate?.recoverable && tax > 0n) {
			const existing = taxes.get(split.taxRate.id);
			if (existing) existing.tax += tax;
			else taxes.set(split.taxRate.id, { rate: split.taxRate, tax });
		}
	}
	for (const { rate, tax } of taxes.values()) {
		raws.push({
			accountId: rate.accountId,
			kind: "TAX",
			side: splitSide,
			currency,
			amountMinor: tax,
			fx: bankFx,
			counterpartyId: input.counterpartyId ?? null,
			taxRateId: rate.id,
		});
	}

	const source: EntrySource = outgoing ? "BANK_SPEND" : "BANK_RECEIVE";
	const entry: PostingInput = {
		source,
		sourceId: null,
		sourceKey: `bank:${input.bankAccountId}:${input.key}`,
		date: input.date,
		memo: input.memo ?? null,
		baseCurrency: ctx.baseCurrency,
		lines: convertAndRound(raws, ctx),
	};
	validatePosting(entry, ctx);
	return entry;
}

export function buildParkEntry(
	input: Omit<BankMoveInput, "splits">,
	ctx: PostingContext,
): PostingInput {
	return buildBankMoveEntry(
		{
			...input,
			splits: [
				{
					accountId: ctx.systemAccounts.suspense,
					grossMinor: input.amountMinor,
					taxRate: null,
					memo: "Uncategorized",
				},
			],
		},
		ctx,
	);
}

export interface TransferInput {
	key: string;
	fromAccountId: string;
	fromCurrency: string;
	toAccountId: string;
	toCurrency: string;
	amountMinor: bigint;
	date: DateOnly;
	fx: Fx | null;
	memo?: string | null;
}

export function buildTransferEntry(
	input: TransferInput,
	ctx: PostingContext,
): PostingInput {
	assertLineAmount(input.amountMinor);
	if (input.fromAccountId === input.toAccountId) {
		throw new LedgerError(
			"INVALID_TARGET",
			"A transfer needs two different accounts.",
		);
	}
	const currency = normalizeCurrency(input.fromCurrency);
	if (currency !== normalizeCurrency(input.toCurrency)) {
		throw new LedgerError(
			"CROSS_CURRENCY_TRANSFER",
			"Transfers between accounts in different currencies are not supported yet.",
		);
	}
	const fx = resolveFx(currency, input.fx, ctx);
	const raws: RawLine[] = [
		{
			accountId: input.toAccountId,
			kind: "NORMAL",
			side: "DEBIT",
			currency,
			amountMinor: input.amountMinor,
			fx,
		},
		{
			accountId: input.fromAccountId,
			kind: "NORMAL",
			side: "CREDIT",
			currency,
			amountMinor: input.amountMinor,
			fx,
		},
	];
	const lines = convertAndRound(raws, ctx);
	const entry: PostingInput = {
		source: "TRANSFER",
		sourceId: null,
		sourceKey: `transfer:${input.key}`,
		date: input.date,
		memo: input.memo ?? null,
		baseCurrency: ctx.baseCurrency,
		lines: balanceWith(lines, ctx, "ROUNDING", ctx.systemAccounts.rounding),
	};
	validatePosting(entry, ctx);
	return entry;
}
