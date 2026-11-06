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
import { BooksSettings } from "./books-settings";

export const metadata: Metadata = {
	title: "Books",
};

export default function BooksSettingsPage() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Books</PageShellTitle>
					<PageShellDescription>
						When the books are closed, how entries are numbered, and the year
						the reports follow.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Settings />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Settings() {
	await requireSession();

	const trpc = getServerTrpc();
	await getServerQueryClient().prefetchQuery(
		trpc.bookkeepingSettings.get.queryOptions(),
	);

	return (
		<HydrateClient>
			<div className="flex max-w-3xl flex-col gap-6">
				<BooksSettings />
			</div>
		</HydrateClient>
	);
}
