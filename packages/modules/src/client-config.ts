import { CLIENTS } from "../../../clients/registry";
import {
	assertModuleSet,
	type ClientConfig,
	ClientConfigError,
} from "./define-client";
import type { ModuleDefinition } from "./define-module";
import { ALL_MODULES, type ModuleId } from "./registry";

export const DEFAULT_CLIENT_ID = "default";

export type ResolvedClient = {
	id: string;
	config: ClientConfig;
	/** The enabled modules, with every module's `requires` ahead of it. */
	modules: readonly ModuleDefinition[];
};

type Env = Readonly<Record<string, string | undefined>>;

/**
 * Picks the client named by `CLIENT_ID` (unset means `default`), applies the
 * `ENABLED_MODULES` override if there is one, and checks the result. Throws a
 * `ClientConfigError` with a message a person can act on; callers let it
 * stop the boot.
 */
export function resolveClient(env: Env): ResolvedClient {
	const id = env.CLIENT_ID?.trim() || DEFAULT_CLIENT_ID;

	if (!Object.hasOwn(CLIENTS, id)) {
		throw new ClientConfigError(
			`CLIENT_ID is "${id}", but no client by that name is registered. Registered clients: ${Object.keys(CLIENTS).join(", ")}. A new client needs clients/${id}/client.config.ts and a line in clients/registry.ts.`,
		);
	}

	const base = CLIENTS[id] as ClientConfig;
	const override = parseOverride(env.ENABLED_MODULES);

	const enabled = override ?? base.modules.enabled;
	assertModuleSet(
		enabled,
		override ? "ENABLED_MODULES" : `clients/${id}/client.config.ts`,
	);

	const config: ClientConfig = override
		? {
				...base,
				modules: {
					enabled,
					options: Object.fromEntries(
						Object.entries(base.modules.options).filter(([key]) =>
							enabled.includes(key as ModuleId),
						),
					),
				},
			}
		: base;

	return { id, config, modules: orderModules(enabled) };
}

/** `ENABLED_MODULES=crm,bookkeeping`, or `none` for no modules. Unset or empty: no override. */
function parseOverride(value: string | undefined): string[] | null {
	const text = value?.trim();

	if (!text) return null;
	if (text.toLowerCase() === "none") return [];

	return text
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);
}

/** Every module after the modules it requires; otherwise the order it was listed in. */
export function orderModules(enabled: readonly ModuleId[]): ModuleDefinition[] {
	const ordered: ModuleDefinition[] = [];
	const placed = new Set<ModuleId>();

	const place = (id: ModuleId) => {
		if (placed.has(id)) return;
		placed.add(id);

		for (const required of ALL_MODULES[id].requires) {
			place(required as ModuleId);
		}

		ordered.push(ALL_MODULES[id]);
	};

	for (const id of enabled) place(id);

	return ordered;
}
