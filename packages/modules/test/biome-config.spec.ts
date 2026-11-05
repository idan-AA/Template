import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_MODULES } from "../src/registry";

/**
 * "A guard that is not switched on is not a guard." The cross-module import
 * rule lives in biome.jsonc as one override per module. This test fails when a
 * module is added (or `requires` changes) without the override list following.
 * That the rule really fires was checked by feeding it a violation; see the
 * hand-over notes.
 */

type Override = {
	includes?: string[];
	linter?: {
		rules?: {
			style?: {
				noRestrictedImports?: {
					options?: { patterns?: Array<{ group: string[] }> };
				};
			};
		};
	};
};

function readBiomeConfig(): { overrides: Override[] } {
	const text = readFileSync(
		join(import.meta.dir, "..", "..", "..", "biome.jsonc"),
		"utf8",
	);

	return JSON.parse(stripComments(text));
}

/** Drops // and block comments but leaves strings alone (globs contain both). */
function stripComments(text: string): string {
	let out = "";
	let inString = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i] as string;
		const next = text[i + 1];

		if (inString) {
			out += char;
			if (char === "\\") out += text[++i] ?? "";
			else if (char === '"') inString = false;
		} else if (char === '"') {
			inString = true;
			out += char;
		} else if (char === "/" && next === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			out += "\n";
		} else if (char === "/" && next === "*") {
			i += 2;
			while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
			i++;
		} else {
			out += char;
		}
	}

	return out;
}

function forbiddenGroups(config: { overrides: Override[] }, moduleId: string) {
	const override = config.overrides.find((entry) =>
		entry.includes?.includes(`packages/modules/${moduleId}/**`),
	);

	return (
		override?.linter?.rules?.style?.noRestrictedImports?.options?.patterns?.flatMap(
			(pattern) => pattern.group,
		) ?? []
	);
}

describe("biome.jsonc cross-module import rule", () => {
	const config = readBiomeConfig();

	for (const module of Object.values(ALL_MODULES)) {
		for (const other of Object.values(ALL_MODULES)) {
			if (other.id === module.id) continue;

			const allowed = (module.requires as readonly string[]).includes(other.id);

			it(`${module.id} ${allowed ? "may" : "may not"} import ${other.id}`, () => {
				const groups = forbiddenGroups(config, module.id);

				if (allowed) {
					expect(groups.some((group) => group.includes(other.id))).toBe(false);
				} else {
					expect(groups).toContain(`**/${other.id}/**`);
					expect(groups).toContain(`@app/modules/${other.id}/**`);
				}
			});
		}
	}
});
