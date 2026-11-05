import { bookkeeping } from "../bookkeeping/meta";
import { crm } from "../crm/meta";
import type { ModuleDefinition } from "./define-module";

/**
 * Every module the template knows about. Adding a module means one folder under
 * `packages/modules/<id>/` and one line here. Pure data, safe in the browser.
 */
export const ALL_MODULES = { crm, bookkeeping } as const;

export type ModuleId = keyof typeof ALL_MODULES;

export const MODULE_IDS = Object.keys(ALL_MODULES) as ModuleId[];

export function isModuleId(value: string): value is ModuleId {
	return Object.hasOwn(ALL_MODULES, value);
}

export function moduleDefinition(id: ModuleId): ModuleDefinition {
	return ALL_MODULES[id];
}

for (const [key, definition] of Object.entries(ALL_MODULES)) {
	if (key !== definition.id) {
		throw new Error(
			`packages/modules/src/registry.ts lists module "${definition.id}" under the key "${key}". The key must be the module's id.`,
		);
	}

	for (const required of definition.requires) {
		if (!isModuleId(required)) {
			throw new Error(
				`Module "${definition.id}" requires "${required}", which is not a known module. Known modules: ${MODULE_IDS.join(", ")}.`,
			);
		}
	}
}
