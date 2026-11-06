import { ALL_MODULES, MODULE_IDS, type ModuleId } from "@app/modules/registry";

/**
 * The product module that owns a tRPC procedure, from its router alias
 * (`companies` in `companies.list`), or null for a core router that every
 * deploy has. Each module lists its routers in `meta.ts`.
 */
export function moduleOwningProcedure(path: string): ModuleId | null {
	const alias = path.split(".")[0] ?? "";

	for (const id of MODULE_IDS) {
		if (ALL_MODULES[id].routers.includes(alias)) return id;
	}

	return null;
}
