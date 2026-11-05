import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ID_PATTERN = /^[a-z][a-z0-9-]{1,23}$/;

const id = process.argv[2];

function fail(message) {
	console.error(message);
	process.exit(1);
}

if (!id || !ID_PATTERN.test(id) || id.endsWith("-")) {
	fail(
		"Usage: bun run new-client <id>\n" +
			"The id is 2 to 24 characters: lowercase letters, digits and hyphens, starting with a letter.",
	);
}

const dir = join(root, "clients", id);
const target = join(dir, "render.yaml");
const registryPath = join(root, "clients", "registry.ts");
const registry = readFileSync(registryPath, "utf8");

const importLine = (name) => `import ${name} from "./${id}/client.config";`;
const identifier = `${id.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase())}Client`;
const entryKey = /-/.test(id) ? `"${id}"` : id;

if (
	registry.includes(`"./${id}/client.config"`) ||
	new RegExp(`^\\s*(?:"${id}"|${id}):`, "m").test(registry)
) {
	fail(`clients/registry.ts already lists "${id}". Nothing was written.`);
}

if (existsSync(target)) {
	fail(
		`${target} already exists. Delete it first if you mean to regenerate it.`,
	);
}

const template = readFileSync(join(root, "render.yaml.template"), "utf8");
const body = template.replaceAll("{{ID}}", id);

const left = body.match(/\{\{[^}]*\}\}/);
if (left) fail(`Unreplaced placeholder in the template: ${left[0]}`);

// Registry: add the import in path order and the entry at the end of CLIENTS.
const lines = registry.split("\n");
const importIndexes = lines
	.map((line, index) =>
		/^import .* from "\.\/.+\/client\.config";$/.test(line) ? index : -1,
	)
	.filter((index) => index >= 0);

if (importIndexes.length === 0) {
	fail(
		"clients/registry.ts has no client imports to extend. Nothing was written.",
	);
}

const insertAt =
	importIndexes.find((index) => {
		const path = lines[index].match(/from "(.+)";$/)?.[1] ?? "";
		return path > `./${id}/client.config`;
	}) ?? importIndexes[importIndexes.length - 1] + 1;
lines.splice(insertAt, 0, importLine(identifier));

const closeIndex = lines.findIndex((line) => line === "};");
if (closeIndex < 0) {
	fail(
		"clients/registry.ts: could not find the end of CLIENTS. Nothing was written.",
	);
}
lines.splice(closeIndex, 0, `\t${entryKey}: ${identifier},`);

const scaffolded = [];

function scaffoldClient() {
	const configPath = join(dir, "client.config.ts");

	if (!existsSync(configPath)) {
		const title = id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
		const source = readFileSync(
			join(root, "clients", "default", "client.config.ts"),
			"utf8",
		)
			.replace(
				/\/\*\*[\s\S]*?\*\/\n/,
				`/** Config for client "${id}". Edit the brand, then enable modules. */\n`,
			)
			.replaceAll('"Template"', JSON.stringify(title))
			.replace('domain: "localhost"', `domain: "${id}.example.com"`);
		writeFileSync(configPath, source, "utf8");
		scaffolded.push(`clients/${id}/client.config.ts`);
	}

	const brandPath = join(dir, "brand");
	if (!existsSync(brandPath)) {
		cpSync(join(root, "clients", "default", "brand"), brandPath, {
			recursive: true,
		});
		scaffolded.push(`clients/${id}/brand/`);
	}
}

// Everything checked: write. registry.ts is written LAST, only after every file
// succeeded, and a failure removes the folder this run created, so a half-made
// client never reaches the registry or leaves a folder the registry test fails on.
const createdDir = !existsSync(dir);

try {
	mkdirSync(dir, { recursive: true });
	writeFileSync(target, body, "utf8");
	scaffoldClient();
	writeFileSync(registryPath, lines.join("\n"), "utf8");
} catch (error) {
	if (createdDir) rmSync(dir, { recursive: true, force: true });
	fail(
		`Could not create client "${id}": ${error instanceof Error ? error.message : error}\n` +
			"Nothing was kept.",
	);
}

console.log(`Wrote clients/${id}/render.yaml`);
for (const file of scaffolded)
	console.log(`Scaffolded ${file} from clients/default`);
console.log(`Registered "${id}" in clients/registry.ts`);
console.log("Next:");
console.log(
	`  1. Edit clients/${id}/client.config.ts (brand, modules, currency, timezone) and replace clients/${id}/brand/ logos.`,
);
console.log("  2. Commit and push (the owner approves pushes).");
console.log(
	`  3. Render: New > Blueprint, Blueprint Path = clients/${id}/render.yaml`,
);
