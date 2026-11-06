import { afterEach, describe, expect, it } from "bun:test";
import { ALL_MODULES, MODULE_IDS } from "../src/registry";
import { isModuleEnabled } from "../src/runtime";
import {
	applyModuleSwitches,
	ensureModuleState,
	refreshModuleState,
	registerModuleSwitchLoader,
	resolveModuleIds,
} from "../src/state";
import { resetModules, useModules } from "../src/testing";

afterEach(() => {
	delete process.env.ENABLED_MODULES;
	resetModules();
});

describe("resolving the modules that are on", () => {
	it("is the client config's list when nothing has been switched", () => {
		expect(resolveModuleIds(["crm"], [])).toEqual(["crm"]);
	});

	it("lets a switch turn a module off and another on", () => {
		expect(
			resolveModuleIds(
				["crm"],
				[
					{ moduleId: "crm", enabled: false },
					{ moduleId: "bookkeeping", enabled: true },
				],
			),
		).toEqual(["bookkeeping"]);
	});

	it("ignores a switch for a module this build does not know", () => {
		expect(
			resolveModuleIds(["crm"], [{ moduleId: "salon", enabled: true }]),
		).toEqual(["crm"]);
	});
});

describe("applying switches to this process", () => {
	it("changes what the runtime says is enabled, with no redeploy", () => {
		useModules(["crm"]);
		expect(isModuleEnabled("crm")).toBe(true);

		applyModuleSwitches([{ moduleId: "crm", enabled: false }]);
		expect(isModuleEnabled("crm")).toBe(false);

		applyModuleSwitches([]);
		expect(isModuleEnabled("crm")).toBe(true);
	});

	it("goes back to the starting set after resetModules", () => {
		useModules(["crm"]);
		applyModuleSwitches([{ moduleId: "crm", enabled: false }]);
		resetModules();
		useModules(["crm"]);

		expect(isModuleEnabled("crm")).toBe(true);
	});
});

describe("refreshing from the loader", () => {
	it("reads the loader and applies it", async () => {
		useModules(["crm"]);
		registerModuleSwitchLoader(async () => [
			{ moduleId: "crm", enabled: false },
		]);

		await refreshModuleState();

		expect(isModuleEnabled("crm")).toBe(false);
	});

	it("keeps the last good answer when the loader fails", async () => {
		useModules(["crm"]);
		registerModuleSwitchLoader(async () => [
			{ moduleId: "crm", enabled: false },
		]);
		await refreshModuleState();

		registerModuleSwitchLoader(async () => {
			throw new Error("database is down");
		});
		await refreshModuleState();

		expect(isModuleEnabled("crm")).toBe(false);
	});

	it("does not read again inside the TTL", async () => {
		useModules(["crm"]);
		let reads = 0;
		registerModuleSwitchLoader(async () => {
			reads += 1;
			return [];
		});

		await ensureModuleState(60_000);
		await ensureModuleState(60_000);

		expect(reads).toBe(1);
	});

	it("lets ENABLED_MODULES beat the database", async () => {
		process.env.ENABLED_MODULES = "crm";
		useModules(["crm"]);
		registerModuleSwitchLoader(async () => [
			{ moduleId: "crm", enabled: false },
		]);

		await refreshModuleState();

		expect(isModuleEnabled("crm")).toBe(true);
	});
});

describe("what a module declares for the switches", () => {
	it("claims every router alias in at most one module", () => {
		const owner = new Map<string, string>();

		for (const id of MODULE_IDS) {
			for (const alias of ALL_MODULES[id].routers) {
				expect(owner.get(alias), `"${alias}" is claimed twice`).toBeUndefined();
				owner.set(alias, id);
			}
		}
	});

	it("lets a module declare no routers yet", () => {
		expect(Array.isArray(ALL_MODULES.bookkeeping.routers)).toBe(true);
	});

	it("gives the CRM a plain-language description for the Features page", () => {
		expect(ALL_MODULES.crm.description?.length ?? 0).toBeGreaterThan(10);
		expect(ALL_MODULES.crm.routers).toContain("companies");
	});
});
