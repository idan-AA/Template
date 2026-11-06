"use client";

import { CardTableEmpty } from "@app/ui/components/card-table";

/**
 * Shown when a books query fails. A 403 from the API reads "You do not have access to this part
 * of the books." (never a blank page); other failures show the server's own sentence.
 */
export function QueryError({ error }: { error: { message: string } }) {
	return (
		<div role="alert" className="rounded-lg border bg-card">
			<CardTableEmpty>{error.message}</CardTableEmpty>
		</div>
	);
}
