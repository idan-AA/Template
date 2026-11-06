"use client";

import { Button } from "@app/ui/components/button";
import { Field, FieldLabel } from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

/**
 * A date range that lives in the URL (?from=...&to=...), so a report can be shared, bookmarked
 * and reloaded. `extra` carries other params that must survive (for example the chosen account).
 */
export function DateRangeForm({
	path,
	from,
	to,
	extra = {},
}: {
	path: string;
	from: string | null;
	to: string | null;
	extra?: Record<string, string | undefined>;
}) {
	const router = useRouter();
	const fromId = useId();
	const toId = useId();
	const [draftFrom, setDraftFrom] = useState(from ?? "");
	const [draftTo, setDraftTo] = useState(to ?? "");

	return (
		<form
			className="flex flex-wrap items-end gap-3"
			onSubmit={(event) => {
				event.preventDefault();
				const params = new URLSearchParams();

				for (const [key, value] of Object.entries(extra)) {
					if (value) params.set(key, value);
				}
				if (draftFrom) params.set("from", draftFrom);
				if (draftTo) params.set("to", draftTo);

				const query = params.toString();
				router.push(query ? `${path}?${query}` : path);
			}}
		>
			<Field className="w-40">
				<FieldLabel htmlFor={fromId}>From</FieldLabel>
				<Input
					id={fromId}
					type="date"
					value={draftFrom}
					onChange={(event) => setDraftFrom(event.target.value)}
				/>
			</Field>
			<Field className="w-40">
				<FieldLabel htmlFor={toId}>To</FieldLabel>
				<Input
					id={toId}
					type="date"
					value={draftTo}
					onChange={(event) => setDraftTo(event.target.value)}
				/>
			</Field>
			<Button type="submit" variant="outline">
				Apply
			</Button>
		</form>
	);
}
