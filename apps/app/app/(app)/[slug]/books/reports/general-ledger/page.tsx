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
import { fiscalYearStart } from "../../books-format";
import { GeneralLedgerReport } from "./general-ledger-report";

export const metadata: Metadata = {
	title: "General ledger",
};

function one(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

function dateParam(value: string | string[] | undefined): string | undefined {
	const first = one(value);

	return first && /^\d{4}-\d{2}-\d{2}$/.test(first) ? first : undefined;
}

export default function GeneralLedgerPage({
	searchParams,
}: PageProps<"/[slug]/books/reports/general-ledger">) {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>General ledger</PageShellTitle>
					<PageShellDescription>
						Pick an account to see every posted line behind its balance.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<GeneralLedger searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function GeneralLedger({
	searchParams,
}: Pick<
	PageProps<"/[slug]/books/reports/general-ledger">,
	"searchParams"
>) {
	const [, query] = await Promise.all([requireSession(), searchParams]);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const account = one(query.account) || null;

	let from = dateParam(query.from);
	const to = dateParam(query.to);

	if (account && !from && !to) {
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
			trpc.bookkeepingAccounts.list.queryOptions({
				includeArchived: true,
				q: "",
			}),
		),
		account
			? queryClient.prefetchQuery(
					trpc.bookkeepingAccounts.ledger.queryOptions({ id: account, from, to }),
				)
			: Promise.resolve(),
		queryClient.prefetchQuery(trpc.bookkeeping.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<GeneralLedgerReport
				account={account}
				from={from ?? null}
				to={to ?? null}
			/>
		</HydrateClient>
	);
}
