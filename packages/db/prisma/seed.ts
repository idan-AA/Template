import { db } from "../src/client";
import { seedCore } from "../src/seeds/core";

/**
 * The core seed. Each enabled module's own seed runs after this one, from
 * `bun run db:seed` at the repo root (see packages/modules/scripts/seed.ts).
 */
seedCore(db)
	.then((rates) => {
		console.log(`Core seed: ${rates} exchange rates.`);
	})
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await db.$disconnect();
	});
