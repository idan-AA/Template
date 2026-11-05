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

export function trialBalanceTotals(rows: readonly TrialBalanceRow[]): {
	debit: bigint;
	credit: bigint;
} {
	let debit = 0n;
	let credit = 0n;
	for (const r of rows) {
		debit += r.debitBase;
		credit += r.creditBase;
	}
	return { debit, credit };
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
