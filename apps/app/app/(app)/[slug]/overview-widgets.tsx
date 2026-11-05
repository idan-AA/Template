import type { ComponentType } from "react";
import { CrmOverviewBody } from "./crm-overview";
import {
	OverviewDescription,
	OverviewDescriptionFallback,
} from "./overview-greeting";
import {
	OverviewScopeToggle,
	OverviewScopeToggleFallback,
} from "./overview-scope";
import type { BuiltWidgetId } from "./widget-ids";

export type OverviewWidgetProps = {
	searchParams: PageProps<"/[slug]">["searchParams"];
};

/**
 * What the app renders for a widget a module declares by id. The package that
 * declares the widget cannot import app code, so the component lives here.
 * `Description` and `Actions` fill the page header; `Body` fills the page.
 */
export type OverviewWidget = {
	Description?: ComponentType;
	DescriptionFallback?: ComponentType;
	Actions?: ComponentType;
	ActionsFallback?: ComponentType;
	Body: ComponentType<OverviewWidgetProps>;
};

export const OVERVIEW_WIDGETS: Readonly<Record<BuiltWidgetId, OverviewWidget>> =
	{
		"crm.sales": {
			Description: OverviewDescription,
			DescriptionFallback: OverviewDescriptionFallback,
			Actions: OverviewScopeToggle,
			ActionsFallback: OverviewScopeToggleFallback,
			Body: CrmOverviewBody,
		},
	};
