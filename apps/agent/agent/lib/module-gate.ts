import "@app/env/load";

import { db } from "@app/db";
import { readModuleSwitches } from "@app/db/module-switches";
import { isModuleEnabled } from "@app/modules";
import type { ModuleId } from "@app/modules/registry";
import {
	ensureModuleState,
	registerModuleSwitchLoader,
} from "@app/modules/state";

/**
 * Tools that belong to a product module (the CRM record tools belong to `crm`)
 * answer "switched off" while that module is off for the workspace. The tool
 * LIST is fixed when the agent starts, so the model still sees the names; what
 * changes is what they do.
 *
 * The switches live in the database and the developer account changes them at
 * runtime, so the agent reads them the way the API does: a short-lived copy,
 * refreshed every few seconds.
 */

let registered = false;

function register(): void {
	if (registered) return;

	registered = true;
	registerModuleSwitchLoader(() => readModuleSwitches(db));
}

export class ModuleSwitchedOffError extends Error {
	constructor(readonly moduleId: ModuleId) {
		super(
			`The ${moduleId.toUpperCase()} feature is switched off for this workspace, so this tool cannot be used. Tell the person it is not available here.`,
		);
		this.name = "ModuleSwitchedOffError";
	}
}

/** Throws `ModuleSwitchedOffError` unless the module is on right now. */
export async function requireModuleOn(id: ModuleId): Promise<void> {
	register();
	await ensureModuleState();

	if (!isModuleEnabled(id)) throw new ModuleSwitchedOffError(id);
}

/** The CRM record tools call this first. */
export function requireCrm(): Promise<void> {
	return requireModuleOn("crm");
}
