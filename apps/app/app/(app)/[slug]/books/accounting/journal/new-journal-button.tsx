"use client";

import { Button } from "@app/ui/components/button";
import { Icon } from "@app/ui/components/icon";
import Add from "@carbon/icons-react/es/Add";
import Link from "next/link";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useBooksAccess } from "../../_components/use-books-access";

/**
 * Writing a journal is a desktop task (balancing many lines on a phone invites mistakes), so on a
 * phone the button is replaced by a note. Reading the journal works everywhere.
 */
export function NewJournalButton() {
	const workspaceUrl = useWorkspaceUrl();
	const { can } = useBooksAccess();

	if (!can("bookkeeping.post")) return null;

	return (
		<>
			<Button asChild className="hidden md:inline-flex">
				<Link href={workspaceUrl("/books/accounting/journal/new")}>
					<Icon icon={Add} data-icon="inline-start" />
					New journal
				</Link>
			</Button>
			<p className="text-muted-foreground text-xs md:hidden">
				Use a larger screen to write a journal.
			</p>
		</>
	);
}
