"use client";

import { Button } from "@app/ui/components/button";
import { Icon } from "@app/ui/components/icon";
import Add from "@carbon/icons-react/es/Add";
import { parseAsBoolean, useQueryState } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

/**
 * What an empty list shows the first time: one sentence and the one action that
 * fills it. The button opens the same create sheet as the page's own button.
 */
export function FirstRunEmpty({
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action: string;
}) {
	const [, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);

	return (
		<div className="flex max-w-sm flex-col items-center gap-3">
			<div className="flex flex-col gap-1">
				<p className="font-medium text-foreground text-sm">{title}</p>
				<p className="text-pretty text-sm">{description}</p>
			</div>
			<Button size="sm" onClick={() => setOpen(true)}>
				<Icon icon={Add} data-icon="inline-start" />
				{action}
			</Button>
		</div>
	);
}
