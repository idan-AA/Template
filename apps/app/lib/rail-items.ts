import type { NavItem } from "@app/modules/define-module";
import type { CarbonIcon } from "@app/ui/components/icon";
import Bot from "@app/ui/components/icons/bot";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Settings from "@carbon/icons-react/es/Settings";
import { NAV_ICONS } from "@/lib/nav-icons";

export type RailItem = {
	title: string;
	href: string;
	icon: CarbonIcon;
	iconClassName?: string;
	match: "exact" | "prefix";
	related?: string[];
};

const BEFORE_MODULES: RailItem[] = [
	{ title: "Overview", href: "/", icon: Dashboard, match: "exact" },
	{
		title: "Chat",
		href: "/chat",
		icon: Bot,
		iconClassName: "size-5",
		match: "prefix",
		related: ["/agents"],
	},
];

const AFTER_MODULES: RailItem[] = [
	{ title: "Settings", href: "/settings", icon: Settings, match: "prefix" },
];

/** Core items, then whatever the enabled modules add, then Settings. */
export function railItems(moduleItems: readonly NavItem[]): RailItem[] {
	return [
		...BEFORE_MODULES,
		...moduleItems.map(
			(item): RailItem => ({
				title: item.title,
				href: item.href,
				icon: NAV_ICONS[item.icon],
				match: item.match,
				related: item.related,
			}),
		),
		...AFTER_MODULES,
	];
}
