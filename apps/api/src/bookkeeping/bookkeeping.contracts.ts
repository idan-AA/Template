import { z } from "zod";

/**
 * Money crosses the wire as a decimal STRING of minor units ("12550" is 125.50 in a two decimal
 * currency). The tRPC client has no transformer, so a bigint would throw when serialised
 * (docs/plan/bookkeeping.md B5). Dates are date-only strings in the business time zone.
 */
export const minorString = z.string().regex(/^-?\d+$/);

export const dateOnly = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-06.");

export const accountType = z.enum([
	"ASSET",
	"LIABILITY",
	"EQUITY",
	"INCOME",
	"EXPENSE",
]);

export const accountSubtype = z.enum([
	"BANK",
	"CASH",
	"CREDIT_CARD",
	"ACCOUNTS_RECEIVABLE",
	"CURRENT_ASSET",
	"FIXED_ASSET",
	"OTHER_ASSET",
	"ACCOUNTS_PAYABLE",
	"CURRENT_LIABILITY",
	"TAX_LIABILITY",
	"LONG_TERM_LIABILITY",
	"OWNER_EQUITY",
	"RETAINED_EARNINGS",
	"REVENUE",
	"OTHER_INCOME",
	"COST_OF_SALES",
	"OPERATING_EXPENSE",
	"OTHER_EXPENSE",
]);

export const entrySource = z.enum([
	"MANUAL",
	"ADJUSTMENT",
	"OPENING_BALANCE",
	"INVOICE",
	"BILL",
	"CREDIT_NOTE",
	"VENDOR_CREDIT",
	"PAYMENT",
	"ALLOCATION",
	"BANK_SPEND",
	"BANK_RECEIVE",
	"TRANSFER",
	"REVERSAL",
]);

export const entrySide = z.enum(["DEBIT", "CREDIT"]);

// ---------------------------------------------------------------------------
// Access and home
// ---------------------------------------------------------------------------

export const accessOutput = z.object({
	role: z.string().nullable(),
	/** The permission keys (bookkeeping.read, ...) this person holds. The UI only hides with this. */
	granted: z.array(z.string()),
});

export const summaryOutput = z.object({
	baseCurrency: z.string(),
	timezone: z.string(),
	today: dateOnly,
	setupComplete: z.boolean(),
	lockDate: dateOnly.nullable(),
	/** Null when the person may not see the ledger (needs bookkeeping.reports). */
	suspenseBalance: minorString.nullable(),
	openingBalanceEquity: minorString.nullable(),
	entriesThisMonth: z.number(),
	draftEntries: z.number(),
	canSeeLedger: z.boolean(),
});

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export const accountListInput = z.object({
	includeArchived: z.boolean().default(false),
	type: accountType.optional(),
	q: z.string().trim().max(120).default(""),
});

export const accountRowOutput = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	type: accountType,
	subtype: accountSubtype,
	systemRole: z.string().nullable(),
	description: z.string().nullable(),
	isSystem: z.boolean(),
	archived: z.boolean(),
	/** Base currency, on the account's normal side (assets and expenses debit, the rest credit). Negative means the opposite side. */
	balanceBase: minorString,
});

export const accountListOutput = z.object({
	baseCurrency: z.string(),
	accounts: z.array(accountRowOutput),
});

export const accountIdOutput = z.object({ id: z.string() });

export const accountCreateInput = z.object({
	code: z.string().trim().min(1, "An account needs a code.").max(16),
	name: z.string().trim().min(1, "An account needs a name.").max(120),
	type: accountType,
	subtype: accountSubtype,
	description: z.string().trim().max(500).optional(),
});

const accountUpdateData = z.object({
	name: z.string().trim().min(1).max(120).optional(),
	description: z.string().trim().max(500).nullable().optional(),
	archived: z.boolean().optional(),
});

export const accountUpdateArgs = z.object({
	id: z.string(),
	data: accountUpdateData,
});

export const accountLedgerInput = z.object({
	id: z.string(),
	from: dateOnly.optional(),
	to: dateOnly.optional(),
});

export const accountLedgerOutput = z.object({
	baseCurrency: z.string(),
	account: z.object({
		id: z.string(),
		code: z.string(),
		name: z.string(),
		type: accountType,
		subtype: accountSubtype,
		archived: z.boolean(),
	}),
	/** Which side is positive for this account: DEBIT for assets and expenses, CREDIT for the rest. */
	normalSide: entrySide,
	from: dateOnly.nullable(),
	to: dateOnly.nullable(),
	/** All balances below are net DEBIT minus CREDIT in base currency, signed. */
	openingBase: minorString,
	rows: z.array(
		z.object({
			entryId: z.string(),
			number: z.string(),
			date: dateOnly,
			source: entrySource,
			memo: z.string().nullable(),
			lineMemo: z.string().nullable(),
			debitBase: minorString,
			creditBase: minorString,
			runningBase: minorString,
		}),
	),
	totalDebitBase: minorString,
	totalCreditBase: minorString,
	closingBase: minorString,
});

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

export const journalListInput = z.object({
	from: dateOnly.optional(),
	to: dateOnly.optional(),
	source: entrySource.optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(25),
});

export const journalListOutput = z.object({
	baseCurrency: z.string(),
	total: z.number(),
	page: z.number(),
	pageSize: z.number(),
	rows: z.array(
		z.object({
			id: z.string(),
			number: z.string(),
			date: dateOnly,
			source: entrySource,
			memo: z.string().nullable(),
			totalBase: minorString,
			postedAt: z.string().nullable(),
			postedBy: z.string().nullable(),
			reversed: z.boolean(),
			reversesNumber: z.string().nullable(),
		}),
	),
});

export const journalIdInput = z.object({ id: z.string() });

export const journalEntryOutput = z.object({
	id: z.string(),
	number: z.string(),
	date: dateOnly,
	source: entrySource,
	memo: z.string().nullable(),
	baseCurrency: z.string(),
	postedAt: z.string().nullable(),
	postedBy: z.string().nullable(),
	canReverse: z.boolean(),
	reverses: z.object({ id: z.string(), number: z.string() }).nullable(),
	reversedBy: z.object({ id: z.string(), number: z.string() }).nullable(),
	lines: z.array(
		z.object({
			lineNo: z.number(),
			accountId: z.string(),
			accountCode: z.string(),
			accountName: z.string(),
			kind: z.string(),
			currency: z.string(),
			debit: minorString,
			credit: minorString,
			debitBase: minorString,
			creditBase: minorString,
			fxRate: z.string(),
			memo: z.string().nullable(),
		}),
	),
	totalDebitBase: minorString,
	totalCreditBase: minorString,
	history: z.array(
		z.object({
			id: z.string(),
			at: z.string(),
			action: z.string(),
			summary: z.string(),
			actorLabel: z.string().nullable(),
			reason: z.string().nullable(),
		}),
	),
});

export const journalPostInput = z.object({
	/** One per form, generated by the browser: a double click posts once (it becomes the idempotency key). */
	requestKey: z.string().trim().min(8).max(64),
	date: dateOnly,
	memo: z.string().trim().max(500).optional(),
	kind: z.enum(["MANUAL", "ADJUSTMENT"]),
	lines: z
		.array(
			z.object({
				accountId: z.string(),
				side: entrySide,
				/** A decimal in the base currency, for example "125.50". */
				amount: z.string().trim().min(1, "Every line needs an amount."),
				memo: z.string().trim().max(500).optional(),
			}),
		)
		.min(2, "A journal needs at least two lines.")
		.max(200),
	/** Needed to post on or before the lock date, and only for people holding bookkeeping.lock. */
	lockOverrideReason: z.string().trim().max(500).optional(),
});

export const journalReverseInput = z.object({
	id: z.string(),
	date: dateOnly,
	reason: z.string().trim().min(1, "A reversal needs a reason.").max(500),
	lockOverrideReason: z.string().trim().max(500).optional(),
});

export const journalPostOutput = z.object({
	entryId: z.string(),
	number: z.string(),
	created: z.boolean(),
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const sequenceOutput = z.object({
	key: z.string(),
	prefix: z.string(),
	padding: z.number(),
	nextValue: z.number(),
	example: z.string(),
});

export const settingsOutput = z.object({
	baseCurrency: z.string(),
	timezone: z.string(),
	today: dateOnly,
	fiscalYearStartMonth: z.number(),
	lockDate: dateOnly.nullable(),
	hardLockDate: dateOnly.nullable(),
	firstPostedAt: z.string().nullable(),
	attentionStaleDays: z.number(),
	setupCompletedAt: z.string().nullable(),
	sequences: z.array(sequenceOutput),
	can: z.object({
		settings: z.boolean(),
		lock: z.boolean(),
		reopen: z.boolean(),
	}),
});

export const settingsUpdateInput = z.object({
	fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
	attentionStaleDays: z.number().int().min(0).max(365).optional(),
	lockDate: dateOnly.nullable().optional(),
	hardLockDate: dateOnly.nullable().optional(),
});

export const sequenceUpdateInput = z.object({
	key: z.string().min(1),
	prefix: z.string().trim().max(12).optional(),
	padding: z.number().int().min(1).max(12).optional(),
	nextValue: z.number().int().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const trialBalanceInput = z.object({
	asOf: dateOnly.optional(),
});

export const trialBalanceOutput = z.object({
	baseCurrency: z.string(),
	timezone: z.string(),
	asOf: dateOnly,
	generatedAt: z.string(),
	lockDate: dateOnly.nullable(),
	/** Entries saved but not posted: they are not in these numbers. */
	draftEntries: z.number(),
	rows: z.array(
		z.object({
			accountId: z.string(),
			code: z.string(),
			name: z.string(),
			type: accountType,
			archived: z.boolean(),
			debitBase: minorString,
			creditBase: minorString,
		}),
	),
	totalDebitBase: minorString,
	totalCreditBase: minorString,
	/** The proof: total debits equal total credits to the minor unit. */
	balanced: z.boolean(),
});
