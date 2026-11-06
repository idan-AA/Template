import { describe, expect, it } from "bun:test";
import { ClientConfigError, assertModuleSet } from "../src/define-client";
import { defineModule } from "../src/define-module";
import { ALL_MODULES, conflictsOf } from "../src/registry";
import { resolveModuleIds } from "../src/state";

/**
 * Two modules that cannot be on together (QuickBooks and the built-in Books). The
 * relation is declared on one side only and works for both.
 */

const base = {
	label: "Thing",
	nav: [],
	settings: [],
	widgets: [],
	roles: [],
	permissions: {},
	fieldEntities: [],
};

describe("declaring a conflict", () => {
	it("defaults to none", () => {
		expect(defineModule({ id: "alpha", ...base }).conflicts).toEqual([]);
	});

	it("refuses a module that conflicts with itself", () => {
		expect(() =>
			defineModule({ id: "alpha", ...base, conflicts: ["alpha"] }),
		).toThrow("cannot conflict with itself");
	});

	it("refuses a module that both requires and conflicts with another", () => {
		expect(() =>
			defineModule({
				id: "alpha",
				...base,
				requires: ["beta"],
				conflicts: ["beta"],
			}),
		).toThrow("both requires and conflicts with");
	});

	it("refuses the same conflict twice", () => {
		expect(() =>
			defineModule({ id: "alpha", ...base, conflicts: ["beta", "beta"] }),
		).toThrow("conflicts must not repeat");
	});
});

describe("the real registry", () => {
	it("makes quickbooks and bookkeeping conflict from both sides, declared on quickbooks only", () => {
		expect(ALL_MODULES.quickbooks.conflicts).toEqual(["bookkeeping"]);
		expect(ALL_MODULES.bookkeeping.conflicts).toEqual([]);

		expect(conflictsOf("quickbooks")).toEqual(["bookkeeping"]);
		expect(conflictsOf("bookkeeping")).toEqual(["quickbooks"]);
		expect(conflictsOf("crm")).toEqual([]);
	});
});

describe("refusing a set with a conflict", () => {
	const catalog = {
		alpha: { requires: [], conflicts: ["beta"] },
		beta: { requires: [] },
		gamma: { requires: [] },
	};

	it("refuses both together, whichever side declared it", () => {
		expect(() => assertModuleSet(["alpha", "beta"], "The config", catalog)).toThrow(
			ClientConfigError,
		);
		expect(() => assertModuleSet(["beta", "alpha"], "The config", catalog)).toThrow(
			"cannot be on together",
		);
	});

	it("allows either alone, and either with an unrelated module", () => {
		expect(() => assertModuleSet(["alpha", "gamma"], "The config", catalog)).not.toThrow();
		expect(() => assertModuleSet(["beta", "gamma"], "The config", catalog)).not.toThrow();
	});

	it("refuses crm, bookkeeping and quickbooks switches that leave both books on", () => {
		expect(() =>
			resolveModuleIds(["crm", "bookkeeping"], [{ moduleId: "quickbooks", enabled: true }]),
		).toThrow("cannot be on together");
	});

	it("lets Books go off and QuickBooks come on in the same set of switches", () => {
		expect(
			resolveModuleIds(
				["crm", "bookkeeping"],
				[
					{ moduleId: "bookkeeping", enabled: false },
					{ moduleId: "quickbooks", enabled: true },
				],
			).sort(),
		).toEqual(["crm", "quickbooks"]);
	});

	it("still needs crm for quickbooks", () => {
		expect(() =>
			resolveModuleIds([], [{ moduleId: "quickbooks", enabled: true }]),
		).toThrow("needs");
	});
});
