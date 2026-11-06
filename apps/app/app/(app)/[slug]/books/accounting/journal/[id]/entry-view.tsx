"use client";

import { Badge } from "@app/ui/components/badge";
import { Button } from "@app/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/ui/components/card";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@app/ui/components/simple-table";
import { TableCell } from "@app/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { LocalRelativeTime } from "@/components/local-date-time";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { QueryError } from "../../../_components/query-error";
import { useBooksAccess } from "../../../_components/use-books-access";
import { formatDate, formatMoney, sourceLabel } from "../../../books-format";
import { ReverseDialog } from "./reverse-dialog";

const COLUMNS: SimpleTableColumn[] = [
	{ id: "account", header: "Account" },
	{ id: "debit", header: "Debit", width: "w-36", align: "right" },
	{ id: "credit", header: "Credit", width: "w-36", align: "right" },
];

const CELL = "px-3 py-2.5 align-middle";

export function EntryView({ id }: { id: string }) {
	const trpc = useTRPC();
	const workspaceUrl = useWorkspaceUrl();
	const { can } = useBooksAccess();
	const entry = useQuery(trpc.bookkeepingJournal.byId.queryOptions({ id }));

	if (entry.error) return <QueryError error={entry.error} />;
	if (!entry.data) return null;

	const data = entry.data;
	const currency = data.baseCurrency;
	const balanced = data.totalDebitBase === data.totalCreditBase;

	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-1">
					<h1 className="text-balance font-medium text-2xl tracking-tight md:text-3xl">
						{data.number}
					</h1>
					<p className="text-muted-foreground text-sm">
						{sourceLabel(data.source)} dated {formatDate(data.date)}. Amounts
						in {currency}.
					</p>
					<div className="flex flex-wrap gap-2">
						{data.reversedBy ? (
							<Badge variant="secondary">
								Reversed by{" "}
								<Link
									className="underline-offset-2 hover:underline"
									href={workspaceUrl(
										`/books/accounting/journal/${data.reversedBy.id}`,
									)}
								>
									{data.reversedBy.number}
								</Link>
							</Badge>
						) : null}
						{data.reverses ? (
							<Badge variant="secondary">
								Reverses{" "}
								<Link
									className="underline-offset-2 hover:underline"
									href={workspaceUrl(
										`/books/accounting/journal/${data.reverses.id}`,
									)}
								>
									{data.reverses.number}
								</Link>
							</Badge>
						) : null}
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" asChild>
						<Link href={workspaceUrl("/books/accounting/journal")}>
							All entries
						</Link>
					</Button>
					{data.canReverse && can("bookkeeping.post") ? (
						<ReverseDialog id={data.id} number={data.number} />
					) : null}
				</div>
			</header>

			{data.memo ? <p className="text-sm">{data.memo}</p> : null}

			<SimpleTable columns={COLUMNS}>
				{data.lines.map((line) => (
					<SimpleTableRow key={line.lineNo}>
						<TableCell className={CELL}>
							<Link
								className="font-medium underline-offset-4 hover:underline"
								href={workspaceUrl(
									`/books/accounting/accounts/${line.accountId}`,
								)}
							>
								{line.accountCode} {line.accountName}
							</Link>
							{line.memo ? (
								<div className="text-muted-foreground text-xs">{line.memo}</div>
							) : null}
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{line.debitBase === "0" ? "" : formatMoney(line.debitBase, currency)}
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{line.creditBase === "0"
								? ""
								: formatMoney(line.creditBase, currency)}
						</TableCell>
					</SimpleTableRow>
				))}
				<SimpleTableRow>
					<TableCell className={`${CELL} font-medium`}>
						Totals {balanced ? "(balanced)" : "(OUT OF BALANCE)"}
					</TableCell>
					<TableCell className={`${CELL} text-right font-medium tabular-nums`}>
						{formatMoney(data.totalDebitBase, currency)}
					</TableCell>
					<TableCell className={`${CELL} text-right font-medium tabular-nums`}>
						{formatMoney(data.totalCreditBase, currency)}
					</TableCell>
				</SimpleTableRow>
			</SimpleTable>

			<Card>
				<CardHeader>
					<CardTitle>History</CardTitle>
					<CardDescription>
						Who did what to this entry, and why. Nothing here can be edited.
					</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<ul className="flex flex-col divide-y text-sm">
						<li className="flex flex-col gap-0.5 px-6 py-3">
							<span>
								{data.reverses
									? `Posted as the reversal of ${data.reverses.number}`
									: "Posted"}
								{data.postedBy ? ` by ${data.postedBy}` : ""}.
							</span>
							{data.postedAt ? (
								<span className="text-muted-foreground text-xs">
									<LocalRelativeTime date={data.postedAt} />
								</span>
							) : null}
						</li>
						{data.history
							.filter((event) => event.action === "LOCK_OVERRIDE")
							.map((event) => (
								<li key={event.id} className="flex flex-col gap-0.5 px-6 py-3">
									<span>
										Posted inside a locked period
										{event.actorLabel ? ` by ${event.actorLabel}` : ""}.
									</span>
									<span className="text-muted-foreground text-xs">
										<LocalRelativeTime date={event.at} />
										{event.reason ? `, reason: ${event.reason}` : ""}
									</span>
								</li>
							))}
						{data.reversedBy ? (
							<li className="flex flex-col gap-0.5 px-6 py-3">
								<span>
									Reversed by{" "}
									<Link
										className="underline-offset-4 hover:underline"
										href={workspaceUrl(
											`/books/accounting/journal/${data.reversedBy.id}`,
										)}
									>
										{data.reversedBy.number}
									</Link>
									{data.reversedBy.postedBy
										? ` (${data.reversedBy.postedBy})`
										: ""}
									{data.reversedBy.reason ? `: ${data.reversedBy.reason}` : "."}
								</span>
								{data.reversedBy.postedAt ? (
									<span className="text-muted-foreground text-xs">
										<LocalRelativeTime date={data.reversedBy.postedAt} />
									</span>
								) : null}
							</li>
						) : null}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
