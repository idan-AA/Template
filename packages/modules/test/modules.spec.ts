import { describe, expect, it } from "bun:test";
import { FieldEntity } from "@app/db/enums";
import { ALL_MODULES, MODULE_IDS } from "../src/registry";
import { CORE_ROLES } from "../src/roles";

describe("the registry", () => {
	it("keys every module by its own id", () => {
		for (const [key, module] of Object.entries(ALL_MODULES)) {
			expect(module.id as string).toBe(key);
		}
		expect(MODULE_IDS).toEqual(["crm", "bookkeeping", "quickbooks"]);
	});
});

describe("crm", () => {
	const { crm } = ALL_MODULES;

	it("owns the three entities a custom field can attach to today", () => {
		expect([...crm.fieldEntities].sort()).toEqual(
			Object.values(FieldEntity).sort(),
		);
	});

	it("keeps the rail items in the order the app has always shown them", () => {
		expect(crm.nav.map((item) => item.href)).toEqual([
			"/companies",
			"/contacts",
			"/deals",
		]);
	});

	it("declares no roles of its own and lets every core role read and write", () => {
		expect(crm.roles).toEqual([]);
		expect(crm.permissions["crm.read"]).toEqual([...CORE_ROLES]);
		expect(crm.permissions["crm.write"]).toEqual([...CORE_ROLES]);
	});
});

/**
 * Typed out from docs/plan/bookkeeping.md section 8. If this table and the
 * module drift apart, the bookkeeping build is coding against the wrong thing.
 */
const BOOKKEEPING_MATRIX = {
	"bookkeeping.read": {
		owner: 1,
		admin: 1,
		bookkeeper: 1,
		accountant: 1,
		member: 1,
	},
	"bookkeeping.write": {
		owner: 1,
		admin: 1,
		bookkeeper: 1,
		accountant: 1,
		member: 1,
	},
	"bookkeeping.post": {
		owner: 1,
		admin: 1,
		bookkeeper: 1,
		accountant: 1,
		member: 0,
	},
	"bookkeeping.bank": {
		owner: 1,
		admin: 1,
		bookkeeper: 1,
		accountant: 1,
		member: 0,
	},
	"bookkeeping.reports": {
		owner: 1,
		admin: 1,
		bookkeeper: 1,
		accountant: 1,
		member: 0,
	},
	"bookkeeping.settings": {
		owner: 1,
		admin: 1,
		bookkeeper: 0,
		accountant: 1,
		member: 0,
	},
	"bookkeeping.lock": {
		owner: 1,
		admin: 1,
		bookkeeper: 0,
		accountant: 1,
		member: 0,
	},
	"bookkeeping.reopen": {
		owner: 1,
		admin: 0,
		bookkeeper: 0,
		accountant: 0,
		member: 0,
	},
} as const;

describe("bookkeeping", () => {
	const { bookkeeping } = ALL_MODULES;

	it("is called Books, needs nothing, and adds the two roles", () => {
		expect(bookkeeping.label).toBe("Books");
		expect(bookkeeping.requires).toEqual([]);
		expect(bookkeeping.roles.map((role) => role.id)).toEqual([
			"bookkeeper",
			"accountant",
		]);
	});

	it("has exactly the eight permission keys of section 8", () => {
		expect(Object.keys(bookkeeping.permissions).sort()).toEqual(
			Object.keys(BOOKKEEPING_MATRIX).sort(),
		);
	});

	it("grants each key to exactly the roles in the table", () => {
		const roles = ["owner", "admin", "bookkeeper", "accountant", "member"];

		for (const [key, row] of Object.entries(BOOKKEEPING_MATRIX)) {
			const granted = bookkeeping.permissions[key] ?? [];

			for (const role of roles) {
				expect(granted.includes(role), `${key} for ${role}`).toBe(
					row[role as keyof typeof row] === 1,
				);
			}
		}
	});
});
