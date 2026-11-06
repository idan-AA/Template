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
import { QuickbooksSettings } from "./quickbooks-settings";

export const metadata: Metadata = {
	title: "QuickBooks",
};

export default function QuickbooksSettingsPage() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>QuickBooks</PageShellTitle>
					<PageShellDescription>
						Connect your QuickBooks Online company. Your books stay in
						QuickBooks.
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
		trpc.quickbooks.status.queryOptions(),
	);

	return (
		<HydrateClient>
			<div className="flex max-w-3xl flex-col gap-6">
				<QuickbooksSettings />
			</div>
		</HydrateClient>
	);
}
