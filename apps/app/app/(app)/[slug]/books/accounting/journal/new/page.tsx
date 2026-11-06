import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
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
import { JournalForm } from "./journal-form";

export const metadata: Metadata = {
	title: "New journal",
};

export default function NewJournalPage() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>New journal</PageShellTitle>
					<PageShellDescription>
						For adjustments the books cannot make on their own: depreciation,
						accruals, corrections between accounts. Once posted it never
						changes.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<NewJournal />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function NewJournal() {
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
		queryClient.prefetchQuery(trpc.bookkeepingSettings.get.queryOptions()),
		queryClient.prefetchQuery(trpc.bookkeeping.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<JournalForm />
		</HydrateClient>
	);
}
