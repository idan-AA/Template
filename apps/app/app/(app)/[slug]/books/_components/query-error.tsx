"use client";

import { CardTableEmpty } from "@app/ui/components/card-table";

/** One sentence for every "you may not" case: what is missing and who can fix it. */
export const NO_ACCESS_MESSAGE =
	"You do not have access to this part of the books. An owner or an admin can give you the Bookkeeper or Accountant role.";

/**
 * Shown when a books query fails. A 403 from the API reads as NO_ACCESS_MESSAGE (never a blank
 * page); other failures show the server's own sentence.
 */
export function QueryError({ error }: { error: { message: string } }) {
	const denied = /do not have access/i.test(error.message);

	return (
		<div role="alert" className="rounded-lg border bg-card">
			<CardTableEmpty>{denied ? NO_ACCESS_MESSAGE : error.message}</CardTableEmpty>
		</div>
	);
}
