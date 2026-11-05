export type SettingsNavItem = {
	title: string;
	href: string;
};

export const ROOT = "/settings";

export const CORE_SETTINGS_ITEMS: SettingsNavItem[] = [
	{ title: "General", href: ROOT },
	{ title: "Account", href: `${ROOT}/account` },
	{ title: "Connections", href: `${ROOT}/connections` },
	{ title: "Currencies", href: `${ROOT}/currencies` },
	{ title: "Members", href: `${ROOT}/members` },
	{ title: "API Keys", href: `${ROOT}/api-keys` },
	{ title: "SSO", href: `${ROOT}/sso` },
];
