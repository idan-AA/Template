"use client";

import { cn } from "@app/ui/lib/utils";
import { CopyValue } from "../copy-value";

/** A value to read out or paste, with a copy button. */
export function CopyLine({
	label,
	value,
	mono = false,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-muted-foreground text-xs">{label}</span>
			<div className="flex items-center justify-between gap-2 rounded-md border py-1 pr-1 pl-3">
				<span className={cn("min-w-0 break-all text-sm", mono && "font-mono")}>
					{value}
				</span>
				<CopyValue value={value} label={label} />
			</div>
		</div>
	);
}
