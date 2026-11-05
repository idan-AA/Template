/** Overview widgets the app has a component for. `OVERVIEW_WIDGETS` must have exactly these keys. */
export const BUILT_WIDGET_IDS = ["crm.sales"] as const;

export type BuiltWidgetId = (typeof BUILT_WIDGET_IDS)[number];

/**
 * Widgets a module has declared that have no component yet. This is the only
 * place a declared widget may lack one; a test enforces it.
 */
export const WIDGETS_NOT_BUILT_YET: readonly string[] = [
	"bookkeeping.overview",
];
