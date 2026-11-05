// The side effect import below makes a missing or wrongly named TEST_DATABASE_URL fail with the
// repo's own message (packages/db/src/client.ts) instead of skipping or guessing.
import "@app/db/client";

import { setDefaultTimeout } from "bun:test";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@app/db";
import { connectTo } from "@app/db/connect";
import { seedLedger } from "@app/db/seeds/bookkeeping";
import {
	buildManualJournalEntry,
	type PostingContext,
	type PostingInput,
} from "../../bookkeeping/engine";
import {
	type Actor,
	loadPostingContext,
	post,
	setSession,
} from "../../bookkeeping/ledger/posting";

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

setDefaultTimeout(120_000);

const DB_PACKAGE = join(import.meta.dirname, "..", "..", "..", "db");

/**
 * The ledger guards forbid DELETE and TRUNCATE on posted data, so a ledger test cannot clean up
 * after itself. Instead every spec file clones a migrated template database (CREATE DATABASE ...
 * TEMPLATE) and works in its own copy. The template is built once per test process by deploying
 * every migration from zero into a fresh database, so a template never has other connections
 * (cloning needs that) and the deploy-from-zero path is exercised on every run. All names end in
 * _test, as packages/db/scripts/test-db.ts requires.
 */
function configuredUrl(): string {
	const url = process.env.TEST_DATABASE_URL;
	if (!url) throw new Error("TEST_DATABASE_URL is not set");
	return url;
}

export function urlFor(database: string): string {
	const u = new URL(configuredUrl());
	u.pathname = `/${database}`;
	return u.toString();
}

export async function adminExec(sql: string): Promise<void> {
	const admin = connectTo(urlFor("postgres"));
	try {
		await admin.$executeRawUnsafe(sql);
	} finally {
		await admin.$disconnect();
	}
}

export type MigrationRun = { exitCode: number; output: string };

export function deployMigrations(url: string): MigrationRun {
	const result = Bun.spawnSync(
		[process.execPath, "x", "--bun", "prisma", "migrate", "deploy"],
		{
			cwd: DB_PACKAGE,
			env: { ...process.env, DATABASE_URL: url },
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	return {
		exitCode: result.exitCode ?? -1,
		output: `${result.stdout.toString()}${result.stderr.toString()}`,
	};
}

/**
 * Every database this process creates is recorded here, on globalThis so the teardown preload
 * (test/bookkeeping/teardown.ts, which runs once after the last spec file) sees the same set. A
 * database leaves the set when it is dropped.
 */
const REGISTRY_KEY = "__bookkeepingTestDatabases";
type Registry = Set<string>;
export function createdDatabases(): Registry {
	const g = globalThis as unknown as Record<string, Registry | undefined>;
	g[REGISTRY_KEY] ??= new Set<string>();
	return g[REGISTRY_KEY];
}

/** Drops a database this process created. FORCE ends any connection still open to it. */
export async function dropDatabase(name: string): Promise<void> {
	if (!name.startsWith("bk_") || !name.endsWith("_test"))
		throw new Error(`refusing to drop "${name}": not a bk_*_test database`);
	await adminExec(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
	createdDatabases().delete(name);
}

export async function createEmptyDatabase(
	label: string,
): Promise<{ name: string; url: string }> {
	const name = `bk_${label}_${Date.now().toString(36)}${counter++}_test`;
	await adminExec(`CREATE DATABASE "${name}"`);
	createdDatabases().add(name);
	return { name, url: urlFor(name) };
}

let templatePromise: Promise<string> | null = null;

function templateDatabase(): Promise<string> {
	templatePromise ??= (async () => {
		const { name, url } = await createEmptyDatabase("tpl");
		const deployed = deployMigrations(url);
		if (deployed.exitCode !== 0)
			throw new Error(`prisma migrate deploy failed:
${deployed.output}`);
		return name;
	})();
	return templatePromise;
}

/**
 * Evidence for a report: set BOOKKEEPING_OBSERVED_DIR and the specs append the exact refusal texts
 * and fuzz totals there. Unset, nothing is written (the repo stays clean).
 */
export function observe(file: string, text: string): void {
	const dir = process.env.BOOKKEEPING_OBSERVED_DIR;
	if (dir) appendFileSync(join(dir, file), text);
}

let counter = 0;

export async function cloneDatabase(
	label: string,
): Promise<{ name: string; url: string }> {
	const template = await templateDatabase();
	const name = `bk_${label}_${Date.now().toString(36)}${counter++}_test`;
	await adminExec(`CREATE DATABASE "${name}" TEMPLATE "${template}"`);
	createdDatabases().add(name);
	return { name, url: urlFor(name) };
}

export interface Fixture {
	db: PrismaClient;
	url: string;
	name: string;
	ids: Map<string, string>;
	/** Disconnects, then drops this clone. Call it when the test is done with the database. */
	close(): Promise<void>;
}

export const USER: Actor = { type: "USER", id: "user-1", label: "Test User" };

export async function fixture(
	label: string,
	options: { base?: string; seed?: boolean } = {},
): Promise<Fixture> {
	const { name, url } = await cloneDatabase(label);
	const db = connectTo(url);
	if (options.seed !== false) {
		await seedLedger(db, {
			baseCurrency: options.base ?? "USD",
			timezone: "America/New_York",
		});
	}
	const ids = new Map<string, string>();
	for (const a of await db.ledgerAccount.findMany()) ids.set(a.code, a.id);
	return {
		db,
		url,
		name,
		ids,
		close: async () => {
			await db.$disconnect();
			await dropDatabase(name);
		},
	};
}

export function acct(f: Fixture, code: string): string {
	const id = f.ids.get(code);
	if (!id) throw new Error(`no account ${code}`);
	return id;
}

export async function ctxOf(f: Fixture): Promise<PostingContext> {
	return f.db.$transaction((tx) =>
		loadPostingContext(tx, new Date().toISOString()),
	);
}

export async function postIn(
	f: Fixture,
	input: PostingInput,
	actor: Actor = USER,
): Promise<string> {
	const result = await f.db.$transaction((tx) => post(tx, input, actor));
	return result.entryId;
}

export async function manual(
	f: Fixture,
	id: string,
	date: string,
	lines: Array<[code: string, side: "DEBIT" | "CREDIT", amount: bigint]>,
	actor: Actor = USER,
): Promise<string> {
	const ctx = await ctxOf(f);
	const input = buildManualJournalEntry(
		{
			id,
			source: "MANUAL",
			date,
			memo: null,
			lines: lines.map(([code, side, amount]) => ({
				accountId: acct(f, code),
				side,
				amountMinor: amount,
				currency: ctx.baseCurrency,
				fx: null,
			})),
		},
		ctx,
	);
	return postIn(f, input, actor);
}

/** Runs fn and returns the database error text; fails the test if nothing was refused. */
export async function refusal(fn: () => Promise<unknown>): Promise<string> {
	try {
		await fn();
	} catch (error) {
		return error instanceof Error ? error.message : String(error);
	}
	throw new Error("the operation was NOT refused");
}

/** Runs raw SQL in a transaction with the session variables of `actor` applied. */
export async function sql(
	f: Fixture,
	statements: string[],
	actor: Actor = USER,
): Promise<void> {
	await f.db.$transaction(async (tx: Tx) => {
		await setSession(tx, actor);
		for (const s of statements) await tx.$executeRawUnsafe(s);
	});
}

/** Inserts a DRAFT entry with the given base-currency lines directly, bypassing the service. */
export async function draft(
	f: Fixture,
	key: string,
	date: string,
	lines: Array<[code: string, side: "DEBIT" | "CREDIT", amount: bigint]>,
	extra: { reversesId?: string; source?: "MANUAL" | "REVERSAL" } = {},
): Promise<string> {
	const entry = await f.db.journalEntry.create({
		data: {
			date: new Date(`${date}T00:00:00.000Z`),
			status: "DRAFT",
			source: extra.source ?? "MANUAL",
			sourceKey: key,
			baseCurrency: "USD",
			createdById: "user-1",
			reversesId: extra.reversesId ?? null,
			lines: {
				create: lines.map(([code, side, amount], i) => ({
					lineNo: i + 1,
					accountId: acct(f, code),
					currency: "USD",
					debitMinor: side === "DEBIT" ? amount : 0n,
					creditMinor: side === "CREDIT" ? amount : 0n,
					baseDebitMinor: side === "DEBIT" ? amount : 0n,
					baseCreditMinor: side === "CREDIT" ? amount : 0n,
					fxRate: "1",
					fxOrigin: "IDENTITY",
					fxRateAt: new Date("2026-11-04T00:00:00.000Z"),
				})),
			},
		},
		select: { id: true },
	});
	return entry.id;
}

export async function flip(
	f: Fixture,
	entryId: string,
	actor: Actor = USER,
	postedById: string | null = "user-1",
): Promise<void> {
	await f.db.$transaction(async (tx) => {
		await setSession(tx, actor);
		await tx.journalEntry.update({
			where: { id: entryId },
			data: { status: "POSTED", postedById },
		});
	});
}
