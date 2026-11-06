import { afterEach, describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { moduleNav, moduleWidgets, settingsNav } from "@app/modules";
import { ALL_MODULES } from "@app/modules/registry";
import { resetModules, useModules } from "@app/modules/testing";
import {
	CORE_SETTINGS_ITEMS,
	FEATURES_HREF,
} from "../app/(app)/[slug]/settings/settings-items";
import {
	BUILT_WIDGET_IDS,
	WIDGETS_NOT_BUILT_YET,
} from "../app/(app)/[slug]/widget-ids";
import { railItems } from "../lib/rail-items";

afterEach(resetModules);

const titles = (items: Array<{ title: string }>) =>
	items.map((item) => item.title);

/** What everyone but the developer account sees: the sidebar layout drops Features for them. */
const CLIENT_SETTINGS_ITEMS = CORE_SETTINGS_ITEMS.filter(
	(item) => item.href !== FEATURES_HREF,
);

describe("the rail", () => {
	it("is Overview, Chat and Settings with no modules, and nothing dead", () => {
		useModules([]);
		const items = railItems(moduleNav());

		expect(titles(items)).toEqual(["Overview", "Chat", "Settings"]);
		expect(items.map((item) => item.href)).toEqual(["/", "/chat", "/settings"]);
	});

	it("is exactly what it was before modules, in the same order, with crm", () => {
		useModules(["crm"]);
		const items = railItems(moduleNav());

		expect(items.map((item) => [item.title, item.href, item.match])).toEqual([
			["Overview", "/", "exact"],
			["Chat", "/chat", "prefix"],
			["Companies", "/companies", "prefix"],
			["Contacts", "/contacts", "prefix"],
			["Deals", "/deals", "prefix"],
			["Settings", "/settings", "prefix"],
		]);
		expect(items.find((item) => item.title === "Chat")?.related).toEqual([
			"/agents",
		]);
	});

	it("gives every item an icon", () => {
		useModules(["crm", "bookkeeping"]);

		for (const item of railItems(moduleNav())) {
			expect(item.icon, item.title).toBeDefined();
		}
	});
});

describe("the settings sidebar", () => {
	it("is the core pages only with no modules", () => {
		useModules([]);

		expect(titles(settingsNav(CLIENT_SETTINGS_ITEMS))).toEqual([
			"General",
			"Account",
			"Connections",
			"Currencies",
			"Members",
			"API Keys",
			"SSO",
		]);
	});

	it("is the core list with crm's tracking page after General, in order", () => {
		useModules(["crm"]);

		expect(settingsNav(CLIENT_SETTINGS_ITEMS).map((item) => item.href)).toEqual([
			"/settings",
			"/settings/tracking",
			"/settings/account",
			"/settings/connections",
			"/settings/currencies",
			"/settings/members",
			"/settings/api-keys",
			"/settings/sso",
		]);
	});
});

describe("the Features page", () => {
	it("is a core settings item that only the developer account is shown", () => {
		expect(CORE_SETTINGS_ITEMS.map((item) => item.href)).toContain(
			FEATURES_HREF,
		);
		expect(FEATURES_HREF).toBe("/settings/features");

		const layout = readFileSync(
			join(import.meta.dir, "..", "app", "(app)", "[slug]", "settings", "layout.tsx"),
			"utf8",
		);

		expect(layout).toContain("view.isDeveloper");
		expect(layout).toContain("FEATURES_HREF");
	});

	it("has a page that refuses anyone but the developer", () => {
		const page = readFileSync(
			join(
				import.meta.dir,
				"..",
				"app",
				"(app)",
				"[slug]",
				"settings",
				"features",
				"page.tsx",
			),
			"utf8",
		);

		expect(page).toContain("isDeveloper");
		expect(page).toContain("notFound()");
	});
});

describe("overview widgets", () => {
	const declared = Object.values(ALL_MODULES).flatMap((module) =>
		module.widgets.map((widget) => widget.id),
	);

	it("has a component for every declared widget, or says plainly that it has not", () => {
		for (const id of declared) {
			const built = (BUILT_WIDGET_IDS as readonly string[]).includes(id);
			const pending = WIDGETS_NOT_BUILT_YET.includes(id);

			expect(built || pending, `${id} has no component and is not listed`).toBe(
				true,
			);
			expect(built && pending, `${id} is both built and pending`).toBe(false);
		}
	});

	it("does not keep a component or a pending note for a widget nobody declares", () => {
		for (const id of [...BUILT_WIDGET_IDS, ...WIDGETS_NOT_BUILT_YET]) {
			expect(declared, id).toContain(id);
		}
	});

	it("shows nothing with no modules and only crm's widget with crm", () => {
		useModules([]);
		expect(moduleWidgets("overview")).toEqual([]);

		useModules(["crm"]);
		expect(moduleWidgets("overview").map((widget) => widget.id)).toEqual([
			"crm.sales",
		]);
	});
});

describe("module routes answer 404 when their module is off", () => {
	const APP = join(import.meta.dir, "..", "app", "(app)", "[slug]");

	/** Every page a module puts in the rail or the settings sidebar needs a layout that requires the module. */
	for (const module of Object.values(ALL_MODULES)) {
		const hrefs = [
			...module.nav.map((item) => item.href),
			...module.settings.map((item) => item.href),
		];

		for (const href of hrefs) {
			it(`${href} is gated by requireModule("${module.id}")`, () => {
				const layout = join(
					APP,
					...href.split("/").filter(Boolean),
					"layout.tsx",
				);

				expect(existsSync(layout), `${layout} is missing`).toBe(true);
				const source = readFileSync(layout, "utf8");

				// Either the gate component (asks the API which modules are on right
				// now) or the older direct check.
				expect(
					source.includes(`<ModuleGate id="${module.id}">`) ||
						source.includes(`requireModule("${module.id}")`),
					`${layout} does not gate on "${module.id}"`,
				).toBe(true);
			});
		}
	}
});
