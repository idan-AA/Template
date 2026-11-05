import { afterAll } from "bun:test";

/**
 * Preloaded by bunfig.toml, so this afterAll runs once, after the last spec file of the run.
 * It drops every bk_*_test database the ledger specs created and did not already drop: the
 * migrated template, and any clone a failing test never closed. Without it every run would leak
 * dozens of databases, because the ledger guards forbid DELETE and TRUNCATE and tests therefore
 * work in throwaway databases.
 *
 * Nothing here imports the database client at load time, so the engine specs (which need no
 * database) still run when TEST_DATABASE_URL is unset.
 */
afterAll(async () => {
	const g = globalThis as unknown as Record<string, Set<string> | undefined>;
	const names = g.__bookkeepingTestDatabases;
	const url = process.env.TEST_DATABASE_URL;
	if (!names || names.size === 0 || !url) return;

	const { connectTo } = await import("@app/db/connect");
	const admin = new URL(url);
	admin.pathname = "/postgres";
	const db = connectTo(admin.toString());
	try {
		for (const name of [...names]) {
			if (!name.startsWith("bk_") || !name.endsWith("_test")) continue;
			await db.$executeRawUnsafe(
				`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`,
			);
			names.delete(name);
		}
	} finally {
		await db.$disconnect();
	}
});
