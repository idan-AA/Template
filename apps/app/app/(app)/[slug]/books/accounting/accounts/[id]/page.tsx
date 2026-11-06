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
import { fiscalYearStart } from "../../../books-format";
import { AccountLedger } from "./account-ledger";

export const metadata: Metadata = {
	title: "Account ledger",
};

function single(value: string | string[] | undefined): string | undefined {
	const first = Array.isArray(value) ? value[0] : value;

	return first && /^\d{4}-\d{2}-\d{2}$/.test(first) ? first : undefined;
}

export default function AccountLedgerPage({
	params,
	searchParams,
}: PageProps<"/[slug]/books/accounting/accounts/[id]">) {
	return (
		<PageShell>
			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Ledger params={params} searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Ledger({
	params,
	searchParams,
}: Pick<
	PageProps<"/[slug]/books/accounting/accounts/[id]">,
	"params" | "searchParams"
>) {
	const [, { id }, query] = await Promise.all([
		requireSession(),
		params,
		searchParams,
	]);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	let from = single(query.from);
	const to = single(query.to);

	// With no range in the URL the ledger opens on the current fiscal year, so a long history does
	// not load in one go. The range is in the URL from then on.
	if (!from && !to) {
		try {
			const settings = await queryClient.fetchQuery(
				trpc.bookkeepingSettings.get.queryOptions(),
			);
			from = fiscalYearStart(settings.today, settings.fiscalYearStartMonth);
		} catch {
			from = undefined;
		}
	}

	await Promise.all([
		queryClient.prefetchQuery(
			trpc.bookkeepingAccounts.ledger.queryOptions({ id, from, to }),
		),
		queryClient.prefetchQuery(trpc.bookkeeping.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<AccountLedger id={id} from={from ?? null} to={to ?? null} />
		</HydrateClient>
	);
}
