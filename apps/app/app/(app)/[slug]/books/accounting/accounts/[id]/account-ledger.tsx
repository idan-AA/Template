"use client";

import { Badge } from "@app/ui/components/badge";
import { Button } from "@app/ui/components/button";
import { CardTableEmpty } from "@app/ui/components/card-table";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@app/ui/components/simple-table";
import { TableCell } from "@app/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DateRangeForm } from "../../../_components/date-range-form";
import { QueryError } from "../../../_components/query-error";
import {
	downloadCsv,
	formatDate,
	formatDecimal,
	formatMoney,
	sourceLabel,
	subtypeLabel,
} from "../../../books-format";
import { EditAccountSheet } from "./edit-account-sheet";

const COLUMNS: SimpleTableColumn[] = [
	{ id: "date", header: "Date", width: "w-28" },
	{ id: "entry", header: "Entry", width: "w-28" },
	{ id: "what", header: "What" },
	{ id: "debit", header: "Debit", width: "w-32", align: "right" },
	{ id: "credit", header: "Credit", width: "w-32", align: "right" },
	{ id: "balance", header: "Balance", width: "w-36", align: "right" },
];

const CELL = "px-3 py-2.5 align-middle";

/**
 * One account's ledger: every posted line, oldest first, with the balance after each. The opening
 * balance is everything before the range, so a range that starts mid-history still adds up. Also
 * the target every report figure links to (docs/plan/bookkeeping.md B-5).
 */
export function AccountLedger({
	id,
	from,
	to,
	hideHeader = false,
}: {
	id: string;
	from: string | null;
	to: string | null;
	hideHeader?: boolean;
}) {
	const trpc = useTRPC();
	const workspaceUrl = useWorkspaceUrl();
	const ledger = useQuery(
		trpc.bookkeepingAccounts.ledger.queryOptions({
			id,
			from: from ?? undefined,
			to: to ?? undefined,
		}),
	);

	if (ledger.error) return <QueryError error={ledger.error} />;
	if (!ledger.data) return null;

	const data = ledger.data;
	const currency = data.baseCurrency;
	// Balances arrive as net debit minus credit. A credit account reads positive on its credit side.
	const sign = data.normalSide === "DEBIT" ? BigInt(1) : -BigInt(1);
	const natural = (minor: string) => (BigInt(minor) * sign).toString();
	const path = workspaceUrl(`/books/accounting/accounts/${id}`);

	return (
		<div className="flex flex-col gap-6">
			{hideHeader ? null : (
				<header className="flex flex-wrap items-start justify-between gap-3">
					<div className="flex min-w-0 flex-col gap-1">
						<h1 className="text-balance font-medium text-2xl tracking-tight md:text-3xl">
							{data.account.code} {data.account.name}
						</h1>
						<p className="text-muted-foreground text-sm">
							{subtypeLabel(data.account.subtype)}. Amounts in {currency}.{" "}
							{data.account.archived ? (
								<Badge variant="secondary">Archived</Badge>
							) : null}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" asChild>
							<Link href={workspaceUrl("/books/accounting/accounts")}>
								All accounts
							</Link>
						</Button>
						<EditAccountSheet
							id={data.account.id}
							code={data.account.code}
							name={data.account.name}
							archived={data.account.archived}
						/>
					</div>
				</header>
			)}

			<div className="flex flex-wrap items-end justify-between gap-3">
				<DateRangeForm
					path={hideHeader ? workspaceUrl("/books/reports/general-ledger") : path}
					from={data.from}
					to={data.to}
					extra={hideHeader ? { account: id } : {}}
				/>
				<Button
					variant="outline"
					onClick={() =>
						downloadCsv(`ledger-${data.account.code}.csv`, [
							["Date", "Entry", "Source", "Memo", "Debit", "Credit", "Balance"],
							[
								data.from ?? "",
								"",
								"",
								"Opening balance",
								"",
								"",
								formatDecimal(natural(data.openingBase), currency),
							],
							...data.rows.map((row) => [
								row.date,
								row.number,
								sourceLabel(row.source),
								row.lineMemo ?? row.memo ?? "",
								formatDecimal(row.debitBase, currency),
								formatDecimal(row.creditBase, currency),
								formatDecimal(natural(row.runningBase), currency),
							]),
						])
					}
				>
					Export CSV
				</Button>
			</div>

			<SimpleTable columns={COLUMNS}>
				<SimpleTableRow>
					<TableCell className={`${CELL} text-muted-foreground`} colSpan={5}>
						Opening balance
						{data.from ? ` before ${formatDate(data.from)}` : ""}
					</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{formatMoney(natural(data.openingBase), currency)}
					</TableCell>
				</SimpleTableRow>

				{data.rows.map((row, index) => (
					<SimpleTableRow key={`${row.entryId}-${index}`}>
						<TableCell className={CELL}>{formatDate(row.date)}</TableCell>
						<TableCell className={CELL}>
							<Link
								className="underline-offset-4 hover:underline"
								href={workspaceUrl(`/books/accounting/journal/${row.entryId}`)}
							>
								{row.number}
							</Link>
						</TableCell>
						<TableCell className={CELL}>
							<div>{row.lineMemo ?? row.memo ?? sourceLabel(row.source)}</div>
							<div className="text-muted-foreground text-xs">
								{sourceLabel(row.source)}
							</div>
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{row.debitBase === "0" ? "" : formatMoney(row.debitBase, currency)}
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{row.creditBase === "0"
								? ""
								: formatMoney(row.creditBase, currency)}
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{formatMoney(natural(row.runningBase), currency)}
						</TableCell>
					</SimpleTableRow>
				))}

				<SimpleTableRow>
					<TableCell className={`${CELL} font-medium`} colSpan={3}>
						Totals and closing balance
					</TableCell>
					<TableCell className={`${CELL} text-right font-medium tabular-nums`}>
						{formatMoney(data.totalDebitBase, currency)}
					</TableCell>
					<TableCell className={`${CELL} text-right font-medium tabular-nums`}>
						{formatMoney(data.totalCreditBase, currency)}
					</TableCell>
					<TableCell className={`${CELL} text-right font-medium tabular-nums`}>
						{formatMoney(natural(data.closingBase), currency)}
					</TableCell>
				</SimpleTableRow>
			</SimpleTable>

			{data.rows.length === 0 ? (
				<div className="rounded-lg border bg-card">
					<CardTableEmpty>
						No postings in this range. Change the dates to look further back.
					</CardTableEmpty>
				</div>
			) : null}
		</div>
	);
}
