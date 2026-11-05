import { connection } from "next/server";
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
import { enabledOverviewWidgets } from "@/lib/modules";
import { OverviewEmpty } from "./overview-empty";
import { OVERVIEW_WIDGETS, type OverviewWidget } from "./overview-widgets";
import { BUILT_WIDGET_IDS, type BuiltWidgetId } from "./widget-ids";

function isBuilt(id: string): id is BuiltWidgetId {
	return (BUILT_WIDGET_IDS as readonly string[]).includes(id);
}

const CORE_DESCRIPTION =
	"Everything switched on for this workspace shows up here.";

/** The widgets of the enabled modules that the app has a component for. */
function builtWidgets(): OverviewWidget[] {
	return enabledOverviewWidgets().flatMap((declared) => {
		return isBuilt(declared.id) ? [OVERVIEW_WIDGETS[declared.id]] : [];
	});
}

export default function OverviewPage({ searchParams }: PageProps<"/[slug]">) {
	return (
		<PageShell>
			<Suspense fallback={<OverviewFallback />}>
				<OverviewHost searchParams={searchParams} />
			</Suspense>
		</PageShell>
	);
}

/** Core greeting, then whatever the enabled modules contribute. */
async function OverviewHost({
	searchParams,
}: Pick<PageProps<"/[slug]">, "searchParams">) {
	await connection();
	const widgets = enabledOverviewWidgets().flatMap((declared) => {
		return isBuilt(declared.id)
			? [{ id: declared.id, widget: OVERVIEW_WIDGETS[declared.id] }]
			: [];
	});
	const described = widgets.filter(({ widget }) => widget.Description);

	return (
		<>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>
						{widgets.length === 0 ? "Overview" : "Welcome back"}
					</PageShellTitle>
					{widgets.length === 0 ? null : described.length === 0 ? (
						<PageShellDescription>{CORE_DESCRIPTION}</PageShellDescription>
					) : (
						described.map(({ id, widget }) => {
							const { Description, DescriptionFallback } = widget;
							if (!Description) return null;

							return (
								<Suspense
									key={id}
									fallback={
										DescriptionFallback ? <DescriptionFallback /> : null
									}
								>
									<Description />
								</Suspense>
							);
						})
					)}
				</PageShellHeading>
				<PageShellActions>
					{widgets.map(({ id, widget }) => {
						const { Actions, ActionsFallback } = widget;
						if (!Actions) return null;

						return (
							<Suspense
								key={id}
								fallback={ActionsFallback ? <ActionsFallback /> : null}
							>
								<Actions />
							</Suspense>
						);
					})}
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent>
				{widgets.length === 0 ? (
					<OverviewEmpty />
				) : (
					widgets.map(({ id, widget: { Body } }) => (
						<Body key={id} searchParams={searchParams} />
					))
				)}
			</PageShellContent>
		</>
	);
}

function OverviewFallback() {
	const widgets = builtWidgets();
	const Description = widgets.find(
		(widget) => widget.DescriptionFallback,
	)?.DescriptionFallback;
	const Actions = widgets.find(
		(widget) => widget.ActionsFallback,
	)?.ActionsFallback;

	return (
		<>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Welcome back</PageShellTitle>
					{Description ? (
						<Description />
					) : (
						<PageShellDescription>{CORE_DESCRIPTION}</PageShellDescription>
					)}
				</PageShellHeading>
				<PageShellActions>{Actions ? <Actions /> : null}</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<PageShellLoading />
			</PageShellContent>
		</>
	);
}
