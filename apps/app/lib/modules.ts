import "server-only";

import {
	isModuleEnabled,
	moduleNav,
	moduleWidgets,
	settingsNav,
} from "@app/modules";
import type { NavItem } from "@app/modules/define-module";
import type { ModuleId } from "@app/modules/registry";
import { notFound } from "next/navigation";

/** A route inside a module that is switched off does not exist: 404. */
export function requireModule(id: ModuleId): void {
	if (!isModuleEnabled(id)) notFound();
}

/** Plain data for the client nav components; icons are looked up by key over there. */
export function enabledNav(): NavItem[] {
	return moduleNav();
}

export function enabledSettingsNav<T extends { title: string; href: string }>(
	core: readonly T[],
) {
	return settingsNav(core);
}

export function enabledOverviewWidgets() {
	return moduleWidgets("overview");
}

export function isCrmEnabled(): boolean {
	return isModuleEnabled("crm");
}
