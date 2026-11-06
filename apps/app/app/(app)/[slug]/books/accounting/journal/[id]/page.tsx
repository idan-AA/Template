import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellLoading,
} from "@/components/page-shell";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { EntryView } from "./entry-view";

export const metadata: Metadata = {
	title: "Journal entry",
};

export default function JournalEntryPage({
	params,
}: PageProps<"/[slug]/books/accounting/journal/[id]">) {
	return (
		<PageShell>
			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Entry params={params} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Entry({
	params,
}: Pick<PageProps<"/[slug]/books/accounting/journal/[id]">, "params">) {
	const [, { id }] = await Promise.all([requireSession(), params]);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(trpc.bookkeepingJournal.byId.queryOptions({ id })),
		queryClient.prefetchQuery(trpc.bookkeeping.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<EntryView id={id} />
		</HydrateClient>
	);
}
