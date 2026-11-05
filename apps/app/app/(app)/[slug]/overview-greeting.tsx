"use client";

import { useQueryState } from "nuqs";
import { PageShellDescription } from "@/components/page-shell";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { overviewParsers } from "./overview-search-params";

export function OverviewDescriptionFallback() {
	return (
		<PageShellDescription>
			What you have closed, what is still in play, and what needs you today.
		</PageShellDescription>
	);
}

export function OverviewDescription() {
	const [scope] = useQueryState(
		SEARCH_PARAM.overview.scope,
		overviewParsers[SEARCH_PARAM.overview.scope],
	);

	return (
		<PageShellDescription>
			{scope === "me"
				? "What you have closed, what is still in play, and what needs you today."
				: "What the team has closed, what is still in play, and what needs you today."}
		</PageShellDescription>
	);
}
