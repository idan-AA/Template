"use client";

import { Button } from "@app/ui/components/button";
import Link from "next/link";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

/** Shown when no switched-on module has anything to put on the overview. */
export function OverviewEmpty() {
	const workspaceUrl = useWorkspaceUrl();

	return (
		<section className="flex max-w-md flex-col items-start gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="font-heading text-base font-medium">
					Your workspace is ready
				</h2>
				<p className="text-pretty text-muted-foreground text-sm/relaxed">
					Chat with the assistant, or finish setting up in Settings. What each
					part of the business is doing shows up here as it is switched on.
				</p>
			</div>

			<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
				<Button asChild variant="contrast" className="sm:w-auto">
					<Link href={workspaceUrl("/chat")}>Open chat</Link>
				</Button>
				<Button asChild variant="outline" className="sm:w-auto">
					<Link href={workspaceUrl("/settings")}>Open settings</Link>
				</Button>
			</div>
		</section>
	);
}
