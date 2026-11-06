import { enabledModules } from "@app/modules";
import type { ModuleId } from "@app/modules/registry";
import type { Type } from "@nestjs/common";
import { BookkeepingModule } from "../bookkeeping/bookkeeping.module";

/**
 * The Nest modules each product module mounts, by module id. `AppModule` imports
 * the entries of the modules that are switched on, so a disabled module's
 * routers and controllers are never registered: its procedures do not exist, and
 * its routes answer 404.
 *
 * `crm` is empty on purpose. The CRM's Nest modules are still imported directly
 * by core ones (ArchiveModule, SettingsModule and the scheduler reach into
 * CompaniesModule, ContactsModule, DealsModule and SyncModule), so they cannot be
 * left out yet. Moving them behind this list is the work of moving the CRM
 * behind its module; until then the CRM API is always mounted.
 */
export const MODULE_API = {
	crm: [],
	bookkeeping: [BookkeepingModule],
} satisfies Readonly<Record<ModuleId, readonly Type[]>>;

/** The Nest modules for these product modules, in the order given. */
export function apiModulesFor(
	ids: readonly ModuleId[],
	registry: Readonly<Record<ModuleId, readonly Type[]>> = MODULE_API,
): Type[] {
	return ids.flatMap((id) => registry[id]);
}

/** What `AppModule` adds on top of the core modules for this deploy. */
export function enabledApiModules(): Type[] {
	return apiModulesFor(enabledModules().map((module) => module.id as ModuleId));
}
