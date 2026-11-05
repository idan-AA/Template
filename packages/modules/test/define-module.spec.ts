import { describe, expect, it } from "bun:test";
import { defineModule } from "../src/define-module";

const base = { id: "demo", label: "Demo" } as const;

describe("defineModule", () => {
	it("fills in empty lists so a module can declare only what it has", () => {
		const module = defineModule(base);

		expect(module.nav).toEqual([]);
		expect(module.permissions).toEqual({});
		expect(module.requires).toEqual([]);
	});

	it("rejects a permission key that does not start with the module id", () => {
		expect(() =>
			defineModule({ ...base, permissions: { "other.read": ["owner"] } }),
		).toThrow('permission "other.read" must start with "demo."');
	});

	it("rejects a permission that names a role nobody declared", () => {
		expect(() =>
			defineModule({ ...base, permissions: { "demo.read": ["clerk"] } }),
		).toThrow('names role "clerk"');
	});

	it("accepts a permission for a role the module declares itself", () => {
		const module = defineModule({
			...base,
			roles: [{ id: "clerk", label: "Clerk" }],
			permissions: { "demo.read": ["owner", "clerk"] },
		});

		expect(module.permissions["demo.read"]).toEqual(["owner", "clerk"]);
	});

	it("will not let a module redeclare a core role", () => {
		expect(() =>
			defineModule({ ...base, roles: [{ id: "admin", label: "Admin" }] }),
		).toThrow("core role");
	});

	it("requires a widget id to carry the module id", () => {
		expect(() =>
			defineModule({
				...base,
				widgets: [{ id: "other.card", slot: "overview" }],
			}),
		).toThrow('widget "other.card" must start with "demo."');
	});

	it("rejects a module that requires itself, and repeated nav paths", () => {
		expect(() => defineModule({ ...base, requires: ["demo"] })).toThrow(
			"cannot require itself",
		);
		expect(() =>
			defineModule({
				...base,
				nav: [
					{ title: "A", href: "/a", icon: "company", match: "prefix" },
					{ title: "B", href: "/a", icon: "deal", match: "prefix" },
				],
			}),
		).toThrow("nav hrefs must not repeat");
	});
});
