import "server-only";

import {
	allModules,
	enabledModules,
	isModuleEnabled,
	moduleNav,
	moduleWidgets,
	setEffectiveModules,
	settingsNav,
} from "@app/modules";
import type {
	ModuleDefinition,
	NavItem,
} from "@app/modules/define-module";
import { isModuleId, type ModuleId } from "@app/modules/registry";
import { cookies } from "next/headers";
import { notFound, unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { getServerTrpcClient } from "@/lib/trpc/server";

/**
 * The cookie the developer account sets to look at the product as a client
 * would. It only changes what the developer's own pages show; the API never
 * reads it.
 */
export const PREVIEW_COOKIE = "preview-as-client";

export type ModuleView = {
	/** The modules this person's pages are built from. */
	modules: readonly ModuleDefinition[];
	/** The modules switched on for the client. */
	enabled: readonly ModuleId[];
	isDeveloper: boolean;
	/** The developer is looking at the product as a client would. */
	previewing: boolean;
};

/**
 * Which modules this request sees. The API holds the switches (the developer
 * changes them at runtime), so the web app asks it once per request and hands
 * the answer to the module runtime, which the synchronous helpers below read.
 * The developer account sees every module, unless it chose to preview as a
 * client. If the API cannot be reached the last answer stands: a blip must not
 * hide or reveal anything.
 *
 * Call it only where the request is already dynamic (after `connection()`, or
 * inside a Suspense boundary).
 */
export const getModuleView = cache(async (): Promise<ModuleView> => {
	let isDeveloper = false;

	try {
		const state = await getServerTrpcClient().modules.state.query();
		setEffectiveModules(state.enabled.filter(isModuleId));
		isDeveloper = state.isDeveloper;
	} catch (error) {
		unstable_rethrow(error);
		console.error(
			`[modules] could not ask the API which modules are on, using the last answer: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	const enabled = enabledModules();
	const previewing =
		isDeveloper && (await cookies()).get(PREVIEW_COOKIE)?.value === "1";

	return {
		modules: isDeveloper && !previewing ? allModules() : enabled,
		enabled: enabled.map((module) => module.id as ModuleId),
		isDeveloper,
		previewing,
	};
});

/** A route inside a module that is not available to this person does not exist: 404. */
export async function requireModuleOn(id: ModuleId): Promise<void> {
	const view = await getModuleView();

	if (!view.modules.some((module) => module.id === id)) notFound();
}

/**
 * The same check against the answer this process already holds, without asking
 * the API. Only for a page that cannot wait (a layout should use `ModuleGate`).
 */
export function requireModule(id: ModuleId): void {
	if (!isModuleEnabled(id)) notFound();
}

/** Plain data for the client nav components; icons are looked up by key over there. */
export function enabledNav(modules?: readonly ModuleDefinition[]): NavItem[] {
	return moduleNav(modules);
}

export function enabledSettingsNav<T extends { title: string; href: string }>(
	core: readonly T[],
	modules?: readonly ModuleDefinition[],
) {
	return settingsNav(core, modules);
}

export function enabledOverviewWidgets(modules?: readonly ModuleDefinition[]) {
	return moduleWidgets("overview", modules);
}

export function isCrmEnabled(): boolean {
	return isModuleEnabled("crm");
}
