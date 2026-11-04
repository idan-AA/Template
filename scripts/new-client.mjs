import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ID_PATTERN = /^[a-z][a-z0-9-]{1,23}$/;

const id = process.argv[2];

if (!id || !ID_PATTERN.test(id) || id.endsWith("-")) {
	console.error(
		"Usage: bun run new-client <id>\n" +
			"The id is 2 to 24 characters: lowercase letters, digits and hyphens, starting with a letter.",
	);
	process.exit(1);
}

const template = readFileSync(join(root, "render.yaml.template"), "utf8");
const body = template.replaceAll("{{ID}}", id);

const left = body.match(/\{\{[^}]*\}\}/);
if (left) {
	console.error(`Unreplaced placeholder in the template: ${left[0]}`);
	process.exit(1);
}

const dir = join(root, "clients", id);
const target = join(dir, "render.yaml");

if (existsSync(target)) {
	console.error(
		`${target} already exists. Delete it first if you mean to regenerate it.`,
	);
	process.exit(1);
}

mkdirSync(dir, { recursive: true });
writeFileSync(target, body, "utf8");

console.log(`Wrote clients/${id}/render.yaml`);
console.log("Next:");
console.log(`  1. Make sure clients/${id}/client.config.ts exists.`);
console.log("  2. Commit both and push (the owner approves pushes).");
console.log(
	`  3. Render: New > Blueprint, Blueprint Path = clients/${id}/render.yaml`,
);
