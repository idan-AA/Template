import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
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
import { getModuleView } from "@/lib/modules";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { FeaturesList } from "./features-list";

export const metadata: Metadata = {
	title: "Features",
};

export default function FeaturesSettingsPage() {
	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Features</PageShellTitle>
					<PageShellDescription>
						Choose what this workspace can use. Switching a feature off hides
						it for everyone else; nothing is deleted.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<Features />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Features() {
	await connection();
	await requireSession();

	// Only the developer account has this page. Everyone else gets the 404 page,
	// and the API refuses them as well (`modules.set` and `modules.list`).
	const view = await getModuleView();
	if (!view.isDeveloper) notFound();

	const trpc = getServerTrpc();
	await getServerQueryClient().prefetchQuery(trpc.modules.list.queryOptions());

	return (
		<HydrateClient>
			<FeaturesList />
		</HydrateClient>
	);
}
