/**
 * Whether a list is narrowed by a search or a filter. An empty list that is
 * narrowed says "nothing matches"; an empty list that is not narrowed is a
 * first run and should say what to do next. The "all" tab is no filter.
 */
export function listIsNarrowed(view: {
	q: string;
	filters: Record<string, string[]>;
}): boolean {
	if (view.q.trim() !== "") return true;

	return Object.values(view.filters).some((selected) =>
		selected.some((value) => value !== "all"),
	);
}
