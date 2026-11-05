import { describe, expect, test } from "bun:test";
import {
	addDays,
	agingBucket,
	businessToday,
	dayBefore,
	daysBetween,
	fiscalYearStart,
	isDateOnly,
	isOverdue,
	LedgerError,
} from "../../bookkeeping/engine";

describe("isDateOnly", () => {
	const valid = ["2026-11-04", "2028-02-29", "1900-01-01", "2026-12-31"];
	const invalid = [
		"2026-02-29",
		"2026-13-01",
		"2026-00-10",
		"2026-04-31",
		"26-01-01",
		"2026-1-1",
		"1899-12-31",
		"2026-11-04T00:00:00Z",
		"",
	];
	for (const value of valid) {
		test(`valid ${value}`, () => expect(isDateOnly(value)).toBe(true));
	}
	for (const value of invalid) {
		test(`invalid ${JSON.stringify(value)}`, () =>
			expect(isDateOnly(value)).toBe(false));
	}
});

describe("businessToday", () => {
	const cases: Array<[string, string, string]> = [
		["UTC", "2026-11-04T03:30:00Z", "2026-11-04"],
		["America/Los_Angeles", "2026-11-04T03:30:00Z", "2026-11-03"],
		["Pacific/Auckland", "2026-11-04T03:30:00Z", "2026-11-04"],
		["Pacific/Auckland", "2026-11-04T12:30:00Z", "2026-11-05"],
		["Asia/Kolkata", "2026-11-04T19:00:00Z", "2026-11-05"],
		["Asia/Kolkata", "2026-11-04T18:29:00Z", "2026-11-04"],
		["America/New_York", "2026-03-08T04:59:00Z", "2026-03-07"],
		["America/New_York", "2026-03-08T07:30:00Z", "2026-03-08"],
		["America/New_York", "2026-11-01T05:30:00Z", "2026-11-01"],
		["Europe/London", "2026-06-30T23:30:00Z", "2026-07-01"],
		["Europe/London", "2026-01-30T23:30:00Z", "2026-01-30"],
	];
	for (const [zone, instant, expected] of cases) {
		test(`${zone} at ${instant}`, () => {
			expect(businessToday(zone, new Date(instant))).toBe(expected);
		});
	}

	test("an invalid time zone is a ledger error", () => {
		try {
			businessToday("Mars/Base", new Date());
			throw new Error("did not throw");
		} catch (error) {
			expect(error).toBeInstanceOf(LedgerError);
			expect((error as LedgerError).code).toBe("INVALID_TIMEZONE");
		}
	});
});

describe("date arithmetic", () => {
	test("addDays crosses month, year and leap day", () => {
		expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
		expect(addDays("2028-02-28", 2)).toBe("2028-03-01");
		expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
		expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
		expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
		expect(addDays("2026-11-04", 0)).toBe("2026-11-04");
	});

	test("dayBefore", () => {
		expect(dayBefore("2026-01-01")).toBe("2025-12-31");
		expect(dayBefore("2028-03-01")).toBe("2028-02-29");
	});

	test("daysBetween ignores daylight saving", () => {
		expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
		expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
		expect(daysBetween("2026-11-04", "2026-11-04")).toBe(0);
		expect(daysBetween("2026-11-04", "2026-11-01")).toBe(-3);
	});

	test("an impossible date throws", () => {
		expect(() => addDays("2026-02-30", 1)).toThrow(LedgerError);
	});
});

describe("fiscalYearStart", () => {
	const cases: Array<[string, number, string]> = [
		["2026-11-04", 1, "2026-01-01"],
		["2026-03-15", 4, "2025-04-01"],
		["2026-04-01", 4, "2026-04-01"],
		["2026-11-04", 11, "2026-11-01"],
		["2026-10-31", 11, "2025-11-01"],
		["2026-01-01", 7, "2025-07-01"],
	];
	for (const [date, month, expected] of cases) {
		test(`${date} starting month ${month}`, () => {
			expect(fiscalYearStart(date, month)).toBe(expected);
		});
	}
	test("rejects a bad month", () => {
		expect(() => fiscalYearStart("2026-01-01", 13)).toThrow(LedgerError);
		expect(() => fiscalYearStart("2026-01-01", 0)).toThrow(LedgerError);
	});
});

describe("aging", () => {
	const due = "2026-10-01";
	const cases: Array<[number, string]> = [
		[-5, "CURRENT"],
		[0, "CURRENT"],
		[1, "DAYS_1_30"],
		[30, "DAYS_1_30"],
		[31, "DAYS_31_60"],
		[60, "DAYS_31_60"],
		[61, "DAYS_61_90"],
		[90, "DAYS_61_90"],
		[91, "DAYS_OVER_90"],
		[400, "DAYS_OVER_90"],
	];
	for (const [late, bucket] of cases) {
		test(`${late} days past due`, () => {
			expect(agingBucket(due, addDays(due, late))).toBe(bucket as never);
		});
	}
	test("overdue starts the day after the due date", () => {
		expect(isOverdue(due, due)).toBe(false);
		expect(isOverdue(due, addDays(due, 1))).toBe(true);
	});
});
