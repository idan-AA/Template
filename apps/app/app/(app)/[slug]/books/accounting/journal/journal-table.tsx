"use client";

import { Badge } from "@app/ui/components/badge";
import { Button } from "@app/ui/components/button";
import { CardTableEmpty } from "@app/ui/components/card-table";
import { Field, FieldLabel } from "@app/ui/components/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/ui/components/select";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@app/ui/components/simple-table";
import { TableCell } from "@app/ui/components/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DateRangeForm } from "../../_components/date-range-form";
import { QueryError } from "../../_components/query-error";
import {
	formatDate,
	formatMoney,
	SOURCE_LABEL,
	sourceLabel,
} from "../../books-format";

const ALL = "ALL";
const PAGE_SIZE = 25;

const COLUMNS: SimpleTableColumn[] = [
	{
		id: "date",
		header: "Date",
		width: "w-28",
		className: "hidden md:table-cell",
	},
	{ id: "entry", header: "Entry" },
	{
		id: "type",
		header: "Type",
		width: "w-36",
		className: "hidden md:table-cell",
	},
	{ id: "amount", header: "Amount", width: "w-28 md:w-36", align: "right" },
	{
		id: "by",
		header: "Posted by",
		width: "w-44",
		className: "hidden lg:table-cell",
	},
];

const CELL = "px-3 py-2.5 align-middle";

export function JournalTable({
	from,
	to,
	page,
	source,
}: {
	from: string | null;
	to: string | null;
	page: number;
	source: string | null;
}) {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const sourceId = useId();
	const path = workspaceUrl("/books/accounting/journal");

	const list = useQuery({
		...trpc.bookkeepingJournal.list.queryOptions({
			from: from ?? undefined,
			to: to ?? undefined,
			page,
			pageSize: PAGE_SIZE,
			source: (source ?? undefined) as never,
		}),
		placeholderData: keepPreviousData,
	});

	const link = (next: { page?: number; source?: string | null }) => {
		const params = new URLSearchParams();
		const chosenSource = next.source === undefined ? source : next.source;

		if (from) params.set("from", from);
		if (to) params.set("to", to);
		if (chosenSource) params.set("source", chosenSource);
		if (next.page && next.page > 1) params.set("page", String(next.page));

		const query = params.toString();

		return query ? `${path}?${query}` : path;
	};

	if (list.error) return <QueryError error={list.error} />;
	if (!list.data) return null;

	const { rows, total, baseCurrency } = list.data;
	const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end gap-3">
				<DateRangeForm
					path={path}
					from={from}
					to={to}
					extra={{ source: source ?? undefined }}
				/>
				<Field className="w-48">
					<FieldLabel htmlFor={sourceId}>Type</FieldLabel>
					<Select
						value={source ?? ALL}
						onValueChange={(next) =>
							router.push(link({ source: next === ALL ? null : next }))
						}
					>
						<SelectTrigger id={sourceId} className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL}>All types</SelectItem>
							{Object.keys(SOURCE_LABEL).map((key) => (
								<SelectItem key={key} value={key}>
									{sourceLabel(key)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
			</div>

			<p className="text-muted-foreground text-xs">
				Amounts in {baseCurrency}: the total of the debits of each entry.
			</p>

			{rows.length === 0 ? (
				<div className="rounded-lg border bg-card">
					<CardTableEmpty>
						No entries match. Change the dates or the type, or write a new
						journal.
					</CardTableEmpty>
				</div>
			) : (
				<SimpleTable columns={COLUMNS}>
					{rows.map((row) => (
						<SimpleTableRow key={row.id}>
							<TableCell className={`${CELL} hidden md:table-cell`}>
								{formatDate(row.date)}
							</TableCell>
							<TableCell className={`${CELL} whitespace-normal`}>
								<div className="text-muted-foreground text-xs md:hidden">
									{formatDate(row.date)}
								</div>
								<Link
									className="font-medium underline-offset-4 hover:underline"
									href={workspaceUrl(`/books/accounting/journal/${row.id}`)}
								>
									{row.number}
								</Link>
								{row.reversed ? (
									<>
										{" "}
										<Badge variant="secondary">Reversed</Badge>
									</>
								) : null}
								{row.reversesNumber ? (
									<>
										{" "}
										<Badge variant="secondary">
											Reverses {row.reversesNumber}
										</Badge>
									</>
								) : null}
								<div className="text-muted-foreground text-xs">
									{row.memo ?? sourceLabel(row.source)}
								</div>
							</TableCell>
							<TableCell className={`${CELL} hidden md:table-cell`}>
								{sourceLabel(row.source)}
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{formatMoney(row.totalBase, baseCurrency)}
							</TableCell>
							<TableCell
								className={`${CELL} hidden text-muted-foreground lg:table-cell`}
							>
								{row.postedBy ?? ""}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			)}

			{pages > 1 ? (
				<div className="flex items-center justify-between gap-3 text-sm">
					<span className="text-muted-foreground">
						Page {page} of {pages}
					</span>
					<div className="flex gap-2">
						{page > 1 ? (
							<Button variant="outline" asChild>
								<Link href={link({ page: page - 1 })}>Newer</Link>
							</Button>
						) : null}
						{page < pages ? (
							<Button variant="outline" asChild>
								<Link href={link({ page: page + 1 })}>Older</Link>
							</Button>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}
