import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CLIENTS } from "../../../clients/registry";
import { resolveClient } from "../src/client-config";
import {
	assertModuleSet,
	ClientConfigError,
	defineClient,
} from "../src/define-client";

const CLIENTS_DIR = join(import.meta.dir, "..", "..", "..", "clients");

const valid = {
	brand: {
		name: "Acme",
		shortName: "Acme",
		logo: "brand/logo.svg",
		favicon: "brand/favicon.svg",
		primaryColor: "#112233",
		supportEmail: "help@acme.test",
		emailFromName: "Acme",
		domain: "acme.test",
	},
	locale: { currency: "USD", timezone: "America/New_York" },
} as const;

describe("defineClient", () => {
	it("takes a plain list of modules and normalises it", () => {
		const config = defineClient({ ...valid, modules: ["crm"] });

		expect(config.modules).toEqual({ enabled: ["crm"], options: {} });
		expect(config.features).toEqual({ telemetry: false, landing: false });
	});

	it("takes { enabled, options } too", () => {
		const config = defineClient({
			...valid,
			modules: { enabled: ["bookkeeping"], options: { bookkeeping: {} } },
		});

		expect(config.modules.enabled).toEqual(["bookkeeping"]);
		expect(config.modules.options).toEqual({ bookkeeping: {} });
	});

	it("names the unknown module and lists the real ones", () => {
		expect(() =>
			// @ts-expect-error a typo is a type error as well as a boot error
			defineClient({ ...valid, modules: ["salon"] }),
		).toThrow(
			/module "salon", which does not exist\. Known modules: crm, bookkeeping/,
		);
	});

	it("rejects options for a module that is not switched on, and unknown option keys", () => {
		expect(() =>
			defineClient({
				...valid,
				modules: { enabled: [], options: { crm: {} } },
			}),
		).toThrow('"crm" is not in the enabled list');
		expect(() =>
			defineClient({
				...valid,
				modules: {
					enabled: ["crm"],
					// @ts-expect-error crm declares no options
					options: { crm: { colour: "red" } },
				},
			}),
		).toThrow("modules.options.crm is not valid");
	});

	it("explains a bad brand colour, time zone or currency", () => {
		expect(() =>
			defineClient({
				...valid,
				modules: [],
				brand: { ...valid.brand, primaryColor: "green" },
			}),
		).toThrow("brand.primaryColor");
		expect(() =>
			defineClient({
				...valid,
				modules: [],
				locale: { currency: "usd", timezone: "Mars/Base" },
			}),
		).toThrow(/locale\.currency[\s\S]*locale\.timezone/);
	});
});

describe("assertModuleSet", () => {
	const catalog = {
		books: { requires: [] },
		invoices: { requires: ["books"] },
	};

	it("fails boot when a module's requires is not switched on", () => {
		expect(() => assertModuleSet(["invoices"], "the config", catalog)).toThrow(
			'turns on "invoices", which needs "books"',
		);
	});

	it("passes when the requirement is on, in either order", () => {
		expect(() =>
			assertModuleSet(["invoices", "books"], "the config", catalog),
		).not.toThrow();
	});

	it("throws a ClientConfigError, so a caller can tell it from a crash", () => {
		expect(() => assertModuleSet(["nope"], "the config", catalog)).toThrow(
			ClientConfigError,
		);
	});
});

describe("resolveClient", () => {
	it("boots the default client, with no modules, when CLIENT_ID is unset", () => {
		const client = resolveClient({});

		expect(client.id).toBe("default");
		expect(client.modules).toEqual([]);
	});

	it("treats a blank CLIENT_ID as unset", () => {
		expect(resolveClient({ CLIENT_ID: "  " }).id).toBe("default");
	});

	it("says what is registered when CLIENT_ID names a client that is not", () => {
		expect(() => resolveClient({ CLIENT_ID: "ghost" })).toThrow(
			/no client by that name is registered\. Registered clients: default\. A new client needs clients\/ghost\/client\.config\.ts and a line in clients\/registry\.ts/,
		);
	});

	it("does not mistake a prototype key for a client", () => {
		expect(() => resolveClient({ CLIENT_ID: "__proto__" })).toThrow(
			ClientConfigError,
		);
		expect(() => resolveClient({ CLIENT_ID: "constructor" })).toThrow(
			ClientConfigError,
		);
	});

	it("lets ENABLED_MODULES override the config, and 'none' mean none", () => {
		expect(
			resolveClient({ ENABLED_MODULES: "bookkeeping, crm" }).modules.map(
				(m) => m.id,
			),
		).toEqual(["bookkeeping", "crm"]);
		expect(resolveClient({ ENABLED_MODULES: "none" }).modules).toEqual([]);
		expect(resolveClient({ ENABLED_MODULES: "" }).modules).toEqual([]);
	});

	it("fails boot, with a message, on an unknown module in ENABLED_MODULES", () => {
		expect(() => resolveClient({ ENABLED_MODULES: "crm,salon" })).toThrow(
			/ENABLED_MODULES turns on the module "salon"/,
		);
	});
});

describe("the clients folder", () => {
	const folders = readdirSync(CLIENTS_DIR).filter(
		(name) =>
			statSync(join(CLIENTS_DIR, name)).isDirectory() &&
			name !== "node_modules" &&
			existsSync(join(CLIENTS_DIR, name, "client.config.ts")),
	);

	it("registers every client folder, and only real ones", () => {
		expect(Object.keys(CLIENTS).sort()).toEqual([...folders].sort());
	});

	it("has the logo and favicon each client's config points at", () => {
		for (const [id, config] of Object.entries(CLIENTS)) {
			for (const file of [config.brand.logo, config.brand.favicon]) {
				expect(
					existsSync(join(CLIENTS_DIR, id, file)),
					`clients/${id}/${file}`,
				).toBe(true);
			}
		}
	});

	it("ships a default client with no modules", () => {
		expect(CLIENTS.default?.modules.enabled).toEqual([]);
	});
});
