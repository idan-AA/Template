import type { z } from "zod";
import {
	orderModules,
	type ResolvedClient,
	resolveClient,
} from "./client-config";
import type {
	ModuleDefinition,
	NavItem,
	SettingsItem,
	WidgetDeclaration,
	WidgetSlot,
} from "./define-module";
import { type ALL_MODULES, MODULE_IDS, type ModuleId } from "./registry";
import { CORE_ROLE_LABELS, CORE_ROLES } from "./roles";

/**
 * What is switched on in THIS deploy. Server code only: it reads `CLIENT_ID`
 * and `ENABLED_MODULES` from the environment. Browser code never imports this;
 * the server hands it plain data instead (nav items, role options).
 */

let current: ResolvedClient | null = null;

/**
 * The modules switched on right now, when something has told this process
 * (see `state.ts`). Null means nothing has: the client config decides, exactly
 * as it did before module switches could change at runtime.
 */
let effective: readonly ModuleDefinition[] | null = null;

/** The client for this process, resolved once and then kept. Throws on a bad config. */
export function activeClient(): ResolvedClient {
	current ??= resolveClient(process.env);
	return current;
}

/** Test seam, used through `@app/modules/testing`. Pass null to forget the client. */
export function replaceActiveClient(client: ResolvedClient | null): void {
	current = client;
	effective = null;
}

/** Called by `state.ts` and the web app with the modules that are on. */
export function setEffectiveModules(ids: readonly ModuleId[]): void {
	effective = orderModules(ids);
}

/** Back to what the client config says. */
export function clearEffectiveModules(): void {
	effective = null;
}

/** Every module the template knows, dependencies first. What the developer account sees. */
export function allModules(): readonly ModuleDefinition[] {
	return orderModules(MODULE_IDS);
}

export function enabledModules(): readonly ModuleDefinition[] {
	return effective ?? activeClient().modules;
}

export function isModuleEnabled(id: ModuleId): boolean {
	return enabledModules().some((module) => module.id === id);
}

export class ModuleDisabledError extends Error {
	constructor(readonly moduleId: ModuleId) {
		super(`The "${moduleId}" module is not switched on for this deploy.`);
		this.name = "ModuleDisabledError";
	}
}

/** Throws `ModuleDisabledError` unless the module is on. App routes use the `notFound()` wrapper. */
export function requireModule(id: ModuleId): void {
	if (!isModuleEnabled(id)) throw new ModuleDisabledError(id);
}

/** The module's parsed `modules.options` block, or undefined if the client set none. */
export function moduleOptions<K extends ModuleId>(
	id: K,
): z.output<(typeof ALL_MODULES)[K]["optionsSchema"]> | undefined {
	return activeClient().config.modules.options[id];
}

/** Pass `modules` to build the view for a set other than the enabled one (the developer sees all). */
export function moduleNav(
	modules: readonly ModuleDefinition[] = enabledModules(),
): NavItem[] {
	return modules.flatMap((module) => module.nav);
}

/**
 * The settings sidebar: the core items, with each enabled module's items placed
 * after the page they name (`after`), or at the end.
 */
export function settingsNav<T extends { title: string; href: string }>(
	core: readonly T[],
	modules: readonly ModuleDefinition[] = enabledModules(),
): Array<T | SettingsItem> {
	const items: Array<T | SettingsItem> = [...core];

	for (const item of modules.flatMap((module) => module.settings)) {
		const at = item.after
			? items.findIndex((existing) => existing.href === item.after)
			: -1;

		if (at === -1) items.push(item);
		else items.splice(at + 1, 0, item);
	}

	return items;
}

export function moduleWidgets(
	slot: WidgetSlot,
	modules: readonly ModuleDefinition[] = enabledModules(),
): WidgetDeclaration[] {
	return modules.flatMap((module) =>
		module.widgets.filter((widget) => widget.slot === slot),
	);
}

/** Entities a custom field can attach to, from the enabled modules. */
export function enabledFieldEntities(): string[] {
	return enabledModules().flatMap((module) => module.fieldEntities);
}

/**
 * THE role list: the core roles plus the roles the enabled modules declare.
 * Everything that validates a role the caller is ASSIGNING reads this. A role
 * already stored on a member is never checked against it; see `can`.
 */
export function workspaceRoleIds(): string[] {
	return [
		...CORE_ROLES,
		...enabledModules().flatMap((module) =>
			module.roles.map((role) => role.id),
		),
	];
}

/** The same list with display names, for a role picker. */
export function roleOptions(): Array<{ id: string; label: string }> {
	return [
		...CORE_ROLES.map((id) => ({
			id: id as string,
			label: CORE_ROLE_LABELS[id],
		})),
		...enabledModules().flatMap((module) => module.roles),
	];
}

/**
 * Whether `role` holds the permission `key`. A key that no enabled module
 * declares is false, and so is a missing role, so a disabled module grants
 * nothing and a stored role this deploy does not know simply has no powers.
 * The service enforces this; the UI only uses it to hide controls.
 */
export function can(role: string | null | undefined, key: string): boolean {
	if (!role) return false;

	return enabledModules().some((module) => {
		if (!Object.hasOwn(module.permissions, key)) return false;
		return module.permissions[key]?.includes(role) ?? false;
	});
}
