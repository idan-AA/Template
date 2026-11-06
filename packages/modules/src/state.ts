import { assertModuleSet } from "./define-client";
import { isModuleId, type ModuleId } from "./registry";
import {
	activeClient,
	clearEffectiveModules,
	setEffectiveModules,
} from "./runtime";

/**
 * Runtime module switches. The client config (`clients/<id>/client.config.ts`)
 * is the STARTING set; rows in the `moduleSwitch` table, written by the
 * developer account, turn modules on or off on top of it with no redeploy.
 *
 * Server code only. Each process (the API, the agent) keeps its own copy of the
 * answer and re-reads it every few seconds, so a switch reaches every process
 * quickly without a query per request. The web app does not poll: it asks the
 * API once per request and hands the answer to `setEffectiveModules`.
 */

/** One explicit switch, as stored. */
export type ModuleSwitchInput = {
	moduleId: string;
	enabled: boolean;
};

export type ModuleSwitchLoader = () => Promise<readonly ModuleSwitchInput[]>;

export const MODULE_STATE_TTL_MS = 5_000;

let loader: ModuleSwitchLoader | null = null;
let loadedAt = 0;
let inflight: Promise<void> | null = null;

/** Where this process reads switches from. The API and the agent register a database loader. */
export function registerModuleSwitchLoader(next: ModuleSwitchLoader): void {
	loader = next;
	loadedAt = 0;
}

/** `ENABLED_MODULES` is a hard override for local testing: it beats the database. */
function pinnedByEnvironment(): boolean {
	return Boolean(process.env.ENABLED_MODULES?.trim());
}

/**
 * The module ids that are on: the client config's list, with each known
 * switch applied. Throws a `ClientConfigError` if the result breaks a
 * `requires` (the caller refuses the write, or keeps the last good answer).
 */
export function resolveModuleIds(
	base: readonly ModuleId[],
	switches: readonly ModuleSwitchInput[],
): ModuleId[] {
	const on = new Set<ModuleId>(base);

	for (const entry of switches) {
		// A row for a module this build no longer knows is ignored, not fatal.
		if (!isModuleId(entry.moduleId)) continue;

		if (entry.enabled) on.add(entry.moduleId);
		else on.delete(entry.moduleId);
	}

	const ids = [...on];
	assertModuleSet(ids, "The module switches");

	return ids;
}

/** The set the client config alone gives (no switches). */
export function startingModuleIds(): ModuleId[] {
	return [...activeClient().config.modules.enabled];
}

/** Applies switches to this process now. Throws if they break a `requires`. */
export function applyModuleSwitches(
	switches: readonly ModuleSwitchInput[],
): ModuleId[] {
	const ids = resolveModuleIds(startingModuleIds(), switches);

	setEffectiveModules(ids);
	loadedAt = Date.now();

	return ids;
}

/**
 * Re-reads the switches from the registered loader. A failure keeps the last
 * good answer and logs: a database blip must not switch modules off or crash a
 * request.
 */
export async function refreshModuleState(): Promise<void> {
	if (!loader || pinnedByEnvironment()) return;

	try {
		applyModuleSwitches(await loader());
	} catch (error) {
		console.error(
			`[modules] could not read the module switches, keeping the last answer: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		// Do not retry on every request while the database is down.
		loadedAt = Date.now();
	}
}

/** Refreshes only if the last answer is older than the TTL. Concurrent callers share one read. */
export async function ensureModuleState(
	ttlMs: number = MODULE_STATE_TTL_MS,
): Promise<void> {
	if (!loader || pinnedByEnvironment()) return;
	if (Date.now() - loadedAt < ttlMs) return;

	inflight ??= refreshModuleState().finally(() => {
		inflight = null;
	});

	await inflight;
}

/** Test seam: forget the loader and go back to the client config. */
export function resetModuleState(): void {
	loader = null;
	loadedAt = 0;
	inflight = null;
	clearEffectiveModules();
}
