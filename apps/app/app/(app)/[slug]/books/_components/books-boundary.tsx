"use client";

import { CardTableEmpty } from "@app/ui/components/card-table";
import { usePathname } from "next/navigation";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { NO_ACCESS_MESSAGE } from "./query-error";
import { useBooksAccess } from "./use-books-access";

/**
 * Keeps a person out of the Books pages their role does not hold, with one plain sentence that
 * says who can grant access (never a blank page or a bare error). The Books home needs
 * `bookkeeping.read`; the accounting and report pages need `bookkeeping.reports`, the same keys
 * the API checks. The API still refuses on its own: this only decides what the screen shows.
 */
export function BooksBoundary({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();
	const { loaded, can } = useBooksAccess();

	if (!loaded) return null;

	const home = pathname === workspaceUrl("/books");
	const allowed = home ? can("bookkeeping.read") : can("bookkeeping.reports");

	if (allowed) return <>{children}</>;

	return (
		<div role="alert" className="m-4 rounded-lg border bg-card md:m-6">
			<CardTableEmpty>{NO_ACCESS_MESSAGE}</CardTableEmpty>
		</div>
	);
}
