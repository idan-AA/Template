import type { ExponentResolver } from "./exponent";
import type { DateOnly } from "./time";

export type Side = "DEBIT" | "CREDIT";

export type LineKind = "NORMAL" | "TAX" | "FX_ADJUSTMENT" | "ROUNDING";

export type FxOrigin = "IDENTITY" | "MANUAL" | "FETCHED";

export type EntrySource =
	| "MANUAL"
	| "ADJUSTMENT"
	| "OPENING_BALANCE"
	| "INVOICE"
	| "BILL"
	| "CREDIT_NOTE"
	| "VENDOR_CREDIT"
	| "PAYMENT"
	| "ALLOCATION"
	| "BANK_SPEND"
	| "BANK_RECEIVE"
	| "TRANSFER"
	| "REVERSAL";

export type AccountType =
	| "ASSET"
	| "LIABILITY"
	| "EQUITY"
	| "INCOME"
	| "EXPENSE";

export type AccountSubtype =
	| "BANK"
	| "CASH"
	| "CREDIT_CARD"
	| "ACCOUNTS_RECEIVABLE"
	| "CURRENT_ASSET"
	| "FIXED_ASSET"
	| "OTHER_ASSET"
	| "ACCOUNTS_PAYABLE"
	| "CURRENT_LIABILITY"
	| "TAX_LIABILITY"
	| "LONG_TERM_LIABILITY"
	| "OWNER_EQUITY"
	| "RETAINED_EARNINGS"
	| "REVENUE"
	| "OTHER_INCOME"
	| "COST_OF_SALES"
	| "OPERATING_EXPENSE"
	| "OTHER_EXPENSE";

export type AccountSystemRole =
	| "ACCOUNTS_RECEIVABLE"
	| "ACCOUNTS_PAYABLE"
	| "RETAINED_EARNINGS"
	| "OPENING_BALANCE_EQUITY"
	| "FX_GAIN_LOSS"
	| "ROUNDING"
	| "SUSPENSE";

export type AmountsAre = "EXCLUSIVE" | "INCLUSIVE" | "NO_TAX";

export interface Fx {
	rate: string;
	origin: FxOrigin;
	at: string;
}

export interface PostingLine {
	accountId: string;
	kind: LineKind;
	side: Side;
	currency: string;
	amountMinor: bigint;
	baseAmountMinor: bigint;
	fxRate: string;
	fxOrigin: FxOrigin;
	fxRateAt: string;
	counterpartyId?: string | null;
	documentId?: string | null;
	paymentId?: string | null;
	taxRateId?: string | null;
	memo?: string | null;
}

export interface PostingInput {
	source: EntrySource;
	sourceId: string | null;
	sourceKey: string;
	date: DateOnly;
	memo: string | null;
	baseCurrency: string;
	lines: PostingLine[];
	reversesId?: string | null;
}

export interface SystemAccounts {
	receivable: string;
	payable: string;
	fxGainLoss: string;
	rounding: string;
	suspense: string;
	openingBalanceEquity: string;
}

export interface AccountInfo {
	id: string;
	type: AccountType;
	subtype: AccountSubtype;
	systemRole: AccountSystemRole | null;
	archived: boolean;
	currency: string | null;
}

export interface PostingContext {
	baseCurrency: string;
	systemAccounts: SystemAccounts;
	now: string;
	accounts?: ReadonlyMap<string, AccountInfo>;
	exponent?: ExponentResolver;
}

export interface RawLine {
	accountId: string;
	kind: LineKind;
	side: Side;
	currency: string;
	amountMinor: bigint;
	fx: Fx | null;
	counterpartyId?: string | null;
	documentId?: string | null;
	paymentId?: string | null;
	taxRateId?: string | null;
	memo?: string | null;
}

export interface TaxRateInput {
	id: string;
	rateBp: number;
	accountId: string;
	recoverable: boolean;
}

export type DocKind = "INVOICE" | "BILL" | "CREDIT_NOTE" | "VENDOR_CREDIT";

export interface DocLineInput {
	description: string;
	quantity: string;
	unitMinor: bigint;
	discountBp: number;
	accountId: string;
	taxRate: TaxRateInput | null;
}

export interface DocumentInput {
	id: string;
	kind: DocKind;
	counterpartyId: string;
	currency: string;
	amountsAre: AmountsAre;
	issueDate: DateOnly;
	lines: DocLineInput[];
	fx: Fx | null;
	isOpening?: boolean;
	memo?: string | null;
}

export interface ComputedLine {
	description: string;
	accountId: string;
	taxRate: TaxRateInput | null;
	netMinor: bigint;
	taxMinor: bigint;
}

export interface ComputedTax {
	taxRate: TaxRateInput;
	taxMinor: bigint;
}

export interface ComputedDocument {
	lines: ComputedLine[];
	taxByRate: ComputedTax[];
	subtotalMinor: bigint;
	taxMinor: bigint;
	totalMinor: bigint;
}

export interface SettlementTarget {
	documentId?: string | null;
	paymentId?: string | null;
	allocatedMinor: bigint;
	remainingMinor: bigint;
	remainingBaseMinor: bigint;
	fxRate: string;
	fxOrigin: FxOrigin;
	fxRateAt: string;
}

export interface PostedEntryView {
	id: string;
	number: string | null;
	date: DateOnly;
	source: EntrySource;
	baseCurrency: string;
	lines: PostingLine[];
	reversesId?: string | null;
}

export function oppositeSide(side: Side): Side {
	return side === "DEBIT" ? "CREDIT" : "DEBIT";
}
