import { db } from "@app/db";
import type { ModuleId } from "../src/registry";
import { enabledModules } from "../src/runtime";
import { loadServer } from "../src/servers";

/**
 * Runs after the core seed (turbo runs `@app/db`'s `db:seed` first): each
 * enabled module's seed, in dependency order. Every seed is idempotent.
 */
async function main() {
	const modules = enabledModules();

	if (modules.length === 0) {
		console.log("No modules enabled, so there is nothing more to seed.");
		return;
	}

	for (const module of modules) {
		const server = await loadServer(module.id as ModuleId);

		if (!server.seed) {
			console.log(`Module ${module.id}: no seed.`);
			continue;
		}

		console.log(`Module ${module.id}: seeding...`);
		await server.seed(db);
	}
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await db.$disconnect();
	});
