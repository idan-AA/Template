"use client";

import { Button } from "@app/ui/components/button";
import { cn } from "@app/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/**
 * The settings tabs on a narrow screen scroll sideways. A fade on the edge that
 * still has tabs beyond it says so, and the current tab is scrolled into view so
 * the person never opens a page whose tab is out of sight.
 */
function useScrollHints() {
	const ref = useRef<HTMLElement>(null);
	const [more, setMore] = useState({ before: false, after: false });

	const measure = useCallback(() => {
		const el = ref.current;
		if (!el) return;

		setMore({
			before: el.scrollLeft > 4,
			after: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
		});
	}, []);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		el.querySelector("[aria-current=page]")?.scrollIntoView({
			block: "nearest",
			inline: "center",
		});
		measure();

		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [measure]);

	return { ref, more, onScroll: measure };
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
	const { ref, more, onScroll } = useScrollHints();

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

			<div className="relative border-b md:hidden [view-transition-name:settings-sidebar]">
				<nav
					ref={ref}
					aria-label="Workspace settings"
					onScroll={onScroll}
					className="flex gap-1 overflow-x-auto p-2"
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

				{more.before ? (
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-background to-transparent"
					/>
				) : null}
				{more.after ? (
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent"
					/>
				) : null}
			</div>
		</>
	);
}
