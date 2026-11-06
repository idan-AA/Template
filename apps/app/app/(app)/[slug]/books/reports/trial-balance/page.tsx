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
import { TrialBalanceReport } from "./trial-balance-report";

export const metadata: Metadata = {
	title: "Trial balance",
};

function asOfFrom(value: string | string[] | undefined): string | undefined {
	const first = Array.isArray(value) ? value[0] : value;

	return first && /^\d{4}-\d{2}-\d{2}$/.test(first) ? first : undefined;
}

export default function TrialBalancePage({
	searchParams,
}: PageProps<"/[slug]/books/reports/trial-balance">) {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Trial balance</PageShellTitle>
					<PageShellDescription>
						Every account and its balance on a date, from posted entries only.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<TrialBalance searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function TrialBalance({
	searchParams,
}: Pick<
	PageProps<"/[slug]/books/reports/trial-balance">,
	"searchParams"
>) {
	const [, query] = await Promise.all([requireSession(), searchParams]);
	const asOf = asOfFrom(query.asOf);

	const trpc = getServerTrpc();
	await getServerQueryClient().prefetchQuery(
		trpc.bookkeepingReports.trialBalance.queryOptions({ asOf }),
	);

	return (
		<HydrateClient>
			<TrialBalanceReport asOf={asOf ?? null} />
		</HydrateClient>
	);
}
