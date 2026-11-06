import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AccountsTable } from "./accounts-table";
import { CreateAccountSheet } from "./create-account-sheet";

export const metadata: Metadata = {
	title: "Chart of accounts",
};

export default function AccountsPage() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Chart of accounts</PageShellTitle>
					<PageShellDescription>
						Every account and what it holds today. Open one to see each entry
						behind its balance.
					</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<CreateAccountSheet />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Accounts />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Accounts() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.bookkeepingAccounts.list.queryOptions({
				includeArchived: false,
				q: "",
			}),
		),
		queryClient.prefetchQuery(trpc.bookkeeping.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<AccountsTable />
		</HydrateClient>
	);
}
