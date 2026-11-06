import { afterEach, describe, expect, it } from "bun:test";
import {
	can,
	enabledFieldEntities,
	enabledModules,
	isModuleEnabled,
	ModuleDisabledError,
	moduleNav,
	moduleWidgets,
	requireModule,
	roleOptions,
	settingsNav,
	workspaceRoleIds,
} from "../src/runtime";
import { resetModules, useModules } from "../src/testing";

afterEach(resetModules);

describe("with no modules", () => {
	it("has nothing switched on and nothing to show", () => {
		useModules([]);

		expect(enabledModules()).toEqual([]);
		expect(isModuleEnabled("crm")).toBe(false);
		expect(moduleNav()).toEqual([]);
		expect(moduleWidgets("overview")).toEqual([]);
		expect(enabledFieldEntities()).toEqual([]);
	});

	it("requireModule refuses, with the module named", () => {
		useModules([]);

		expect(() => requireModule("crm")).toThrow(ModuleDisabledError);
		expect(() => requireModule("crm")).toThrow(
			'"crm" module is not switched on',
		);
	});

	it("leaves the settings sidebar as the core items alone", () => {
		useModules([]);
		const core = [{ title: "General", href: "/settings" }];

		expect(settingsNav(core)).toEqual(core);
	});
});

describe("with crm", () => {
	it("adds the three rail items, the widget and the field entities", () => {
		useModules(["crm"]);

		expect(isModuleEnabled("crm")).toBe(true);
		expect(() => requireModule("crm")).not.toThrow();
		expect(moduleNav().map((item) => item.title)).toEqual([
			"Companies",
			"Contacts",
			"Deals",
		]);
		expect(moduleWidgets("overview").map((widget) => widget.id)).toEqual([
			"crm.sales",
		]);
		expect(enabledFieldEntities()).toEqual(["COMPANY", "CONTACT", "DEAL"]);
	});

	it("puts Tracking & Analytics straight after General, where it has always been", () => {
		useModules(["crm"]);
		const core = [
			{ title: "General", href: "/settings" },
			{ title: "Connections", href: "/settings/connections" },
		];

		expect(settingsNav(core).map((item) => item.title)).toEqual([
			"General",
			"Tracking & Analytics",
			"Connections",
		]);
	});

	it("does not touch the other module's nav when both are on", () => {
		useModules(["crm", "bookkeeping"]);

		expect(moduleNav().map((item) => item.href)).toEqual([
			"/companies",
			"/contacts",
			"/deals",
			"/books",
		]);
		expect(moduleWidgets("overview").map((widget) => widget.id)).toEqual([
			"crm.sales",
			"bookkeeping.overview",
		]);
	});
});

describe("the one role list", () => {
	it("is the three core roles when no module adds any", () => {
		useModules(["crm"]);

		expect(workspaceRoleIds()).toEqual(["owner", "admin", "member"]);
	});

	it("gains bookkeeper and accountant with bookkeeping on, in the picker too", () => {
		useModules(["bookkeeping"]);

		expect(workspaceRoleIds()).toEqual([
			"owner",
			"admin",
			"member",
			"bookkeeper",
			"accountant",
		]);
		expect(roleOptions()).toEqual([
			{ id: "owner", label: "Owner" },
			{ id: "admin", label: "Admin" },
			{ id: "member", label: "Member" },
			{ id: "bookkeeper", label: "Bookkeeper" },
			{ id: "accountant", label: "Accountant" },
		]);
	});
});

describe("can", () => {
	it("answers from the enabled module's permissions", () => {
		useModules(["bookkeeping"]);

		expect(can("accountant", "bookkeeping.settings")).toBe(true);
		expect(can("bookkeeper", "bookkeeping.settings")).toBe(false);
		expect(can("member", "bookkeeping.post")).toBe(false);
		expect(can("owner", "bookkeeping.reopen")).toBe(true);
		expect(can("admin", "bookkeeping.reopen")).toBe(false);
	});

	it("is false for a key whose module is off, for every role", () => {
		useModules(["crm"]);

		for (const role of [
			"owner",
			"admin",
			"member",
			"bookkeeper",
			"accountant",
		]) {
			expect(can(role, "bookkeeping.read")).toBe(false);
		}
	});

	it("gives a stored bookkeeper no powers, and no error, when bookkeeping is off", () => {
		useModules(["crm"]);

		expect(can("bookkeeper", "bookkeeping.read")).toBe(false);
		expect(can("bookkeeper", "crm.read")).toBe(false);
	});

	it("is false for a missing role, an unknown key and a prototype key", () => {
		useModules(["crm", "bookkeeping"]);

		expect(can(null, "crm.read")).toBe(false);
		expect(can(undefined, "crm.read")).toBe(false);
		expect(can("owner", "crm.nothing")).toBe(false);
		expect(can("owner", "constructor")).toBe(false);
		expect(can("owner", "__proto__")).toBe(false);
	});
});
