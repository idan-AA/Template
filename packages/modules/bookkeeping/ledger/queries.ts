import type { Prisma } from "@app/db";

type Db = Pick<Prisma.TransactionClient, "$queryRaw">;

export interface TrialBalanceRow {
	accountId: string;
	code: string;
	name: string;
	debitBase: bigint;
	creditBase: bigint;
}

/** Trial balance in base currency. Reads POSTED JournalLine only (B1). */
export async function trialBalance(
	db: Db,
	asOf?: string,
): Promise<TrialBalanceRow[]> {
	const cutoff = asOf ?? null;
	return db.$queryRaw<TrialBalanceRow[]>`
		SELECT a."id" AS "accountId", a."code", a."name",
		       coalesce(sum(l."baseDebitMinor"), 0)::bigint AS "debitBase",
		       coalesce(sum(l."baseCreditMinor"), 0)::bigint AS "creditBase"
		FROM "ledgerAccount" a
		JOIN "journalLine" l ON l."accountId" = a."id"
		JOIN "journalEntry" e ON e."id" = l."entryId"
		WHERE e."status" = 'POSTED' AND (${cutoff}::date IS NULL OR e."date" <= ${cutoff}::date)
		GROUP BY a."id", a."code", a."name"
		ORDER BY a."code"
	`;
}

export type TrialBalanceTotals = { debit: bigint; credit: bigint };

export function trialBalanceTotals(
	rows: readonly TrialBalanceRow[],
): TrialBalanceTotals {
	let debit = 0n;
	let credit = 0n;
	for (const r of rows) {
		debit += r.debitBase;
		credit += r.creditBase;
	}
	return { debit, credit };
}

export interface RosterRow {
	accountId: string;
	code: string;
	name: string;
	type: string;
	subtype: string;
	systemRole: string | null;
	archived: boolean;
	debitBase: bigint;
	creditBase: bigint;
}

/**
 * Trial balance over the WHOLE chart of accounts: every account appears, including those with
 * no postings (zeros), as the reports rule requires. `trialBalance` above keeps its old shape (only
 * accounts with activity) because the ledger specs compare against it; screens use this one.
 * Reads POSTED lines only (B1), by entry date, in base currency.
 */
export async function trialBalanceRoster(
	db: Db,
	asOf?: string,
): Promise<RosterRow[]> {
	const cutoff = asOf ?? null;
	return db.$queryRaw<RosterRow[]>`
		SELECT a."id" AS "accountId", a."code", a."name",
		       a."type"::text AS "type", a."subtype"::text AS "subtype",
		       a."systemRole"::text AS "systemRole",
		       (a."archivedAt" IS NOT NULL) AS "archived",
		       coalesce(t."debit", 0)::bigint AS "debitBase",
		       coalesce(t."credit", 0)::bigint AS "creditBase"
		FROM "ledgerAccount" a
		LEFT JOIN (
			SELECT l."accountId", sum(l."baseDebitMinor") AS "debit", sum(l."baseCreditMinor") AS "credit"
			FROM "journalLine" l
			JOIN "journalEntry" e ON e."id" = l."entryId"
			WHERE e."status" = 'POSTED' AND (${cutoff}::date IS NULL OR e."date" <= ${cutoff}::date)
			GROUP BY l."accountId"
		) t ON t."accountId" = a."id"
		ORDER BY a."code"
	`;
}

/** Net debit minus credit (base) of one account for posted entries dated BEFORE `before`. */
export async function accountBalanceBefore(
	db: Db,
	accountId: string,
	before: string,
): Promise<bigint> {
	const rows = await db.$queryRaw<Array<{ balance: bigint }>>`
		SELECT coalesce(sum(l."baseDebitMinor" - l."baseCreditMinor"), 0)::bigint AS "balance"
		FROM "journalLine" l
		JOIN "journalEntry" e ON e."id" = l."entryId"
		WHERE l."accountId" = ${accountId} AND e."status" = 'POSTED' AND e."date" < ${before}::date
	`;
	return rows[0]?.balance ?? 0n;
}

export interface AccountLedgerRow {
	entryId: string;
	number: string;
	date: Date;
	source: string;
	memo: string | null;
	lineMemo: string | null;
	lineNo: number;
	debitBase: bigint;
	creditBase: bigint;
}

/**
 * Posted lines of one account in a date range, oldest first. The running balance is NOT computed
 * here: the caller starts from `accountBalanceBefore(from)` and adds line by line in bigint, so a
 * range that starts mid-history is still right.
 */
export async function accountLedger(
	db: Db,
	accountId: string,
	range: { from?: string; to?: string } = {},
): Promise<AccountLedgerRow[]> {
	const from = range.from ?? null;
	const to = range.to ?? null;
	return db.$queryRaw<AccountLedgerRow[]>`
		SELECT e."id" AS "entryId", e."number", e."date", e."source"::text AS "source",
		       e."memo", l."memo" AS "lineMemo", l."lineNo",
		       l."baseDebitMinor" AS "debitBase", l."baseCreditMinor" AS "creditBase"
		FROM "journalLine" l
		JOIN "journalEntry" e ON e."id" = l."entryId"
		WHERE l."accountId" = ${accountId} AND e."status" = 'POSTED'
		  AND (${from}::date IS NULL OR e."date" >= ${from}::date)
		  AND (${to}::date IS NULL OR e."date" <= ${to}::date)
		ORDER BY e."date", e."number", l."lineNo"
	`;
}

export interface GeneralLedgerRow {
	entryId: string;
	number: string;
	date: Date;
	memo: string | null;
	lineNo: number;
	debitBase: bigint;
	creditBase: bigint;
	runningBase: bigint;
}

/** General ledger for one account: posted lines in date order with a running balance. */
export async function generalLedger(
	db: Db,
	accountId: string,
	range: { from?: string; to?: string } = {},
): Promise<GeneralLedgerRow[]> {
	const from = range.from ?? null;
	const to = range.to ?? null;
	return db.$queryRaw<GeneralLedgerRow[]>`
		SELECT * FROM (
			SELECT e."id" AS "entryId", e."number", e."date", e."memo", l."lineNo",
			       l."baseDebitMinor" AS "debitBase", l."baseCreditMinor" AS "creditBase",
			       sum(l."baseDebitMinor" - l."baseCreditMinor")
			         OVER (ORDER BY e."date", e."number", l."lineNo")::bigint AS "runningBase"
			FROM "journalLine" l
			JOIN "journalEntry" e ON e."id" = l."entryId"
			WHERE l."accountId" = ${accountId} AND e."status" = 'POSTED'
		) t
		WHERE (${from}::date IS NULL OR t."date" >= ${from}::date)
		  AND (${to}::date IS NULL OR t."date" <= ${to}::date)
		ORDER BY t."date", t."number", t."lineNo"
	`;
}
