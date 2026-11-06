"use client";

import { Button } from "@app/ui/components/button";
import { cn } from "@app/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type Section = {
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
	{ title: "Home", href: "/books", match: "exact" },
	{
		title: "Accounting",
		href: "/books/accounting/accounts",
		match: "prefix",
		under: "/books/accounting",
	},
	{
		title: "Reports",
		href: "/books/reports",
		match: "prefix",
	},
];

export function BooksNav() {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();

	return (
		<nav
			aria-label="Books"
			className="flex shrink-0 gap-1 overflow-x-auto border-b px-4 py-2 md:px-6"
		>
			{SECTIONS.map((section) => {
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
