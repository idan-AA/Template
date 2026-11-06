import { bookkeeping } from "../bookkeeping/meta";
import { crm } from "../crm/meta";
import { quickbooks } from "../quickbooks/meta";
import type { ModuleDefinition } from "./define-module";

/**
 * Every module the template knows about. Adding a module means one folder under
 * `packages/modules/<id>/` and one line here. Pure data, safe in the browser.
 */
export const ALL_MODULES = { crm, bookkeeping, quickbooks } as const;

export type ModuleId = keyof typeof ALL_MODULES;

export const MODULE_IDS = Object.keys(ALL_MODULES) as ModuleId[];

export function isModuleId(value: string): value is ModuleId {
	return Object.hasOwn(ALL_MODULES, value);
}

/**
 * The modules that cannot be on together with `id`. Symmetric: a conflict
 * declared on either module counts for both, so one module can refuse another
 * without that other module's meta.ts being edited.
 */
export function conflictsOf(id: ModuleId): ModuleId[] {
	return MODULE_IDS.filter(
		(other) =>
			other !== id &&
			(ALL_MODULES[id].conflicts.includes(other) ||
				ALL_MODULES[other].conflicts.includes(id)),
	);
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

	for (const other of definition.conflicts) {
		if (!isModuleId(other)) {
			throw new Error(
				`Module "${definition.id}" conflicts with "${other}", which is not a known module. Known modules: ${MODULE_IDS.join(", ")}.`,
			);
		}
	}
}
