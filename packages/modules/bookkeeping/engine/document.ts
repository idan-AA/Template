import { Decimal } from "./decimal";
import { LedgerError } from "./errors";
import { defaultExponent, type ExponentResolver } from "./exponent";
import { assertLineAmount, mulDivRound, roundHalfAway, sumBig } from "./money";
import type {
	AmountsAre,
	ComputedDocument,
	ComputedLine,
	ComputedTax,
	DocKind,
	DocLineInput,
	DocumentInput,
	TaxRateInput,
} from "./types";

const BASIS = 10_000n;

export function isSalesKind(kind: DocKind): boolean {
	return kind === "INVOICE" || kind === "CREDIT_NOTE";
}

export function enteredAmount(line: DocLineInput): bigint {
	let quantity: Decimal;
	try {
		quantity = new Decimal(line.quantity);
	} catch {
		throw new LedgerError("INVALID_LINE", "The quantity is not a number.");
	}
	if (!quantity.isFinite() || quantity.isNegative()) {
		throw new LedgerError("INVALID_LINE", "The quantity cannot be negative.");
	}
	if (line.unitMinor < 0n) {
		throw new LedgerError("INVALID_LINE", "The unit price cannot be negative.");
	}
	if (
		!Number.isInteger(line.discountBp) ||
		line.discountBp < 0 ||
		line.discountBp > 10_000
	) {
		throw new LedgerError(
			"INVALID_LINE",
			"The discount must be 0 to 100 percent.",
		);
	}
	return roundHalfAway(
		quantity
			.times(line.unitMinor.toString())
			.times(10_000 - line.discountBp)
			.div(10_000),
	);
}

function assertTaxRate(rate: TaxRateInput): void {
	if (
		!Number.isInteger(rate.rateBp) ||
		rate.rateBp < 0 ||
		rate.rateBp > 100_000
	) {
		throw new LedgerError(
			"INVALID_TAX",
			"A tax rate must be 0 to 1000 percent.",
		);
	}
}

export function splitGross(
	gross: bigint,
	taxRate: TaxRateInput | null,
): { net: bigint; tax: bigint } {
	if (!taxRate) return { net: gross, tax: 0n };
	assertTaxRate(taxRate);
	const net = mulDivRound(gross, BASIS, BASIS + BigInt(taxRate.rateBp));
	return { net, tax: gross - net };
}

export function addTax(
	net: bigint,
	taxRate: TaxRateInput | null,
): { net: bigint; tax: bigint } {
	if (!taxRate) return { net, tax: 0n };
	assertTaxRate(taxRate);
	return { net, tax: mulDivRound(net, BigInt(taxRate.rateBp), BASIS) };
}

export function computeLine(
	line: DocLineInput,
	amountsAre: AmountsAre,
	kind: DocKind,
): ComputedLine {
	const entered = enteredAmount(line);
	if (amountsAre === "NO_TAX" && line.taxRate) {
		throw new LedgerError(
			"INVALID_TAX",
			"A document that carries no tax cannot use a tax rate.",
		);
	}
	if (line.taxRate && !line.taxRate.recoverable && isSalesKind(kind)) {
		throw new LedgerError(
			"INVALID_TAX",
			"Only purchase tax can be left unrecovered.",
		);
	}
	const split =
		amountsAre === "INCLUSIVE"
			? splitGross(entered, line.taxRate)
			: addTax(entered, line.taxRate);
	return {
		description: line.description,
		accountId: line.accountId,
		taxRate: line.taxRate,
		netMinor: split.net,
		taxMinor: split.tax,
	};
}

export function computeDocument(
	doc: Pick<DocumentInput, "kind" | "amountsAre" | "lines" | "currency">,
	_exponent: ExponentResolver = defaultExponent,
): ComputedDocument {
	if (doc.lines.length === 0) {
		throw new LedgerError(
			"EMPTY_DOCUMENT",
			"A document needs at least one line.",
		);
	}
	const lines = doc.lines.map((line) =>
		computeLine(line, doc.amountsAre, doc.kind),
	);
	const byRate = new Map<string, ComputedTax>();
	for (const line of lines) {
		if (!line.taxRate || line.taxMinor === 0n) continue;
		const existing = byRate.get(line.taxRate.id);
		if (existing) existing.taxMinor += line.taxMinor;
		else
			byRate.set(line.taxRate.id, {
				taxRate: line.taxRate,
				taxMinor: line.taxMinor,
			});
	}
	const subtotalMinor = sumBig(lines.map((l) => l.netMinor));
	const taxMinor = sumBig(lines.map((l) => l.taxMinor));
	const totalMinor = subtotalMinor + taxMinor;
	if (totalMinor <= 0n) {
		throw new LedgerError(
			"EMPTY_DOCUMENT",
			"A document total must be above zero.",
		);
	}
	assertLineAmount(totalMinor);
	return {
		lines,
		taxByRate: [...byRate.values()],
		subtotalMinor,
		taxMinor,
		totalMinor,
	};
}
