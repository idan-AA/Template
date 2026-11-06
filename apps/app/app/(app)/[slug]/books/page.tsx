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
import { BooksHome } from "./books-home";

export const metadata: Metadata = {
	title: "Books",
};

export default function BooksPage() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Books</PageShellTitle>
					<PageShellDescription>
						What needs a look in your books.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Home />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Home() {
	await requireSession();

	const trpc = getServerTrpc();
	await Promise.all([
		getServerQueryClient().prefetchQuery(trpc.bookkeeping.home.queryOptions()),
		getServerQueryClient().prefetchQuery(trpc.bookkeeping.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<BooksHome />
		</HydrateClient>
	);
}
