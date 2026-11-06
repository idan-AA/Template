"use client";

import { Button } from "@app/ui/components/button";
import { Field, FieldLabel } from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@app/ui/components/simple-table";
import { StatusIndicator } from "@app/ui/components/status-indicator";
import { TableCell } from "@app/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { LocalRelativeTime } from "@/components/local-date-time";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { QueryError } from "../../_components/query-error";
import {
	downloadCsv,
	formatDate,
	formatDecimal,
	formatMoney,
} from "../../books-format";

const COLUMNS: SimpleTableColumn[] = [
	{ id: "code", header: "Code", width: "w-24" },
	{ id: "name", header: "Account" },
	{ id: "debit", header: "Debit", width: "w-36", align: "right" },
	{ id: "credit", header: "Credit", width: "w-36", align: "right" },
];

const CELL = "px-3 py-2.5 align-middle";

export function TrialBalanceReport({ asOf }: { asOf: string | null }) {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const asOfId = useId();
	const [draft, setDraft] = useState(asOf ?? "");

	const report = useQuery(
		trpc.bookkeepingReports.trialBalance.queryOptions({
			asOf: asOf ?? undefined,
		}),
	);

	if (report.error) return <QueryError error={report.error} />;
	if (!report.data) return null;

	const data = report.data;
	const currency = data.baseCurrency;
	const path = workspaceUrl("/books/reports/trial-balance");

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<form
					className="flex flex-wrap items-end gap-3"
					onSubmit={(event) => {
						event.preventDefault();
						router.push(draft ? `${path}?asOf=${draft}` : path);
					}}
				>
					<Field className="w-44">
						<FieldLabel htmlFor={asOfId}>As of</FieldLabel>
						<Input
							id={asOfId}
							type="date"
							value={draft || data.asOf}
							onChange={(event) => setDraft(event.target.value)}
						/>
					</Field>
					<Button type="submit" variant="outline">
						Apply
					</Button>
				</form>
				<Button
					variant="outline"
					onClick={() =>
						downloadCsv(`trial-balance-${data.asOf}.csv`, [
							["Code", "Account", "Debit", "Credit"],
							...data.rows.map((row) => [
								row.code,
								row.name,
								formatDecimal(row.debitBase, currency),
								formatDecimal(row.creditBase, currency),
							]),
							[
								"",
								"Total",
								formatDecimal(data.totalDebitBase, currency),
								formatDecimal(data.totalCreditBase, currency),
							],
						])
					}
				>
					Export CSV
				</Button>
			</div>

			<dl className="grid gap-x-8 gap-y-1 text-muted-foreground text-xs sm:grid-cols-2">
				<div>
					Basis: accrual, posted entries only. Amounts in {currency}.
				</div>
				<div>
					As of {formatDate(data.asOf)} (time zone {data.timezone}). Generated{" "}
					<LocalRelativeTime date={data.generatedAt} />.
				</div>
				<div>
					{data.lockDate
						? `Books locked through ${formatDate(data.lockDate)}.`
						: "No lock date is set."}
				</div>
				<div>
					{data.draftEntries === 0
						? "No unposted entries."
						: `${data.draftEntries} unposted ${data.draftEntries === 1 ? "entry is" : "entries are"} not included.`}
				</div>
			</dl>

			<SimpleTable columns={COLUMNS}>
				{data.rows.map((row) => (
					<SimpleTableRow key={row.accountId}>
						<TableCell className={`${CELL} tabular-nums`}>{row.code}</TableCell>
						<TableCell className={CELL}>
							<Link
								className="underline-offset-4 hover:underline"
								href={`${workspaceUrl(`/books/accounting/accounts/${row.accountId}`)}?to=${data.asOf}`}
								target="_blank"
								rel="noreferrer"
							>
								{row.name}
							</Link>
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{row.debitBase === "0" ? "" : formatMoney(row.debitBase, currency)}
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{row.creditBase === "0"
								? ""
								: formatMoney(row.creditBase, currency)}
						</TableCell>
					</SimpleTableRow>
				))}
				<SimpleTableRow>
					<TableCell className={`${CELL} font-medium`} colSpan={2}>
						Total
					</TableCell>
					<TableCell className={`${CELL} text-right font-medium tabular-nums`}>
						{formatMoney(data.totalDebitBase, currency)}
					</TableCell>
					<TableCell className={`${CELL} text-right font-medium tabular-nums`}>
						{formatMoney(data.totalCreditBase, currency)}
					</TableCell>
				</SimpleTableRow>
			</SimpleTable>

			<div className="flex items-center gap-2 text-sm">
				{data.balanced ? (
					<StatusIndicator
						tone="success"
						label="Proof: total debits equal total credits"
					/>
				) : (
					<StatusIndicator
						tone="error"
						label="Proof FAILED: debits and credits differ. Tell your developer."
					/>
				)}
			</div>
		</div>
	);
}
