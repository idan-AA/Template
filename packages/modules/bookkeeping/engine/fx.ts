import { normalizeCurrency } from "@app/db/currency";
import { LedgerError } from "./errors";
import { convertMinor, parseRate, sumBig } from "./money";
import type { Fx, PostingContext, PostingLine, RawLine, Side } from "./types";

export function identityFx(at: string): Fx {
	return { rate: "1", origin: "IDENTITY", at };
}

export function resolveFx(
	currency: string,
	fx: Fx | null,
	ctx: PostingContext,
): Fx {
	const code = normalizeCurrency(currency);
	const base = normalizeCurrency(ctx.baseCurrency);
	if (code === base) return identityFx(ctx.now);
	if (!fx) {
		throw new LedgerError(
			"MISSING_RATE",
			`No exchange rate for ${code} to ${base}. Enter one.`,
		);
	}
	parseRate(fx.rate);
	return fx;
}

export function toPostingLine(raw: RawLine, ctx: PostingContext): PostingLine {
	const fx = resolveFx(raw.currency, raw.fx, ctx);
	const currency = normalizeCurrency(raw.currency);
	return {
		accountId: raw.accountId,
		kind: raw.kind,
		side: raw.side,
		currency,
		amountMinor: raw.amountMinor,
		baseAmountMinor: convertMinor(
			raw.amountMinor,
			currency,
			ctx.baseCurrency,
			fx.rate,
			ctx.exponent,
		),
		fxRate: fx.rate,
		fxOrigin: fx.origin,
		fxRateAt: fx.at,
		counterpartyId: raw.counterpartyId ?? null,
		documentId: raw.documentId ?? null,
		paymentId: raw.paymentId ?? null,
		taxRateId: raw.taxRateId ?? null,
		memo: raw.memo ?? null,
	};
}

export function foreignLineCount(
	lines: readonly PostingLine[],
	baseCurrency: string,
): number {
	const base = normalizeCurrency(baseCurrency);
	return lines.filter((l) => l.kind !== "ROUNDING" && l.currency !== base)
		.length;
}

export function baseDifference(lines: readonly PostingLine[]): bigint {
	const debit = sumBig(
		lines.filter((l) => l.side === "DEBIT").map((l) => l.baseAmountMinor),
	);
	const credit = sumBig(
		lines.filter((l) => l.side === "CREDIT").map((l) => l.baseAmountMinor),
	);
	return debit - credit;
}

export function balanceWith(
	lines: PostingLine[],
	ctx: PostingContext,
	kind: "ROUNDING" | "FX_ADJUSTMENT",
	accountId: string,
): PostingLine[] {
	const difference = baseDifference(lines);
	if (difference === 0n) return lines;
	const side: Side = difference > 0n ? "CREDIT" : "DEBIT";
	const amount = difference > 0n ? difference : -difference;
	if (kind === "ROUNDING") {
		const foreign = foreignLineCount(lines, ctx.baseCurrency);
		if (amount > BigInt(Math.floor(foreign / 2))) {
			throw new LedgerError(
				foreign === 0 ? "UNBALANCED" : "ROUNDING_TOO_LARGE",
				foreign === 0
					? `Debits and credits differ by ${amount}.`
					: "The conversion left a difference larger than rounding can explain.",
			);
		}
	}
	return [
		...lines,
		{
			accountId,
			kind,
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
			memo: null,
		},
	];
}

export function convertAndRound(
	raws: readonly RawLine[],
	ctx: PostingContext,
): PostingLine[] {
	const lines = raws.map((raw) => toPostingLine(raw, ctx));
	return balanceWith(lines, ctx, "ROUNDING", ctx.systemAccounts.rounding);
}
