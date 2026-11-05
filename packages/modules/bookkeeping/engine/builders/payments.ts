import { normalizeCurrency } from "@app/db/currency";
import { LedgerError } from "../errors";
import { balanceWith, resolveFx } from "../fx";
import { assertLineAmount, convertMinor, mulDivRound, sumBig } from "../money";
import type { DateOnly } from "../time";
import {
	type Fx,
	oppositeSide,
	type PostingContext,
	type PostingInput,
	type PostingLine,
	type SettlementTarget,
	type Side,
} from "../types";
import { validatePosting } from "../validate";

export type PaymentKind =
	| "RECEIPT"
	| "PAYOUT"
	| "CUSTOMER_REFUND"
	| "VENDOR_REFUND";

export interface PaymentInput {
	id: string;
	kind: PaymentKind;
	counterpartyId: string;
	date: DateOnly;
	currency: string;
	amountMinor: bigint;
	bank: { accountId: string; currency: string; amountMinor?: bigint | null };
	fx: Fx | null;
	targets: SettlementTarget[];
	keepUnallocatedAsCredit: boolean;
	memo?: string | null;
}

export interface ApplyCreditInput {
	id: string;
	control: "AR" | "AP";
	counterpartyId: string;
	date: DateOnly;
	currency: string;
	amountMinor: bigint;
	credit: SettlementTarget;
	target: SettlementTarget;
	memo?: string | null;
}

export function settlementBaseMinor(target: {
	allocatedMinor: bigint;
	remainingMinor: bigint;
	remainingBaseMinor: bigint;
}): bigint {
	const { allocatedMinor, remainingMinor, remainingBaseMinor } = target;
	assertLineAmount(allocatedMinor);
	if (remainingMinor <= 0n || allocatedMinor > remainingMinor) {
		throw new LedgerError(
			"OVER_ALLOCATED",
			"The amount applied is more than what is open.",
		);
	}
	if (remainingBaseMinor < 0n) {
		throw new LedgerError(
			"INVALID_AMOUNT",
			"The open base value cannot be negative.",
		);
	}
	if (allocatedMinor === remainingMinor) return remainingBaseMinor;
	return mulDivRound(remainingBaseMinor, allocatedMinor, remainingMinor);
}

function assertTarget(target: SettlementTarget): void {
	const hasDocument = Boolean(target.documentId);
	const hasPayment = Boolean(target.paymentId);
	if (hasDocument === hasPayment) {
		throw new LedgerError(
			"INVALID_TARGET",
			"A settlement names exactly one document or one payment.",
		);
	}
}

function controlOf(kind: PaymentKind): { account: "AR" | "AP"; side: Side } {
	switch (kind) {
		case "RECEIPT":
			return { account: "AR", side: "CREDIT" };
		case "VENDOR_REFUND":
			return { account: "AP", side: "CREDIT" };
		case "PAYOUT":
			return { account: "AP", side: "DEBIT" };
		case "CUSTOMER_REFUND":
			return { account: "AR", side: "DEBIT" };
	}
}

export function buildPaymentEntry(
	input: PaymentInput,
	ctx: PostingContext,
): PostingInput {
	assertLineAmount(input.amountMinor);
	const base = normalizeCurrency(ctx.baseCurrency);
	const currency = normalizeCurrency(input.currency);
	const control = controlOf(input.kind);
	const controlAccount =
		control.account === "AR"
			? ctx.systemAccounts.receivable
			: ctx.systemAccounts.payable;
	const isRefund =
		input.kind === "CUSTOMER_REFUND" || input.kind === "VENDOR_REFUND";
	const payFx = resolveFx(currency, input.fx, ctx);

	const lines: PostingLine[] = [];
	let allocated = 0n;

	for (const target of input.targets) {
		assertTarget(target);
		const baseSlice = settlementBaseMinor(target);
		allocated += target.allocatedMinor;
		lines.push({
			accountId: controlAccount,
			kind: "NORMAL",
			side: control.side,
			currency,
			amountMinor: target.allocatedMinor,
			baseAmountMinor: baseSlice,
			fxRate: target.fxRate,
			fxOrigin: target.fxOrigin,
			fxRateAt: target.fxRateAt,
			counterpartyId: input.counterpartyId,
			documentId: target.documentId ?? null,
			paymentId: target.paymentId ?? null,
			taxRateId: null,
			memo: null,
		});
	}

	if (allocated > input.amountMinor) {
		throw new LedgerError(
			"OVER_ALLOCATED",
			"More was applied than the payment amount.",
		);
	}

	const unallocated = input.amountMinor - allocated;
	if (unallocated > 0n) {
		if (isRefund) {
			throw new LedgerError(
				"UNALLOCATED_NOT_ALLOWED",
				"A refund must be fully applied to the credit it returns.",
			);
		}
		if (!input.keepUnallocatedAsCredit) {
			throw new LedgerError(
				"OVERPAYMENT_NOT_CONFIRMED",
				"The payment is more than what it is applied to. Confirm it should stay as a credit.",
			);
		}
		lines.push({
			accountId: controlAccount,
			kind: "NORMAL",
			side: control.side,
			currency,
			amountMinor: unallocated,
			baseAmountMinor: convertMinor(
				unallocated,
				currency,
				base,
				payFx.rate,
				ctx.exponent,
			),
			fxRate: payFx.rate,
			fxOrigin: payFx.origin,
			fxRateAt: payFx.at,
			counterpartyId: input.counterpartyId,
			documentId: null,
			paymentId: input.id,
			taxRateId: null,
			memo: null,
		});
	}

	const bankCurrency = normalizeCurrency(input.bank.currency);
	let bankAmount: bigint;
	let bankBase: bigint;
	let bankFx: Fx;
	if (bankCurrency === currency) {
		bankAmount = input.amountMinor;
		bankBase = convertMinor(
			bankAmount,
			currency,
			base,
			payFx.rate,
			ctx.exponent,
		);
		bankFx = payFx;
	} else if (bankCurrency === base) {
		if (!input.bank.amountMinor || input.bank.amountMinor <= 0n) {
			throw new LedgerError(
				"BANK_AMOUNT_REQUIRED",
				"Enter the amount that reached the bank account.",
			);
		}
		bankAmount = input.bank.amountMinor;
		bankBase = bankAmount;
		bankFx = resolveFx(base, null, ctx);
	} else {
		throw new LedgerError(
			"BANK_CURRENCY_UNSUPPORTED",
			"The bank account must be in the payment currency or the base currency.",
		);
	}
	assertLineAmount(bankAmount);

	lines.push({
		accountId: input.bank.accountId,
		kind: "NORMAL",
		side: oppositeSide(control.side),
		currency: bankCurrency,
		amountMinor: bankAmount,
		baseAmountMinor: bankBase,
		fxRate: bankFx.rate,
		fxOrigin: bankFx.origin,
		fxRateAt: bankFx.at,
		counterpartyId: input.counterpartyId,
		documentId: null,
		paymentId: null,
		taxRateId: null,
		memo: null,
	});

	const entry: PostingInput = {
		source: "PAYMENT",
		sourceId: input.id,
		sourceKey: `payment:${input.id}`,
		date: input.date,
		memo: input.memo ?? null,
		baseCurrency: ctx.baseCurrency,
		lines: balanceWith(
			lines,
			ctx,
			"FX_ADJUSTMENT",
			ctx.systemAccounts.fxGainLoss,
		),
	};
	validatePosting(entry, ctx);
	return entry;
}

export function buildApplyCreditEntry(
	input: ApplyCreditInput,
	ctx: PostingContext,
): PostingInput {
	assertLineAmount(input.amountMinor);
	assertTarget(input.credit);
	assertTarget(input.target);
	const currency = normalizeCurrency(input.currency);
	const controlAccount =
		input.control === "AR"
			? ctx.systemAccounts.receivable
			: ctx.systemAccounts.payable;
	const creditSide: Side = input.control === "AR" ? "DEBIT" : "CREDIT";

	const part = (
		side: Side,
		target: SettlementTarget,
		amount: bigint,
	): PostingLine => ({
		accountId: controlAccount,
		kind: "NORMAL",
		side,
		currency,
		amountMinor: amount,
		baseAmountMinor: settlementBaseMinor({
			allocatedMinor: amount,
			remainingMinor: target.remainingMinor,
			remainingBaseMinor: target.remainingBaseMinor,
		}),
		fxRate: target.fxRate,
		fxOrigin: target.fxOrigin,
		fxRateAt: target.fxRateAt,
		counterpartyId: input.counterpartyId,
		documentId: target.documentId ?? null,
		paymentId: target.paymentId ?? null,
		taxRateId: null,
		memo: null,
	});

	const lines = [
		part(creditSide, input.credit, input.amountMinor),
		part(oppositeSide(creditSide), input.target, input.amountMinor),
	];

	const entry: PostingInput = {
		source: "ALLOCATION",
		sourceId: input.id,
		sourceKey: `allocation:${input.id}`,
		date: input.date,
		memo: input.memo ?? null,
		baseCurrency: ctx.baseCurrency,
		lines: balanceWith(
			lines,
			ctx,
			"FX_ADJUSTMENT",
			ctx.systemAccounts.fxGainLoss,
		),
	};
	validatePosting(entry, ctx);
	return entry;
}

export function totalAllocated(targets: readonly SettlementTarget[]): bigint {
	return sumBig(targets.map((t) => t.allocatedMinor));
}
