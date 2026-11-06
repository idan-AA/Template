import type { ModuleId } from "@app/modules/registry";
import type { Type } from "@nestjs/common";
import { BookkeepingModule } from "../bookkeeping/bookkeeping.module";
import { QuickbooksModule } from "../quickbooks/quickbooks.module";

/**
 * The Nest modules each product module mounts, by module id. `AppModule` imports
 * EVERY entry, whatever is switched on. Nest cannot mount a module while the
 * server runs, and the developer account switches modules at runtime, so a
 * module switched on after boot must already have its procedures. What keeps a
 * switched-off module out of reach is `AuthMiddleware`: a procedure whose module
 * is off answers NOT_FOUND (see `module-gate.ts` and the module `routers` lists).
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
	quickbooks: [QuickbooksModule],
} satisfies Readonly<Record<ModuleId, readonly Type[]>>;

/** The Nest modules for these product modules, in the order given. */
export function apiModulesFor(
	ids: readonly ModuleId[],
	registry: Readonly<Record<ModuleId, readonly Type[]>> = MODULE_API,
): Type[] {
	return ids.flatMap((id) => registry[id]);
}

/** What `AppModule` adds on top of the core modules: every product module's Nest modules. */
export function allApiModules(): Type[] {
	return apiModulesFor(Object.keys(MODULE_API) as ModuleId[]);
}
