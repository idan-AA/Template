import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const apiDir = dirname(dirname(fileURLToPath(import.meta.url)));
const dbDir = join(dirname(dirname(apiDir)), "packages/db");
const bun = process.env.BUN_BIN || "bun";

if (!process.env.DATABASE_URL) {
	console.log("• no DATABASE_URL, skipping the schema drift check");
	process.exit(0);
}

console.log("• checking the deployed schema against schema.prisma...");
const drift = spawnSync(
	bun,
	[
		"x",
		"prisma",
		"migrate",
		"diff",
		"--from-config-datasource",
		"--to-schema",
		join("prisma", "schema.prisma"),
		"--exit-code",
	],
	{ cwd: dbDir, encoding: "utf8", env: process.env },
);

if (drift.status === 0) {
	console.log("✓ schema matches");
} else if (drift.status === 2) {
	console.log("");
	console.log("!!  THE DATABASE SCHEMA DOES NOT MATCH schema.prisma  !!");
	console.log(
		"    Every migration is recorded as applied, so `migrate deploy` keeps reporting",
	);
	console.log(
		"    nothing pending while queries fail on columns that are not there. Reconcile with",
	);
	console.log(
		"    `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`.",
	);
	console.log("");
	console.log(drift.stdout || "");
} else {
	console.log(
		`• could not compare the schema (${drift.stderr?.trim() || "unknown error"})`,
	);
}
