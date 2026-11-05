import { afterEach, describe, expect, it } from "bun:test";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * `bun run new-client <id>` against a throwaway copy of the repository layout,
 * so the real clients/ folder and registry are never touched.
 */

const REPO = join(import.meta.dir, "..", "..", "..");
const roots: string[] = [];

function sandbox(): string {
	const root = mkdtempSync(join(tmpdir(), "new-client-"));
	roots.push(root);
	mkdirSync(join(root, "scripts"));
	mkdirSync(join(root, "clients"));
	cpSync(
		join(REPO, "scripts", "new-client.mjs"),
		join(root, "scripts", "new-client.mjs"),
	);
	cpSync(
		join(REPO, "render.yaml.template"),
		join(root, "render.yaml.template"),
	);
	cpSync(join(REPO, "clients", "default"), join(root, "clients", "default"), {
		recursive: true,
	});
	cpSync(
		join(REPO, "clients", "registry.ts"),
		join(root, "clients", "registry.ts"),
	);
	return root;
}

function run(root: string, id: string) {
	return Bun.spawnSync(
		[process.execPath, join(root, "scripts", "new-client.mjs"), id],
		{
			cwd: root,
			stderr: "pipe",
			stdout: "pipe",
		},
	);
}

afterEach(() => {
	for (const root of roots.splice(0)) {
		rmSync(root, { recursive: true, force: true });
	}
});

describe("new-client", () => {
	it("writes the Blueprint, scaffolds config and brand, and registers the client", () => {
		const root = sandbox();
		const result = run(root, "acme-co");

		expect(result.exitCode).toBe(0);
		expect(existsSync(join(root, "clients", "acme-co", "render.yaml"))).toBe(
			true,
		);
		expect(
			existsSync(join(root, "clients", "acme-co", "client.config.ts")),
		).toBe(true);
		expect(existsSync(join(root, "clients", "acme-co", "brand"))).toBe(true);

		const registry = readFileSync(join(root, "clients", "registry.ts"), "utf8");
		expect(registry).toContain('./acme-co/client.config"');
		expect(registry).toContain('"acme-co": acmeCoClient,');

		const blueprint = readFileSync(
			join(root, "clients", "acme-co", "render.yaml"),
			"utf8",
		);
		expect(blueprint).toContain("AGENT_SHELL");
		expect(blueprint).not.toContain("{{");
	});

	it("refuses an id the registry already lists and writes nothing", () => {
		const root = sandbox();
		const before = readFileSync(join(root, "clients", "registry.ts"), "utf8");
		const result = run(root, "default");

		expect(result.exitCode).toBe(1);
		expect(readFileSync(join(root, "clients", "registry.ts"), "utf8")).toBe(
			before,
		);
	});

	it("rolls the folder back and leaves the registry alone when scaffolding fails", () => {
		const root = sandbox();
		const before = readFileSync(join(root, "clients", "registry.ts"), "utf8");
		// Break the scaffold source: the brand folder the script copies is gone.
		rmSync(join(root, "clients", "default", "brand"), {
			recursive: true,
			force: true,
		});

		const result = run(root, "broken-co");

		expect(result.exitCode).toBe(1);
		expect(result.stderr.toString()).toContain("Nothing was kept");
		expect(existsSync(join(root, "clients", "broken-co"))).toBe(false);
		expect(readFileSync(join(root, "clients", "registry.ts"), "utf8")).toBe(
			before,
		);
	});
});
