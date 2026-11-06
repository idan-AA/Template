"use client";

import { CardTableEmpty } from "@app/ui/components/card-table";
import { Field, FieldLabel } from "@app/ui/components/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/ui/components/select";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { AccountLedger } from "../../accounting/accounts/[id]/account-ledger";
import { QueryError } from "../../_components/query-error";

/** The general ledger report is the account ledger with an account picker on top. */
export function GeneralLedgerReport({
	account,
	from,
	to,
}: {
	account: string | null;
	from: string | null;
	to: string | null;
}) {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const pickerId = useId();

	const accounts = useQuery(
		trpc.bookkeepingAccounts.list.queryOptions({
			includeArchived: true,
			q: "",
		}),
	);

	if (accounts.error) return <QueryError error={accounts.error} />;
	if (!accounts.data) return null;

	return (
		<div className="flex flex-col gap-6">
			<Field className="max-w-md">
				<FieldLabel htmlFor={pickerId}>Account</FieldLabel>
				<Select
					value={account ?? ""}
					onValueChange={(next) =>
						router.push(
							`${workspaceUrl("/books/reports/general-ledger")}?account=${next}`,
						)
					}
				>
					<SelectTrigger id={pickerId} className="w-full">
						<SelectValue placeholder="Pick an account" />
					</SelectTrigger>
					<SelectContent>
						{accounts.data.accounts.map((item) => (
							<SelectItem key={item.id} value={item.id}>
								{item.code} · {item.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>

			{account ? (
				<AccountLedger id={account} from={from} to={to} hideHeader />
			) : (
				<div className="rounded-lg border bg-card">
					<CardTableEmpty>
						Pick an account to see its ledger.
					</CardTableEmpty>
				</div>
			)}
		</div>
	);
}
