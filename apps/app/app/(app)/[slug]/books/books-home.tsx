"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { formatDate, formatMoney } from "./books-format";
import { QueryError } from "./_components/query-error";
import { useBooksAccess } from "./_components/use-books-access";

function Figure({
	title,
	description,
	value,
	tone,
}: {
	title: string;
	description: string;
	value: string;
	tone?: "warning";
}) {
	return (
		<Card>
			<CardHeader>
				{/* Not CardDescription: that one is hidden below the sm breakpoint, and a phone needs the label. */}
				<div className="text-muted-foreground text-xs/relaxed">{title}</div>
				<CardTitle
					className={`text-2xl tabular-nums ${tone === "warning" ? "text-warning" : ""}`}
				>
					{value}
				</CardTitle>
			</CardHeader>
			<CardContent className="text-muted-foreground text-xs">
				{description}
			</CardContent>
		</Card>
	);
}

export function BooksHome() {
	const trpc = useTRPC();
	const workspaceUrl = useWorkspaceUrl();
	const { can } = useBooksAccess();
	const home = useQuery(trpc.bookkeeping.home.queryOptions());

	if (home.error) return <QueryError error={home.error} />;
	if (!home.data) return null;

	const { baseCurrency, canSeeLedger } = home.data;
	const money = (minor: string | null) =>
		minor === null ? "Not available" : formatMoney(minor, baseCurrency);

	const suspense = home.data.suspenseBalance;
	const opening = home.data.openingBalanceEquity;

	return (
		<div className="flex flex-col gap-6">
			{canSeeLedger ? null : (
				<p className="text-muted-foreground text-sm">
					Your role can see documents but not the ledger. Ask an owner or admin
					for the Bookkeeper role to see accounts and reports.
				</p>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Figure
					title={`Uncategorized (${baseCurrency})`}
					description={
						suspense !== null && suspense !== "0"
							? "Money parked until someone decides what it was. Clear it to zero."
							: "Nothing is waiting to be sorted."
					}
					value={money(suspense)}
					tone={suspense !== null && suspense !== "0" ? "warning" : undefined}
				/>
				<Figure
					title={`Opening balance equity (${baseCurrency})`}
					description={
						opening !== null && opening !== "0"
							? "Left over from opening balances. It should reach zero once setup is done."
							: "Settled."
					}
					value={money(opening)}
					tone={opening !== null && opening !== "0" ? "warning" : undefined}
				/>
				<Figure
					title="Entries this month"
					description="Posted to the ledger since the 1st."
					value={String(home.data.entriesThisMonth)}
				/>
				<Figure
					title="Books locked through"
					description={
						home.data.lockDate
							? "Nothing can be posted on or before this date without a reason."
							: "No lock date is set."
					}
					value={home.data.lockDate ? formatDate(home.data.lockDate) : "Open"}
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Where to go</CardTitle>
					<CardDescription>
						Invoices, bills and bank feeds arrive in later releases. Today the
						books hold the chart of accounts, the journal and the trial
						balance.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2 text-sm">
					{canSeeLedger ? (
						<>
							<Link
								className="underline-offset-4 hover:underline"
								href={workspaceUrl("/books/accounting/accounts")}
							>
								Chart of accounts
							</Link>
							<Link
								className="underline-offset-4 hover:underline"
								href={workspaceUrl("/books/accounting/journal")}
							>
								Journal
							</Link>
							<Link
								className="underline-offset-4 hover:underline"
								href={workspaceUrl("/books/reports/trial-balance")}
							>
								Trial balance
							</Link>
						</>
					) : null}
					{can("bookkeeping.settings") || can("bookkeeping.lock") ? (
						<Link
							className="underline-offset-4 hover:underline"
							href={workspaceUrl("/settings/books")}
						>
							Books settings (lock dates, numbering)
						</Link>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
