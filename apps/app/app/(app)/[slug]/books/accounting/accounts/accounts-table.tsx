"use client";

import { Badge } from "@app/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/ui/components/card";
import { CardTableEmpty } from "@app/ui/components/card-table";
import { Checkbox } from "@app/ui/components/checkbox";
import { Field, FieldLabel } from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
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
import { useId, useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { QueryError } from "../../_components/query-error";
import {
	type AccountTypeKey,
	formatMoney,
	subtypeLabel,
	TYPE_LABEL,
	TYPE_ORDER,
} from "../../books-format";

const ALL = "ALL";

const COLUMNS: SimpleTableColumn[] = [
	{ id: "code", header: "Code", width: "w-24" },
	{ id: "name", header: "Account" },
	{ id: "balance", header: "Balance", width: "w-40", align: "right" },
];

const CELL = "px-3 py-2.5 align-middle";

export function AccountsTable() {
	const trpc = useTRPC();
	const workspaceUrl = useWorkspaceUrl();
	const searchId = useId();
	const typeId = useId();
	const archivedId = useId();

	const [q, setQ] = useState("");
	const [type, setType] = useState<string>(ALL);
	const [includeArchived, setIncludeArchived] = useState(false);

	const list = useQuery({
		...trpc.bookkeepingAccounts.list.queryOptions({
			includeArchived,
			q,
			type: type === ALL ? undefined : (type as AccountTypeKey),
		}),
		placeholderData: keepPreviousData,
	});

	if (list.error) return <QueryError error={list.error} />;
	if (!list.data) return null;

	const { baseCurrency, accounts } = list.data;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end gap-3">
				<Field className="w-full sm:w-64">
					<FieldLabel htmlFor={searchId}>Search</FieldLabel>
					<Input
						id={searchId}
						value={q}
						placeholder="Code or name"
						autoComplete="off"
						onChange={(event) => setQ(event.target.value)}
					/>
				</Field>
				<Field className="w-48">
					<FieldLabel htmlFor={typeId}>Type</FieldLabel>
					<Select value={type} onValueChange={setType}>
						<SelectTrigger id={typeId} className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL}>All types</SelectItem>
							{TYPE_ORDER.map((key) => (
								<SelectItem key={key} value={key}>
									{TYPE_LABEL[key]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<label
					htmlFor={archivedId}
					className="flex items-center gap-2 pb-2 text-sm"
				>
					<Checkbox
						id={archivedId}
						checked={includeArchived}
						onCheckedChange={(next) => setIncludeArchived(next === true)}
					/>
					Show archived
				</label>
			</div>

			<p className="text-muted-foreground text-xs">
				Balances are in {baseCurrency}, on each account's normal side.
			</p>

			{accounts.length === 0 ? (
				<div className="rounded-lg border bg-card">
					<CardTableEmpty>
						No accounts match. Clear the search, or add an account.
					</CardTableEmpty>
				</div>
			) : (
				TYPE_ORDER.map((key) => {
					const rows = accounts.filter((account) => account.type === key);
					if (rows.length === 0) return null;

					return (
						<Card key={key}>
							<CardHeader>
								<CardTitle>{TYPE_LABEL[key]}</CardTitle>
								<CardDescription>
									{rows.length === 1 ? "1 account" : `${rows.length} accounts`}
								</CardDescription>
							</CardHeader>
							<CardContent className="px-0">
								<SimpleTable columns={COLUMNS} containerClassName="border-x-0 rounded-none">
									{rows.map((account) => (
										<SimpleTableRow key={account.id}>
											<TableCell className={`${CELL} tabular-nums`}>
												{account.code}
											</TableCell>
											<TableCell className={CELL}>
												<Link
													className="font-medium underline-offset-4 hover:underline"
													href={workspaceUrl(
														`/books/accounting/accounts/${account.id}`,
													)}
												>
													{account.name}
												</Link>
												<div className="text-muted-foreground text-xs">
													{subtypeLabel(account.subtype)}
													{account.isSystem ? " · System account" : ""}
													{account.archived ? " · " : ""}
													{account.archived ? (
														<Badge variant="secondary">Archived</Badge>
													) : null}
												</div>
											</TableCell>
											<TableCell className={`${CELL} text-right tabular-nums`}>
												{formatMoney(account.balanceBase, baseCurrency)}
											</TableCell>
										</SimpleTableRow>
									))}
								</SimpleTable>
							</CardContent>
						</Card>
					);
				})
			)}
		</div>
	);
}
