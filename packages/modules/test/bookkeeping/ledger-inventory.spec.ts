import { describe, expect, setDefaultTimeout, test } from "bun:test";
import { join } from "node:path";
import { connectTo } from "@app/db/connect";
import {
	cloneDatabase,
	createEmptyDatabase,
	deployMigrations,
	dropDatabase,
	observe,
} from "./ledger-helpers";

// Each spec clones a database; cloning is slow on some hosts.
setDefaultTimeout(120_000);

const DB_PACKAGE = join(import.meta.dirname, "..", "..", "..", "db");

// docs/plan/bookkeeping.md 3.2. Core's audit trail brings audit_append_only and audit_no_truncate
// (migration 20261104193000_audit_event); the ledger brings the rest. G6, G9, G10, G11 arrive with
// banking, documents and allocations.
const EXPECTED_TRIGGERS = [
	"audit_append_only on auditEvent",
	"audit_no_truncate on auditEvent",
	"ledger_account_guard on ledgerAccount",
	"ledger_entry_immutable on journalEntry",
	"ledger_entry_post_guard on journalEntry",
	"ledger_line_immutable on journalLine",
	"ledger_no_truncate_entry on journalEntry",
	"ledger_no_truncate_line on journalLine",
	"ledger_reversal_guard on journalEntry",
	"ledger_settings_guard on ledgerSettings",
	"number_sequence_guard on numberSequence",
];

const EXPECTED_FUNCTIONS = [
	"audit_event_refuse_change",
	"ledger_account_guard",
	"ledger_entry_immutable",
	"ledger_entry_post_guard",
	"ledger_line_immutable",
	"ledger_no_truncate",
	"ledger_reversal_guard",
	"ledger_settings_guard",
	"number_sequence_guard",
];

const GUARD_BY_TRIGGER = new Map<string, string>(
	Object.entries({
		ledger_entry_post_guard: "G1",
		ledger_entry_immutable: "G2",
		ledger_line_immutable: "G3",
		ledger_no_truncate_entry: "G4",
		ledger_no_truncate_line: "G4",
		ledger_reversal_guard: "G5",
		ledger_account_guard: "G7",
		ledger_settings_guard: "G8",
		number_sequence_guard: "G13",
		audit_append_only: "G12 (core)",
		audit_no_truncate: "G12 (core)",
	}),
);

type Inventory = { triggers: string[]; functions: string[] };

async function inventory(url: string): Promise<Inventory> {
	const client = connectTo(url);
	try {
		const triggers = await client.$queryRawUnsafe<Array<{ n: string }>>(
			`SELECT t.tgname || ' on ' || c.relname AS n
			 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
			 WHERE NOT t.tgisinternal ORDER BY 1`,
		);
		const functions = await client.$queryRawUnsafe<Array<{ n: string }>>(
			`SELECT p.proname AS n FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
			 WHERE ns.nspname = 'public' ORDER BY 1`,
		);
		return {
			triggers: triggers.map((r) => r.n),
			functions: functions.map((r) => r.n),
		};
	} finally {
		await client.$disconnect();
	}
}

function report(label: string, inv: Inventory): string {
	const lines = [`== ${label}`, "triggers:"];
	for (const t of inv.triggers) {
		lines.push(
			`  ${GUARD_BY_TRIGGER.get(t.split(" ")[0] ?? "") ?? "??"}  ${t}`,
		);
	}
	lines.push("functions:", ...inv.functions.map((f) => `  ${f}`));
	return `${lines.join("\n")}\n`;
}

function prisma(args: string[], url: string) {
	return Bun.spawnSync([process.execPath, "x", "--bun", "prisma", ...args], {
		cwd: DB_PACKAGE,
		env: { ...process.env, DATABASE_URL: url },
		stdout: "pipe",
		stderr: "pipe",
	});
}

describe("trigger and function inventory (T2)", () => {
	test("a clone of the migrated template carries exactly the guard list", async () => {
		const clone = await cloneDatabase("inv");
		const inv = await inventory(clone.url).finally(() =>
			dropDatabase(clone.name),
		);
		expect(inv.triggers).toEqual(EXPECTED_TRIGGERS);
		expect(inv.functions).toEqual(EXPECTED_FUNCTIONS);
		for (const t of inv.triggers) {
			expect(GUARD_BY_TRIGGER.get(t.split(" ")[0] ?? "")).toBeDefined();
		}
		const guards = new Set(
			inv.triggers.map((t) => GUARD_BY_TRIGGER.get(t.split(" ")[0] ?? "")),
		);
		expect([...guards].sort()).toEqual([
			"G1",
			"G12 (core)",
			"G13",
			"G2",
			"G3",
			"G4",
			"G5",
			"G7",
			"G8",
		]);
		observe("inventory.txt", report("template clone", inv));
	});
});

describe("fresh database replay", () => {
	test("deploying every migration from zero recreates schema and guards and matches schema.prisma", async () => {
		const { name, url } = await createEmptyDatabase("replay");

		const before = await inventory(url);
		expect(before.triggers).toEqual([]);
		expect(before.functions).toEqual([]);

		const deploy = deployMigrations(url);
		expect(deploy.exitCode, deploy.output).toBe(0);
		expect(deploy.output).toContain("_bookkeeping_core");
		expect(deploy.output).toContain("_bookkeeping_guards");

		const inv = await inventory(url);
		expect(inv.triggers).toEqual(EXPECTED_TRIGGERS);
		expect(inv.functions).toEqual(EXPECTED_FUNCTIONS);

		const diff = prisma(
			[
				"migrate",
				"diff",
				"--from-config-datasource",
				"--to-schema",
				join(DB_PACKAGE, "prisma", "schema"),
				"--exit-code",
			],
			url,
		);
		expect(diff.exitCode, `${diff.stdout}${diff.stderr}`).toBe(0);

		const second = deployMigrations(url);
		expect(second.output).toContain("No pending migrations");
		observe(
			"inventory.txt",
			`${report("replay from zero", inv)}drift check exit code: ${diff.exitCode}\n`,
		);
		await dropDatabase(name);
	}, 180_000);
});
