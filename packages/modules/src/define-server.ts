import type { Prisma } from "@app/db";

/** What a seed function receives: the shared client, or a transaction (tests roll one back). */
export type SeedClient = Prisma.TransactionClient;

/**
 * The server side of a module, in `<module>/server.ts`. Loaded only by code
 * that runs on the server (the seed script, the API), never by the browser, so
 * it may use the database.
 */
export type ModuleServer = {
	/** Idempotent: running it twice leaves the database exactly as running it once. */
	seed?: (client: SeedClient) => Promise<void>;
};

export function defineServer(server: ModuleServer): ModuleServer {
	return server;
}
