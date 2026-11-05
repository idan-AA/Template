import { Suspense } from "react";
import { PageShellLoading } from "@/components/page-shell";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DashboardSummary } from "./dashboard-summary";
import { loadOverviewSearchParams } from "./overview-search-params";
import type { OverviewWidgetProps } from "./overview-widgets";

/** The CRM module's overview widget: the sales dashboard, moved here unchanged. */
export function CrmOverviewBody({ searchParams }: OverviewWidgetProps) {
	return (
		<Suspense fallback={<PageShellLoading />}>
			<Summary searchParams={searchParams} />
		</Suspense>
	);
}

async function Summary({ searchParams }: OverviewWidgetProps) {
	const [, { scope }] = await Promise.all([
		requireSession(),
		loadOverviewSearchParams(searchParams),
	]);

	const queryClient = getServerQueryClient();
	await queryClient.prefetchQuery(
		getServerTrpc().dashboard.summary.queryOptions({ scope }),
	);

	return (
		<HydrateClient>
			<DashboardSummary />
		</HydrateClient>
	);
}
