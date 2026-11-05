import { describe, expect, test } from "bun:test";
import {
	computeDocument,
	enteredAmount,
	LedgerError,
} from "../../bookkeeping/engine";
import { doc, line, NONREC, P825, T825, T1000 } from "./helpers";

function codeOf(fn: () => unknown): string {
	try {
		fn();
	} catch (error) {
		if (error instanceof LedgerError) return error.code;
		throw error;
	}
	return "NO_ERROR";
}

describe("line amounts", () => {
	const cases: Array<[string, string, bigint, number, bigint]> = [
		["whole", "2", 5000n, 0, 10000n],
		["discount ten percent", "1", 10000n, 1000, 9000n],
		["fractional half rounds away", "2.5", 1999n, 0, 4998n],
		["fractional quantity", "0.3333", 10000n, 0, 3333n],
		["quantity four places", "1.2345", 1000n, 0, 1235n],
		["full discount", "3", 1000n, 10000, 0n],
		["zero quantity", "0", 1000n, 0, 0n],
	];
	for (const [name, quantity, unit, discount, expected] of cases) {
		test(name, () => {
			expect(enteredAmount(line("rev", quantity, unit, null, discount))).toBe(
				expected,
			);
		});
	}
});

describe("tax exclusive", () => {
	const cases: Array<[string, bigint, bigint, bigint]> = [
		["simple", 10000n, 825n, 10825n],
		["rounds up", 9999n, 825n, 10824n],
		["half rounds away", 10n, 1n, 11n],
	];

	test("eight point two five percent on 100.00", () => {
		const computed = computeDocument(
			doc({ lines: [line("rev", "1", 10000n, T825)] }),
		);
		expect(computed.subtotalMinor).toBe(10000n);
		expect(computed.taxMinor).toBe(825n);
		expect(computed.totalMinor).toBe(10825n);
	});

	test("rounding is per line", () => {
		const computed = computeDocument(
			doc({
				lines: [line("rev", "1", 9999n, T825), line("rev", "1", 9999n, T825)],
			}),
		);
		expect(computed.lines.map((l) => l.taxMinor)).toEqual([825n, 825n]);
		expect(computed.taxMinor).toBe(1650n);
		expect(computed.taxByRate).toHaveLength(1);
		expect(computed.taxByRate[0]?.taxMinor).toBe(1650n);
	});

	test("half boundaries round away from zero", () => {
		const five = { ...T825, id: "five", rateBp: 500 };
		const a = computeDocument(doc({ lines: [line("rev", "1", 10n, five)] }));
		expect(a.taxMinor).toBe(1n);
		const b = computeDocument(doc({ lines: [line("rev", "1", 30n, five)] }));
		expect(b.taxMinor).toBe(2n);
	});

	test("zero rate adds nothing and creates no tax group", () => {
		const zero = { ...T825, id: "zero", rateBp: 0 };
		const computed = computeDocument(
			doc({ lines: [line("rev", "1", 1000n, zero)] }),
		);
		expect(computed.taxMinor).toBe(0n);
		expect(computed.taxByRate).toHaveLength(0);
		expect(computed.totalMinor).toBe(1000n);
	});

	test("two rates stay separate and keep first seen order", () => {
		const computed = computeDocument(
			doc({
				lines: [
					line("rev", "1", 10000n, T1000),
					line("rev", "1", 10000n, T825),
					line("rev", "1", 5000n, T1000),
				],
			}),
		);
		expect(computed.taxByRate.map((t) => [t.taxRate.id, t.taxMinor])).toEqual([
			["t1000", 1500n],
			["t825", 825n],
		]);
	});

	for (const [name, net, tax, total] of cases) {
		test(`total ${name}`, () => {
			expect(net + tax).toBe(total);
		});
	}
});

describe("tax inclusive", () => {
	test("gross splits into net and tax", () => {
		const computed = computeDocument(
			doc({ amountsAre: "INCLUSIVE", lines: [line("rev", "1", 10825n, T825)] }),
		);
		expect(computed.subtotalMinor).toBe(10000n);
		expect(computed.taxMinor).toBe(825n);
		expect(computed.totalMinor).toBe(10825n);
	});

	test("an awkward gross still adds back to the gross", () => {
		const computed = computeDocument(
			doc({ amountsAre: "INCLUSIVE", lines: [line("rev", "1", 1000n, T825)] }),
		);
		expect(computed.subtotalMinor).toBe(924n);
		expect(computed.taxMinor).toBe(76n);
		expect(computed.totalMinor).toBe(1000n);
	});

	test("a line without a rate is all net", () => {
		const computed = computeDocument(
			doc({ amountsAre: "INCLUSIVE", lines: [line("rev", "1", 1000n)] }),
		);
		expect(computed.taxMinor).toBe(0n);
		expect(computed.totalMinor).toBe(1000n);
	});
});

describe("purchase tax", () => {
	test("unrecovered tax is allowed on a bill", () => {
		const computed = computeDocument(
			doc({ kind: "BILL", lines: [line("exp", "1", 10000n, NONREC)] }),
		);
		expect(computed.taxMinor).toBe(825n);
		expect(computed.totalMinor).toBe(10825n);
	});

	test("recoverable purchase rate", () => {
		const computed = computeDocument(
			doc({ kind: "BILL", lines: [line("exp", "1", 10000n, P825)] }),
		);
		expect(computed.taxByRate[0]?.taxRate.id).toBe("p825");
	});
});

describe("rejections", () => {
	const invalid: Array<[string, () => unknown, string]> = [
		[
			"no tax mode with a rate",
			() =>
				computeDocument(
					doc({ amountsAre: "NO_TAX", lines: [line("rev", "1", 100n, T825)] }),
				),
			"INVALID_TAX",
		],
		[
			"unrecovered tax on a sale",
			() => computeDocument(doc({ lines: [line("rev", "1", 100n, NONREC)] })),
			"INVALID_TAX",
		],
		[
			"unrecovered tax on a credit note",
			() =>
				computeDocument(
					doc({ kind: "CREDIT_NOTE", lines: [line("rev", "1", 100n, NONREC)] }),
				),
			"INVALID_TAX",
		],
		[
			"negative quantity",
			() => computeDocument(doc({ lines: [line("rev", "-1", 100n)] })),
			"INVALID_LINE",
		],
		[
			"non numeric quantity",
			() => computeDocument(doc({ lines: [line("rev", "abc", 100n)] })),
			"INVALID_LINE",
		],
		[
			"negative price",
			() => computeDocument(doc({ lines: [line("rev", "1", -1n)] })),
			"INVALID_LINE",
		],
		[
			"discount above 100 percent",
			() =>
				computeDocument(doc({ lines: [line("rev", "1", 100n, null, 10001)] })),
			"INVALID_LINE",
		],
		[
			"fractional discount",
			() =>
				computeDocument(doc({ lines: [line("rev", "1", 100n, null, 12.5)] })),
			"INVALID_LINE",
		],
		["no lines", () => computeDocument(doc({ lines: [] })), "EMPTY_DOCUMENT"],
		[
			"total of zero",
			() => computeDocument(doc({ lines: [line("rev", "1", 0n)] })),
			"EMPTY_DOCUMENT",
		],
		[
			"absurd rate",
			() =>
				computeDocument(
					doc({ lines: [line("rev", "1", 100n, { ...T825, rateBp: 200000 })] }),
				),
			"INVALID_TAX",
		],
		[
			"amount over the cap",
			() =>
				computeDocument(
					doc({ lines: [line("rev", "1", 100_000_000_000_001n)] }),
				),
			"AMOUNT_TOO_LARGE",
		],
	];
	for (const [name, fn, expected] of invalid) {
		test(name, () => expect(codeOf(fn)).toBe(expected));
	}
});
