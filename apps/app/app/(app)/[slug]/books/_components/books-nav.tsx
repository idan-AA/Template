"use client";

import { Button } from "@app/ui/components/button";
import { cn } from "@app/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useBooksAccess } from "./use-books-access";

type Section = {
	/** The permission key that shows this tab (the API checks the same key). */
	key: string;
	title: string;
	href: string;
	match: "exact" | "prefix";
	/** Where the section's pages live, when that differs from its landing page. */
	under?: string;
};

/**
 * The sections of Books. Sales, Purchases and Banking join this bar in later rounds; a section
 * with no screen yet is not shown at all (a disabled tab is a promise the product cannot keep).
 */
const SECTIONS: Section[] = [
	{ key: "bookkeeping.read", title: "Home", href: "/books", match: "exact" },
	{
		key: "bookkeeping.reports",
		title: "Accounting",
		href: "/books/accounting/accounts",
		match: "prefix",
		under: "/books/accounting",
	},
	{
		key: "bookkeeping.reports",
		title: "Reports",
		href: "/books/reports",
		match: "prefix",
	},
];

export function BooksNav() {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();
	const { loaded, can } = useBooksAccess();
	const shown = SECTIONS.filter((section) => can(section.key));

	// Until the access answer arrives, or when nothing is allowed, a bar of links would only lead
	// to dead ends; the page below says what is missing.
	if (!loaded || shown.length === 0) return null;

	return (
		<nav
			aria-label="Books"
			className="flex shrink-0 gap-1 overflow-x-auto border-b px-4 py-2 md:px-6"
		>
			{shown.map((section) => {
				const root = workspaceUrl(section.under ?? section.href);
				const active =
					section.match === "exact"
						? pathname === root
						: pathname.startsWith(root);

				return (
					<Button
						key={section.href}
						asChild
						variant="ghost"
						className={cn(
							"shrink-0 justify-start font-normal text-muted-foreground",
							active &&
								"bg-muted text-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<Link
							href={workspaceUrl(section.href)}
							aria-current={active ? "page" : undefined}
						>
							{section.title}
						</Link>
					</Button>
				);
			})}
		</nav>
	);
}
