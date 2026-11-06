import { minorUnitsOf } from "@app/db/currency";

/**
 * Money arrives from the API as a decimal string of MINOR units (cents). Nothing here ever turns
 * it into a JS number: it goes through BigInt and string slicing, so a large balance never loses
 * a cent (docs/plan/bookkeeping.md B5).
 */

function split(minor: string, currency: string) {
	const places = minorUnitsOf(currency);
	const value = BigInt(minor);
	const negative = value < 0n;
	const digits = (negative ? -value : value)
		.toString()
		.padStart(places + 1, "0");

	return {
		negative,
		whole: digits.slice(0, digits.length - places),
		fraction: places === 0 ? "" : digits.slice(-places),
	};
}

/** "1,250.50", with a leading minus when negative. The currency code is shown once in a header. */
export function formatMoney(minor: string, currency: string): string {
	const { negative, whole, fraction } = split(minor, currency);
	const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	return `${negative ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

/** "1250.50": a plain decimal for exports and form fields (no grouping). */
export function formatDecimal(minor: string, currency: string): string {
	const { negative, whole, fraction } = split(minor, currency);

	return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

/**
 * Parses what a person typed ("1,250.5", "1250", "") into minor units. Returns null for text that
 * is not an amount or has more decimals than the currency allows (no silent rounding).
 */
export function parseAmount(text: string, currency: string): bigint | null {
	const cleaned = text.trim().replaceAll(",", "");
	if (cleaned === "") return null;

	const match = /^(\d+)(?:\.(\d+))?$/.exec(cleaned);
	if (!match) return null;

	const places = minorUnitsOf(currency);
	const fraction = match[2] ?? "";
	if (fraction.length > places) return null;

	return BigInt(`${match[1]}${fraction.padEnd(places, "0")}`);
}

/** First day of the fiscal year that contains `today` (both date-only "YYYY-MM-DD"). */
export function fiscalYearStart(today: string, startMonth: number): string {
	const year = Number(today.slice(0, 4));
	const month = Number(today.slice(5, 7));
	const startYear = month >= startMonth ? year : year - 1;

	return `${startYear}-${String(startMonth).padStart(2, "0")}-01`;
}

/** "6 Nov 2026" from a date-only string. A due date has no time zone, so none is applied. */
export function formatDate(dateOnly: string): string {
	return new Date(`${dateOnly}T00:00:00.000Z`).toLocaleDateString("en", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
}

export const TYPE_LABEL = {
	ASSET: "Assets",
	LIABILITY: "Liabilities",
	EQUITY: "Equity",
	INCOME: "Income",
	EXPENSE: "Expenses",
} as const;

export type AccountTypeKey = keyof typeof TYPE_LABEL;

export const TYPE_ORDER: AccountTypeKey[] = [
	"ASSET",
	"LIABILITY",
	"EQUITY",
	"INCOME",
	"EXPENSE",
];

/** Which subtypes each type may hold. Mirrors the database CHECK so a form never offers a refusal. */
export const SUBTYPES_BY_TYPE: Record<AccountTypeKey, string[]> = {
	ASSET: [
		"BANK",
		"CASH",
		"ACCOUNTS_RECEIVABLE",
		"CURRENT_ASSET",
		"FIXED_ASSET",
		"OTHER_ASSET",
	],
	LIABILITY: [
		"CREDIT_CARD",
		"ACCOUNTS_PAYABLE",
		"CURRENT_LIABILITY",
		"TAX_LIABILITY",
		"LONG_TERM_LIABILITY",
	],
	EQUITY: ["OWNER_EQUITY", "RETAINED_EARNINGS"],
	INCOME: ["REVENUE", "OTHER_INCOME"],
	EXPENSE: ["COST_OF_SALES", "OPERATING_EXPENSE", "OTHER_EXPENSE"],
};

export function subtypeLabel(subtype: string): string {
	const words = subtype.toLowerCase().replaceAll("_", " ");

	return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Accounts a manual journal may never touch (engine rule R17): receivable, payable, bank, cash, card. */
const JOURNAL_FORBIDDEN_SUBTYPES = new Set([
	"ACCOUNTS_RECEIVABLE",
	"ACCOUNTS_PAYABLE",
	"BANK",
	"CASH",
	"CREDIT_CARD",
]);

export function isJournalAccount(subtype: string): boolean {
	return !JOURNAL_FORBIDDEN_SUBTYPES.has(subtype);
}

export const SOURCE_LABEL: Record<string, string> = {
	MANUAL: "Journal",
	ADJUSTMENT: "Adjustment",
	OPENING_BALANCE: "Opening balances",
	INVOICE: "Invoice",
	BILL: "Bill",
	CREDIT_NOTE: "Credit note",
	VENDOR_CREDIT: "Vendor credit",
	PAYMENT: "Payment",
	ALLOCATION: "Credit applied",
	BANK_SPEND: "Money out",
	BANK_RECEIVE: "Money in",
	TRANSFER: "Transfer",
	REVERSAL: "Reversal",
};

export function sourceLabel(source: string): string {
	return SOURCE_LABEL[source] ?? source;
}

/** A CSV with a UTF-8 byte order mark so spreadsheets read accented names correctly. */
export function downloadCsv(
	filename: string,
	rows: ReadonlyArray<ReadonlyArray<string>>,
): void {
	const quote = (cell: string) =>
		/[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
	const body = rows.map((row) => row.map(quote).join(",")).join("\r\n");
	const blob = new Blob([`\uFEFF${body}`], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
