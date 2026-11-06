import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_MODULES, MODULE_IDS } from "@app/modules/registry";
import { moduleOwningProcedure } from "../src/modules/module-gate";

/** Routers every deploy has, whatever modules are on. A new router must be added here or to a module's `routers`. */
const CORE_ROUTERS = new Set([
	"account",
	"agents",
	"apiKeys",
	"conversations",
	"currency",
	"dashboard",
	"fields",
	"google",
	"mcp",
	"microsoft",
	"modules",
	"search",
	"settings",
	"slack",
	"sso",
	"users",
	"workspace",
]);

function routerAliases(dir: string): string[] {
	const found: string[] = [];

	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);

		if (entry.isDirectory()) {
			found.push(...routerAliases(path));
		} else if (entry.name.endsWith(".ts")) {
			const source = readFileSync(path, "utf8");

			for (const match of source.matchAll(
				/@Router\(\{\s*alias:\s*"([^"]+)"/g,
			)) {
				found.push(match[1] as string);
			}
		}
	}

	return found;
}

const SRC = join(import.meta.dir, "..", "src");

describe("which module owns a procedure", () => {
	it("maps a CRM procedure to crm and a core one to nobody", () => {
		expect(moduleOwningProcedure("companies.list")).toBe("crm");
		expect(moduleOwningProcedure("deals.byId")).toBe("crm");
		expect(moduleOwningProcedure("workspace.get")).toBeNull();
		expect(moduleOwningProcedure("modules.set")).toBeNull();
	});

	it("leaves every router either core or claimed by exactly one module", () => {
		const aliases = routerAliases(SRC);
		expect(aliases.length).toBeGreaterThan(10);

		for (const alias of aliases) {
			const owner = moduleOwningProcedure(`${alias}.anything`);
			const core = CORE_ROUTERS.has(alias);

			expect(
				owner !== null || core,
				`router "${alias}" is not core and no module claims it: add it to CORE_ROUTERS in this test or to a module's routers`,
			).toBe(true);
			expect(
				owner !== null && core,
				`router "${alias}" is both core and owned by ${owner}`,
			).toBe(false);
		}
	});

	it("only names routers that exist", () => {
		const aliases = new Set(routerAliases(SRC));

		for (const id of MODULE_IDS) {
			for (const alias of ALL_MODULES[id].routers) {
				expect(aliases.has(alias), `${id} claims unknown router ${alias}`).toBe(
					true,
				);
			}
		}
	});
});
