import { LedgerError } from "./errors";

export type DateOnly = string;

export type AgingBucket =
	| "CURRENT"
	| "DAYS_1_30"
	| "DAYS_31_60"
	| "DAYS_61_90"
	| "DAYS_OVER_90";

const DATE_SHAPE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateOnly(value: string): boolean {
	const match = DATE_SHAPE.exec(value);
	if (!match) return false;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (year < 1900) return false;
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

export function assertDateOnly(value: string): DateOnly {
	if (!isDateOnly(value)) {
		throw new LedgerError("INVALID_DATE", `"${value}" is not a calendar date.`);
	}
	return value;
}

function toUtcMs(date: DateOnly): number {
	assertDateOnly(date);
	const match = DATE_SHAPE.exec(date) as RegExpExecArray;
	return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function fromUtcMs(ms: number): DateOnly {
	return new Date(ms).toISOString().slice(0, 10);
}

export function businessToday(
	timezone: string,
	now: Date = new Date(),
): DateOnly {
	let parts: Intl.DateTimeFormatPart[];
	try {
		parts = new Intl.DateTimeFormat("en-CA", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).formatToParts(now);
	} catch {
		throw new LedgerError(
			"INVALID_TIMEZONE",
			`"${timezone}" is not a time zone.`,
		);
	}
	const pick = (type: string) =>
		parts.find((part) => part.type === type)?.value ?? "";
	return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export function addDays(date: DateOnly, days: number): DateOnly {
	return fromUtcMs(toUtcMs(date) + days * 86_400_000);
}

export function dayBefore(date: DateOnly): DateOnly {
	return addDays(date, -1);
}

export function daysBetween(from: DateOnly, to: DateOnly): number {
	return Math.round((toUtcMs(to) - toUtcMs(from)) / 86_400_000);
}

export function compareDates(a: DateOnly, b: DateOnly): number {
	return toUtcMs(a) - toUtcMs(b);
}

export function fiscalYearStart(date: DateOnly, startMonth: number): DateOnly {
	assertDateOnly(date);
	if (!Number.isInteger(startMonth) || startMonth < 1 || startMonth > 12) {
		throw new LedgerError(
			"INVALID_DATE",
			"The fiscal year starts in month 1 to 12.",
		);
	}
	const year = Number(date.slice(0, 4));
	const month = Number(date.slice(5, 7));
	const startYear = month >= startMonth ? year : year - 1;
	return `${startYear}-${String(startMonth).padStart(2, "0")}-01`;
}

export function agingBucket(dueDate: DateOnly, asOf: DateOnly): AgingBucket {
	const late = daysBetween(dueDate, asOf);
	if (late <= 0) return "CURRENT";
	if (late <= 30) return "DAYS_1_30";
	if (late <= 60) return "DAYS_31_60";
	if (late <= 90) return "DAYS_61_90";
	return "DAYS_OVER_90";
}

export function isOverdue(dueDate: DateOnly, today: DateOnly): boolean {
	return daysBetween(dueDate, today) > 0;
}
