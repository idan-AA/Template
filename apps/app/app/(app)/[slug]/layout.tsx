import { notFound, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";
import { AppHeader, AppHeaderFallback } from "@/components/app-header";
import { AppIconRail, AppIconRailFallback } from "@/components/app-icon-rail";
import { QuickSwitcher } from "@/components/crm/quick-switcher";
import { RecordSheetHost } from "@/components/crm/record-sheet/record-sheet-host";
import { MobileNavProvider } from "@/components/mobile-nav";
import { getBrand } from "@/lib/brand";
import { enabledNav, getModuleView } from "@/lib/modules";
import { requireMailboxAccess } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";

export default function AppLayout({
	children,
	params,
}: LayoutProps<"/[slug]">) {
	return (
		<MobileNavProvider>
			<div className="isolate flex h-svh flex-col">
				<Suspense fallback={<AppHeaderFallback />}>
					<WorkspaceHeader params={params} />
				</Suspense>

				<div className="flex min-h-0 flex-1">
					<Suspense
						fallback={<AppIconRailFallback moduleItems={enabledNav()} />}
					>
						<ModuleRail />
					</Suspense>
					{children}
				</div>

				<Suspense fallback={null}>
					<CrmOverlays />
				</Suspense>
			</div>
		</MobileNavProvider>
	);
}

async function ModuleRail() {
	await connection();
	const view = await getModuleView();

	return <AppIconRail moduleItems={enabledNav(view.modules)} />;
}

/** The record sheet and the quick switcher only know about CRM records. */
async function CrmOverlays() {
	await connection();

	const view = await getModuleView();
	if (!view.modules.some((module) => module.id === "crm")) return null;

	return (
		<>
			<Suspense fallback={null}>
				<RecordSheetHost />
			</Suspense>

			<Suspense fallback={null}>
				<QuickSwitcher />
			</Suspense>
		</>
	);
}

async function loadWorkspace() {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().workspace.get.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		return null;
	}
}

async function WorkspaceHeader({
	params,
}: Pick<LayoutProps<"/[slug]">, "params">) {
	await connection();
	const [{ user }, { slug }, workspace, view] = await Promise.all([
		requireMailboxAccess(),
		params,
		loadWorkspace(),
		getModuleView(),
	]);

	if (workspace && workspace.slug !== slug) notFound();

	return (
		<HydrateClient>
			{view.previewing ? (
				<div className="flex items-center justify-center gap-2 border-b bg-muted px-3 py-1 text-xs">
					<span>You are previewing this workspace as a client sees it.</span>
					<Link
						href={workspaceUrl(slug, "/settings/features")}
						className="underline underline-offset-2"
					>
						Stop previewing
					</Link>
				</div>
			) : null}
			<AppHeader
				brandName={getBrand().name}
				workspaceName={workspace?.name}
				showEnrichment={view.modules.some((module) => module.id === "crm")}
				user={{
					name: user.name,
					email: user.email,
					image: user.image ?? null,
				}}
			/>
		</HydrateClient>
	);
}
