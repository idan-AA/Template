import { normalizeCurrency } from "@app/db/currency";
import { Decimal, ROUND_HALF_AWAY, shift } from "./decimal";
import { LedgerError } from "./errors";
import { defaultExponent, type ExponentResolver } from "./exponent";

export const MAX_LINE_MINOR = 100_000_000_000_000n;

export function absBig(value: bigint): bigint {
	return value < 0n ? -value : value;
}

export function sumBig(values: Iterable<bigint>): bigint {
	let total = 0n;
	for (const value of values) total += value;
	return total;
}

export function roundHalfAway(value: Decimal): bigint {
	return BigInt(value.toDecimalPlaces(0, ROUND_HALF_AWAY).toFixed(0));
}

export function mulDivRound(a: bigint, b: bigint, c: bigint): bigint {
	if (c <= 0n) {
		throw new LedgerError("INVALID_AMOUNT", "Divisor must be positive.");
	}
	const numerator = a * b;
	const negative = numerator < 0n;
	const magnitude = negative ? -numerator : numerator;
	const quotient = (2n * magnitude + c) / (2n * c);
	return negative ? -quotient : quotient;
}

export function parseRate(rate: string | Decimal): Decimal {
	let parsed: Decimal;
	try {
		parsed = new Decimal(rate);
	} catch {
		throw new LedgerError("INVALID_RATE", "The exchange rate is not a number.");
	}
	if (!parsed.isFinite() || parsed.lessThanOrEqualTo(0)) {
		throw new LedgerError(
			"INVALID_RATE",
			"The exchange rate must be above zero.",
		);
	}
	return parsed;
}

export function minorToDecimal(
	minor: bigint,
	currency: string,
	exponent: ExponentResolver = defaultExponent,
): Decimal {
	return shift(new Decimal(minor.toString()), -exponent(currency));
}

export function decimalToMinor(
	value: Decimal | string,
	currency: string,
	exponent: ExponentResolver = defaultExponent,
): bigint {
	return roundHalfAway(shift(new Decimal(value), exponent(currency)));
}

export function parseMinor(
	text: string,
	currency: string,
	exponent: ExponentResolver = defaultExponent,
): bigint {
	const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text.trim());
	if (!match) {
		throw new LedgerError("INVALID_AMOUNT", `"${text}" is not an amount.`);
	}
	const places = exponent(currency);
	const fraction = match[3] ?? "";
	if (fraction.length > places) {
		throw new LedgerError(
			"TOO_MANY_DECIMALS",
			`${normalizeCurrency(currency)} allows ${places} decimal places.`,
		);
	}
	const digits = BigInt(`${match[2]}${fraction.padEnd(places, "0")}`);
	return match[1] === "-" ? -digits : digits;
}

export function formatMinor(
	minor: bigint,
	currency: string,
	exponent: ExponentResolver = defaultExponent,
): string {
	const places = exponent(currency);
	const sign = minor < 0n ? "-" : "";
	const digits = absBig(minor)
		.toString()
		.padStart(places + 1, "0");
	if (places === 0) return `${sign}${digits}`;
	return `${sign}${digits.slice(0, -places)}.${digits.slice(-places)}`;
}

export function assertLineAmount(minor: bigint): void {
	if (minor <= 0n) {
		throw new LedgerError("INVALID_AMOUNT", "Amounts must be above zero.");
	}
	if (minor > MAX_LINE_MINOR) {
		throw new LedgerError(
			"AMOUNT_TOO_LARGE",
			"That amount is too large to record.",
		);
	}
}

export function convertMinor(
	amountMinor: bigint,
	from: string,
	to: string,
	rate: string | Decimal,
	exponent: ExponentResolver = defaultExponent,
): bigint {
	const source = normalizeCurrency(from);
	const target = normalizeCurrency(to);
	const parsed = parseRate(rate);
	if (source === target) {
		if (!parsed.eq(1)) {
			throw new LedgerError(
				"INVALID_RATE",
				"The rate between a currency and itself must be 1.",
			);
		}
		return amountMinor;
	}
	return roundHalfAway(
		shift(
			new Decimal(amountMinor.toString()).times(parsed),
			exponent(target) - exponent(source),
		),
	);
}
