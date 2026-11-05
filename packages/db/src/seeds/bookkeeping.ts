import type { Prisma, PrismaClient } from "../generated/prisma/client";
import type {
	AccountSubtype,
	AccountSystemRole,
	AccountType,
} from "../generated/prisma/enums";

interface SeedAccount {
	code: string;
	name: string;
	type: AccountType;
	subtype: AccountSubtype;
	systemRole?: AccountSystemRole;
}

// docs/plan/bookkeeping.md 10.1: locked system accounts, every preset.
export const SYSTEM_ACCOUNTS: readonly SeedAccount[] = [
	{
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		subtype: "ACCOUNTS_RECEIVABLE",
		systemRole: "ACCOUNTS_RECEIVABLE",
	},
	{
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		subtype: "ACCOUNTS_PAYABLE",
		systemRole: "ACCOUNTS_PAYABLE",
	},
	{
		code: "2300",
		name: "Sales Tax Payable",
		type: "LIABILITY",
		subtype: "TAX_LIABILITY",
	},
	{
		code: "1400",
		name: "Sales Tax Receivable (Input Tax)",
		type: "ASSET",
		subtype: "CURRENT_ASSET",
	},
	{
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		subtype: "OWNER_EQUITY",
	},
	{
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		subtype: "RETAINED_EARNINGS",
		systemRole: "RETAINED_EARNINGS",
	},
	{
		code: "3900",
		name: "Opening Balance Equity",
		type: "EQUITY",
		subtype: "OWNER_EQUITY",
		systemRole: "OPENING_BALANCE_EQUITY",
	},
	{
		code: "1900",
		name: "Uncategorized (review)",
		type: "ASSET",
		subtype: "CURRENT_ASSET",
		systemRole: "SUSPENSE",
	},
	{
		code: "7100",
		name: "Foreign Exchange Gain/Loss",
		type: "EXPENSE",
		subtype: "OTHER_EXPENSE",
		systemRole: "FX_GAIN_LOSS",
	},
	{
		code: "7900",
		name: "Rounding",
		type: "EXPENSE",
		subtype: "OTHER_EXPENSE",
		systemRole: "ROUNDING",
	},
];

const a = (
	code: string,
	name: string,
	type: AccountType,
	subtype: AccountSubtype,
): SeedAccount => ({
	code,
	name,
	type,
	subtype,
});

// docs/plan/bookkeeping.md 10.2
export const GENERAL_SERVICES: readonly SeedAccount[] = [
	a("1000", "Checking", "ASSET", "BANK"),
	a("1010", "Savings", "ASSET", "BANK"),
	a("1020", "Cash on Hand", "ASSET", "CASH"),
	a("1500", "Equipment", "ASSET", "FIXED_ASSET"),
	a("1590", "Accumulated Depreciation", "ASSET", "FIXED_ASSET"),
	a("1600", "Prepaid Expenses", "ASSET", "CURRENT_ASSET"),
	a("2100", "Credit Card", "LIABILITY", "CREDIT_CARD"),
	a("2200", "Payroll Liabilities", "LIABILITY", "CURRENT_LIABILITY"),
	a("2400", "Customer Deposits", "LIABILITY", "CURRENT_LIABILITY"),
	a("2500", "Loans Payable", "LIABILITY", "LONG_TERM_LIABILITY"),
	a("3200", "Owner's Draws", "EQUITY", "OWNER_EQUITY"),
	a("3300", "Owner's Contributions", "EQUITY", "OWNER_EQUITY"),
	a("4000", "Service Revenue", "INCOME", "REVENUE"),
	a("4100", "Other Revenue", "INCOME", "REVENUE"),
	a("4900", "Interest Income", "INCOME", "OTHER_INCOME"),
	a("5000", "Direct Labor", "EXPENSE", "COST_OF_SALES"),
	a("5100", "Subcontractors", "EXPENSE", "COST_OF_SALES"),
	a("5200", "Materials and Supplies Used", "EXPENSE", "COST_OF_SALES"),
	a("6000", "Advertising and Marketing", "EXPENSE", "OPERATING_EXPENSE"),
	a("6050", "Bank and Card Fees", "EXPENSE", "OPERATING_EXPENSE"),
	a("6100", "Insurance", "EXPENSE", "OPERATING_EXPENSE"),
	a("6150", "Licenses and Permits", "EXPENSE", "OPERATING_EXPENSE"),
	a("6200", "Meals", "EXPENSE", "OPERATING_EXPENSE"),
	a("6250", "Office Supplies", "EXPENSE", "OPERATING_EXPENSE"),
	a("6300", "Professional Fees", "EXPENSE", "OPERATING_EXPENSE"),
	a("6350", "Rent", "EXPENSE", "OPERATING_EXPENSE"),
	a("6400", "Repairs and Maintenance", "EXPENSE", "OPERATING_EXPENSE"),
	a("6450", "Software and Subscriptions", "EXPENSE", "OPERATING_EXPENSE"),
	a("6500", "Telephone and Internet", "EXPENSE", "OPERATING_EXPENSE"),
	a("6550", "Travel", "EXPENSE", "OPERATING_EXPENSE"),
	a("6600", "Utilities", "EXPENSE", "OPERATING_EXPENSE"),
	a("6650", "Vehicle Expenses", "EXPENSE", "OPERATING_EXPENSE"),
	a("6700", "Wages and Salaries", "EXPENSE", "OPERATING_EXPENSE"),
	a("6750", "Payroll Taxes", "EXPENSE", "OPERATING_EXPENSE"),
	a("6800", "Depreciation", "EXPENSE", "OPERATING_EXPENSE"),
	a("6850", "Interest Expense", "EXPENSE", "OPERATING_EXPENSE"),
	a("6950", "Other Expenses", "EXPENSE", "OTHER_EXPENSE"),
];

// docs/plan/bookkeeping.md section 10 intro
export const NUMBER_SEQUENCES = [
	{ key: "ENTRY", prefix: "JE-", padding: 6 },
	{ key: "INVOICE", prefix: "INV-", padding: 4 },
	{ key: "CREDIT_NOTE", prefix: "CN-", padding: 4 },
	{ key: "VENDOR_CREDIT", prefix: "VC-", padding: 4 },
	{ key: "PAYMENT", prefix: "PMT-", padding: 4 },
] as const;

export interface SeedOptions {
	baseCurrency: string;
	timezone: string;
	fiscalYearStartMonth?: number;
	preset?: "general-services";
}

export interface SeedResult {
	settingsCreated: boolean;
	sequencesCreated: number;
	accountsCreated: number;
}

/** A client that can open a transaction (the shared one), as opposed to a transaction itself. */
function canOpenTransaction(
	client: Prisma.TransactionClient,
): client is PrismaClient {
	return "$transaction" in client;
}

/**
 * Idempotent: create if missing by key or code, never overwrite a name a user edited, never
 * delete. System accounts are found by systemRole, so a renamed or recoded one is not duplicated.
 *
 * All or nothing: given the shared client (which is what the seed runner passes), the whole seed
 * runs in ONE transaction, so a crash half way leaves no partial chart. Given a transaction (a
 * test that rolls back), it joins that one.
 */
export async function seedLedger(
	client: Prisma.TransactionClient,
	options: SeedOptions,
): Promise<SeedResult> {
	if (!canOpenTransaction(client)) return seedLedgerIn(client, options);
	return client.$transaction((tx) => seedLedgerIn(tx, options), {
		maxWait: 10_000,
		timeout: 60_000,
	});
}

async function seedLedgerIn(
	tx: Prisma.TransactionClient,
	options: SeedOptions,
): Promise<SeedResult> {
	const existingSettings = await tx.ledgerSettings.findUnique({
		where: { id: "ledger" },
	});
	let settingsCreated = false;
	if (!existingSettings) {
		await tx.ledgerSettings.create({
			data: {
				id: "ledger",
				baseCurrency: options.baseCurrency,
				timezone: options.timezone,
				fiscalYearStartMonth: options.fiscalYearStartMonth ?? 1,
			},
		});
		settingsCreated = true;
	}

	const sequences = await tx.numberSequence.createMany({
		data: NUMBER_SEQUENCES.map((s) => ({ ...s })),
		skipDuplicates: true,
	});

	let accountsCreated = 0;
	const preset = options.preset ?? "general-services";
	const chart =
		preset === "general-services" ? GENERAL_SERVICES : GENERAL_SERVICES;
	const wanted: Array<SeedAccount & { isSystem: boolean }> = [
		...SYSTEM_ACCOUNTS.map((x) => ({ ...x, isSystem: true })),
		...chart.map((x) => ({ ...x, isSystem: false })),
	];
	for (const [index, account] of wanted.entries()) {
		const byCode = await tx.ledgerAccount.findUnique({
			where: { code: account.code },
		});
		if (byCode) continue;
		if (account.systemRole) {
			const byRole = await tx.ledgerAccount.findUnique({
				where: { systemRole: account.systemRole },
			});
			if (byRole) continue;
		}
		await tx.ledgerAccount.create({
			data: {
				code: account.code,
				name: account.name,
				type: account.type,
				subtype: account.subtype,
				systemRole: account.systemRole ?? null,
				isSystem: account.isSystem || account.systemRole !== undefined,
				sortOrder: index,
			},
		});
		accountsCreated++;
	}
	return {
		settingsCreated,
		sequencesCreated: sequences.count,
		accountsCreated,
	};
}
