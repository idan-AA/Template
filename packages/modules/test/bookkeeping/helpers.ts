import { minorUnitsOf } from "@app/db/currency";
import type {
	AccountInfo,
	DocLineInput,
	DocumentInput,
	Fx,
	PostingContext,
	PostingInput,
	PostingLine,
	SimLedger,
	SystemAccounts,
	TaxRateInput,
} from "../../bookkeeping/engine";

export const SYS: SystemAccounts = {
	receivable: "ar",
	payable: "ap",
	fxGainLoss: "fx",
	rounding: "rnd",
	suspense: "susp",
	openingBalanceEquity: "obe",
};

export const NOW = "2026-11-04T00:00:00.000Z";

export const exp3 = (code: string): number =>
	code === "KWD" || code === "BHD" ? 3 : minorUnitsOf(code);

function account(
	id: string,
	type: AccountInfo["type"],
	subtype: AccountInfo["subtype"],
	systemRole: AccountInfo["systemRole"] = null,
	archived = false,
): [string, AccountInfo] {
	return [id, { id, type, subtype, systemRole, archived, currency: null }];
}

export const ACCOUNTS: ReadonlyMap<string, AccountInfo> = new Map([
	account("ar", "ASSET", "ACCOUNTS_RECEIVABLE", "ACCOUNTS_RECEIVABLE"),
	account("ap", "LIABILITY", "ACCOUNTS_PAYABLE", "ACCOUNTS_PAYABLE"),
	account("fx", "EXPENSE", "OTHER_EXPENSE", "FX_GAIN_LOSS"),
	account("rnd", "EXPENSE", "OTHER_EXPENSE", "ROUNDING"),
	account("susp", "ASSET", "CURRENT_ASSET", "SUSPENSE"),
	account("obe", "EQUITY", "OWNER_EQUITY", "OPENING_BALANCE_EQUITY"),
	account("rev", "INCOME", "REVENUE"),
	account("rev2", "INCOME", "REVENUE"),
	account("exp", "EXPENSE", "OPERATING_EXPENSE"),
	account("exp2", "EXPENSE", "OPERATING_EXPENSE"),
	account("bank", "ASSET", "BANK"),
	account("bank2", "ASSET", "BANK"),
	account("card", "LIABILITY", "CREDIT_CARD"),
	account("taxpay", "LIABILITY", "TAX_LIABILITY"),
	account("taxrec", "ASSET", "CURRENT_ASSET"),
	account("equity", "EQUITY", "OWNER_EQUITY"),
	account("fixed", "ASSET", "FIXED_ASSET"),
	account("loan", "LIABILITY", "LONG_TERM_LIABILITY"),
	account("old", "EXPENSE", "OPERATING_EXPENSE", null, true),
]);

export function makeCtx(
	base = "USD",
	options: { accounts?: boolean } = {},
): PostingContext {
	return {
		baseCurrency: base,
		systemAccounts: SYS,
		now: NOW,
		exponent: exp3,
		accounts: options.accounts === false ? undefined : ACCOUNTS,
	};
}

export function fx(rate: string, at: string = NOW): Fx {
	return { rate, origin: "MANUAL", at };
}

export const T825: TaxRateInput = {
	id: "t825",
	rateBp: 825,
	accountId: "taxpay",
	recoverable: true,
};

export const T1000: TaxRateInput = {
	id: "t1000",
	rateBp: 1000,
	accountId: "taxpay",
	recoverable: true,
};

export const P825: TaxRateInput = {
	id: "p825",
	rateBp: 825,
	accountId: "taxrec",
	recoverable: true,
};

export const NONREC: TaxRateInput = {
	id: "nr",
	rateBp: 825,
	accountId: "taxrec",
	recoverable: false,
};

export function line(
	accountId: string,
	quantity: string,
	unitMinor: bigint,
	taxRate: TaxRateInput | null = null,
	discountBp = 0,
): DocLineInput {
	return {
		description: "item",
		quantity,
		unitMinor,
		discountBp,
		accountId,
		taxRate,
	};
}

export function doc(
	partial: Partial<DocumentInput> & Pick<DocumentInput, "lines">,
): DocumentInput {
	return {
		id: "d1",
		kind: "INVOICE",
		counterpartyId: "c1",
		currency: "USD",
		amountsAre: "EXCLUSIVE",
		issueDate: "2026-11-04",
		fx: null,
		...partial,
	};
}

export function tags(l: PostingLine): string {
	const parts: string[] = [];
	if (l.documentId) parts.push(`d:${l.documentId}`);
	if (l.paymentId) parts.push(`p:${l.paymentId}`);
	if (l.taxRateId) parts.push(`t:${l.taxRateId}`);
	return parts.join(",");
}

export function shape(source: PostingInput | readonly PostingLine[]): string[] {
	const lines = Array.isArray(source)
		? (source as readonly PostingLine[])
		: (source as PostingInput).lines;
	return lines.map(
		(l) =>
			`${l.kind}|${l.accountId}|${l.side}|${l.currency} ${l.amountMinor}|${l.baseAmountMinor}|${tags(l)}`,
	);
}

export const RATE_FIELDS = (rate: string) => ({
	fxRate: rate,
	fxOrigin: "MANUAL" as const,
	fxRateAt: NOW,
});

export function assertNets(sim: SimLedger): void {
	for (const [account, row] of sim.trialBalance()) {
		if (row.debitBase !== row.creditBase) {
			throw new Error(`account ${account} does not net to zero`);
		}
	}
}
