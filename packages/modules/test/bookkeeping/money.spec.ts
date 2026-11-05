import { describe, expect, test } from "bun:test";
import { minorUnitsOf } from "@app/db/currency";
import {
	assertLineAmount,
	convertMinor,
	Decimal,
	decimalToMinor,
	formatMinor,
	LedgerError,
	MAX_LINE_MINOR,
	minorToDecimal,
	mulDivRound,
	parseMinor,
	roundHalfAway,
} from "../../bookkeeping/engine";
import { exp3 } from "./helpers";

function code(fn: () => unknown): string {
	try {
		fn();
	} catch (error) {
		if (error instanceof LedgerError) return error.code;
		throw error;
	}
	return "NO_ERROR";
}

describe("exponents", () => {
	test("match the repo list", () => {
		expect(minorUnitsOf("USD")).toBe(2);
		expect(minorUnitsOf("JPY")).toBe(0);
		expect(minorUnitsOf(" eur ")).toBe(2);
		expect(minorUnitsOf("ZZZ")).toBe(2);
		expect(minorUnitsOf(null)).toBe(2);
	});

	test("a three decimal currency resolves through the injected resolver", () => {
		expect(exp3("KWD")).toBe(3);
		expect(exp3("USD")).toBe(2);
	});
});

describe("parseMinor and formatMinor", () => {
	const cases: Array<[string, string, bigint]> = [
		["12.34", "USD", 1234n],
		["12.3", "USD", 1230n],
		["12", "USD", 1200n],
		["0.05", "USD", 5n],
		["-5.5", "USD", -550n],
		["100", "JPY", 100n],
		["1.234", "KWD", 1234n],
		["0.001", "KWD", 1n],
		["  7.00 ", "USD", 700n],
	];

	for (const [text, currency, expected] of cases) {
		test(`parse ${text} ${currency}`, () => {
			expect(parseMinor(text, currency, exp3)).toBe(expected);
		});
	}

	const rejected: Array<[string, string, string]> = [
		["100.5", "JPY", "TOO_MANY_DECIMALS"],
		["1.2345", "KWD", "TOO_MANY_DECIMALS"],
		["12.345", "USD", "TOO_MANY_DECIMALS"],
		["abc", "USD", "INVALID_AMOUNT"],
		["1,000", "USD", "INVALID_AMOUNT"],
		["", "USD", "INVALID_AMOUNT"],
		["5.", "USD", "INVALID_AMOUNT"],
		[".5", "USD", "INVALID_AMOUNT"],
		["1e3", "USD", "INVALID_AMOUNT"],
	];

	for (const [text, currency, expected] of rejected) {
		test(`reject ${JSON.stringify(text)} ${currency}`, () => {
			expect(code(() => parseMinor(text, currency, exp3))).toBe(expected);
		});
	}

	const formats: Array<[bigint, string, string]> = [
		[1234n, "USD", "12.34"],
		[5n, "USD", "0.05"],
		[-5n, "USD", "-0.05"],
		[0n, "USD", "0.00"],
		[100n, "JPY", "100"],
		[1n, "KWD", "0.001"],
		[-1234567n, "USD", "-12345.67"],
	];

	for (const [minor, currency, expected] of formats) {
		test(`format ${minor} ${currency}`, () => {
			expect(formatMinor(minor, currency, exp3)).toBe(expected);
		});
	}

	test("format then parse round trips", () => {
		for (const currency of ["USD", "JPY", "KWD"]) {
			for (const value of [0n, 1n, 9n, 10n, 99n, 100n, 12345n, 99999999999n]) {
				const text = formatMinor(value, currency, exp3);
				expect(parseMinor(text, currency, exp3)).toBe(value);
			}
		}
	});
});

describe("rounding", () => {
	const cases: Array<[string, bigint]> = [
		["0.5", 1n],
		["-0.5", -1n],
		["1.5", 2n],
		["2.5", 3n],
		["-2.5", -3n],
		["0.49999", 0n],
		["-0.49999", 0n],
		["2.4999999", 2n],
		["0", 0n],
		["7", 7n],
		["-7.5", -8n],
		["123456789012345678.5", 123456789012345679n],
	];

	for (const [text, expected] of cases) {
		test(`round half away ${text}`, () => {
			expect(roundHalfAway(new Decimal(text))).toBe(expected);
		});
	}

	const divisions: Array<[bigint, bigint, bigint, bigint]> = [
		[5n, 1n, 2n, 3n],
		[-5n, 1n, 2n, -3n],
		[7n, 1n, 3n, 2n],
		[8n, 1n, 3n, 3n],
		[1n, 1n, 2n, 1n],
		[-1n, 1n, 2n, -1n],
		[0n, 5n, 7n, 0n],
		[10n, 3n, 4n, 8n],
		[11000n, 3333n, 10000n, 3666n],
	];

	for (const [a, b, c, expected] of divisions) {
		test(`mulDivRound ${a} ${b} ${c}`, () => {
			expect(mulDivRound(a, b, c)).toBe(expected);
		});
	}

	test("mulDivRound rejects a non positive divisor", () => {
		expect(code(() => mulDivRound(1n, 1n, 0n))).toBe("INVALID_AMOUNT");
		expect(code(() => mulDivRound(1n, 1n, -3n))).toBe("INVALID_AMOUNT");
	});
});

describe("decimal conversion", () => {
	test("minor to decimal and back", () => {
		expect(minorToDecimal(1234n, "USD", exp3).toString()).toBe("12.34");
		expect(minorToDecimal(100n, "JPY", exp3).toString()).toBe("100");
		expect(minorToDecimal(1n, "KWD", exp3).toString()).toBe("0.001");
		expect(decimalToMinor("12.345", "USD", exp3)).toBe(1235n);
		expect(decimalToMinor("-12.345", "USD", exp3)).toBe(-1235n);
		expect(decimalToMinor("0.0005", "KWD", exp3)).toBe(1n);
	});
});

describe("convertMinor", () => {
	const cases: Array<[string, bigint, string, string, string, bigint]> = [
		["EUR to USD", 10000n, "EUR", "USD", "1.1", 11000n],
		["JPY to USD", 10000n, "JPY", "USD", "0.0067", 6700n],
		["USD to JPY", 10000n, "USD", "JPY", "150", 15000n],
		["KWD to USD", 12345n, "KWD", "USD", "3.2", 3950n],
		["USD to KWD", 3950n, "USD", "KWD", "0.3125", 12344n],
		["half away positive", 1n, "USD", "JPY", "150", 2n],
		["half away negative", -1n, "USD", "JPY", "150", -2n],
		["zero stays zero", 0n, "EUR", "USD", "1.37", 0n],
		["tiny becomes zero", 1n, "JPY", "USD", "0.0001", 0n],
	];

	for (const [name, amount, from, to, rate, expected] of cases) {
		test(name, () => {
			expect(convertMinor(amount, from, to, rate, exp3)).toBe(expected);
		});
	}

	test("same currency needs rate one and returns the amount", () => {
		expect(convertMinor(123n, "USD", "USD", "1", exp3)).toBe(123n);
		expect(convertMinor(123n, "usd", "USD", "1.0", exp3)).toBe(123n);
		expect(code(() => convertMinor(123n, "USD", "USD", "1.1", exp3))).toBe(
			"INVALID_RATE",
		);
	});

	test("rejects a bad rate", () => {
		for (const rate of ["0", "-1", "abc", "", "Infinity", "NaN"]) {
			expect(code(() => convertMinor(100n, "EUR", "USD", rate, exp3))).toBe(
				"INVALID_RATE",
			);
		}
	});

	test("matches an independent bigint calculation at the top of the range", () => {
		const amount = 99_999_999_999_999n;
		const expected = mulDivRound(amount, 1_234_567_891n, 1_000_000n);
		expect(convertMinor(amount, "USD", "EUR", "1234.567891", exp3)).toBe(
			expected,
		);
	});
});

describe("assertLineAmount", () => {
	test("bounds", () => {
		expect(code(() => assertLineAmount(0n))).toBe("INVALID_AMOUNT");
		expect(code(() => assertLineAmount(-5n))).toBe("INVALID_AMOUNT");
		expect(code(() => assertLineAmount(1n))).toBe("NO_ERROR");
		expect(code(() => assertLineAmount(MAX_LINE_MINOR))).toBe("NO_ERROR");
		expect(code(() => assertLineAmount(MAX_LINE_MINOR + 1n))).toBe(
			"AMOUNT_TOO_LARGE",
		);
	});
});
