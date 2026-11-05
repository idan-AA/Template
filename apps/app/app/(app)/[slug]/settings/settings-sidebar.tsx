"use client";

import { Button } from "@app/ui/components/button";
import { cn } from "@app/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { ROOT, type SettingsNavItem } from "./settings-items";

function isActive(href: string, root: string, pathname: string): boolean {
	return href === root ? pathname === href : pathname.startsWith(href);
}

function NavLink({
	item,
	active,
	className,
}: {
	item: SettingsNavItem;
	active: boolean;
	className: string;
}) {
	return (
		<Button
			asChild
			variant="ghost"
			className={cn(
				"justify-start font-normal text-muted-foreground",
				active &&
					"bg-muted text-foreground hover:bg-muted hover:text-foreground",
				className,
			)}
		>
			<Link
				href={item.href}
				prefetch
				aria-current={active ? "page" : undefined}
				transitionTypes={["nav-lateral"]}
			>
				{item.title}
			</Link>
		</Button>
	);
}

export function SettingsSidebarFallback({
	items: ITEMS,
}: {
	items: readonly SettingsNavItem[];
}) {
	return (
		<>
			<aside className="hidden w-56 shrink-0 border-r md:block [view-transition-name:settings-sidebar]">
				<nav
					aria-label="Workspace settings"
					aria-busy="true"
					className="flex flex-col gap-0.5 p-3"
				>
					{ITEMS.map((item) => (
						<Button
							key={item.href}
							variant="ghost"
							disabled
							className="w-full justify-start px-3 font-normal text-muted-foreground"
						>
							{item.title}
						</Button>
					))}
				</nav>
			</aside>

			<nav
				aria-label="Workspace settings"
				aria-busy="true"
				className="flex gap-1 overflow-x-auto border-b p-2 md:hidden [view-transition-name:settings-sidebar]"
			>
				{ITEMS.map((item) => (
					<Button
						key={item.href}
						variant="ghost"
						disabled
						className="shrink-0 justify-start px-3 font-normal text-muted-foreground"
					>
						{item.title}
					</Button>
				))}
			</nav>
		</>
	);
}

export function SettingsSidebar({
	items: source,
}: {
	items: readonly SettingsNavItem[];
}) {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();

	const root = workspaceUrl(ROOT);
	const items = useMemo(
		() => source.map((item) => ({ ...item, href: workspaceUrl(item.href) })),
		[workspaceUrl, source],
	);

	return (
		<>
			<aside className="hidden w-56 shrink-0 border-r md:block [view-transition-name:settings-sidebar]">
				<nav
					aria-label="Workspace settings"
					className="flex flex-col gap-0.5 p-3"
				>
					{items.map((item) => (
						<NavLink
							key={item.href}
							item={item}
							active={isActive(item.href, root, pathname)}
							className="w-full px-3"
						/>
					))}
				</nav>
			</aside>

			<nav
				aria-label="Workspace settings"
				className="flex gap-1 overflow-x-auto border-b p-2 md:hidden [view-transition-name:settings-sidebar]"
			>
				{items.map((item) => (
					<NavLink
						key={item.href}
						item={item}
						active={isActive(item.href, root, pathname)}
						className="shrink-0 px-3"
					/>
				))}
			</nav>
		</>
	);
}
