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
import { JournalTable } from "./journal-table";
import { NewJournalButton } from "./new-journal-button";

export const metadata: Metadata = {
	title: "Journal",
};

function one(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

function parseJournalQuery(
	query: Record<string, string | string[] | undefined>,
) {
	const date = /^\d{4}-\d{2}-\d{2}$/;
	const from = one(query.from);
	const to = one(query.to);
	const page = Number.parseInt(one(query.page) ?? "1", 10);
	const source = one(query.source);

	return {
		from: from && date.test(from) ? from : undefined,
		to: to && date.test(to) ? to : undefined,
		page: Number.isFinite(page) && page >= 1 ? page : 1,
		source: source || undefined,
	};
}

export default function JournalPage({
	searchParams,
}: PageProps<"/[slug]/books/accounting/journal">) {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Journal</PageShellTitle>
					<PageShellDescription>
						Every entry posted to the books, newest first. A posted entry never
						changes: a mistake is fixed with a reversal.
					</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<NewJournalButton />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Journal searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Journal({
	searchParams,
}: Pick<PageProps<"/[slug]/books/accounting/journal">, "searchParams">) {
	const [, query] = await Promise.all([requireSession(), searchParams]);
	const filters = parseJournalQuery(query);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.bookkeepingJournal.list.queryOptions({
				from: filters.from,
				to: filters.to,
				page: filters.page,
				pageSize: 25,
				source: filters.source as never,
			}),
		),
		queryClient.prefetchQuery(trpc.bookkeeping.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<JournalTable
				from={filters.from ?? null}
				to={filters.to ?? null}
				page={filters.page}
				source={filters.source ?? null}
			/>
		</HydrateClient>
	);
}
