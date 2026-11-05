import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setDefaultTimeout,
	test,
} from "bun:test";
import { writeAudit } from "@app/db/audit";
import { reverse } from "../../bookkeeping/ledger/posting";
import {
	acct,
	draft,
	type Fixture,
	fixture,
	flip,
	manual,
	observe,
	refusal,
	sql,
	USER,
} from "./ledger-helpers";

// Each spec clones a database; cloning is slow on some hosts.
setDefaultTimeout(120_000);

async function refused(
	label: string,
	guard: string,
	fn: () => Promise<unknown>,
): Promise<string> {
	const text = await refusal(fn);
	expect(text).toContain(guard);
	observe(
		"refusals.txt",
		`[${guard}] ${label}\n    ${text.replace(/\s+/g, " ").trim()}\n`,
	);
	return text;
}

describe("G1 ledger_entry_post_guard", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("g1");
	});
	afterAll(() => f.close());

	test("refuses an unbalanced post, accepts the balanced one (opposite)", async () => {
		const bad = await draft(f, "g1-unbal", "2026-11-05", [
			["6250", "DEBIT", 1000n],
			["3000", "CREDIT", 999n],
		]);
		await refused(
			"unbalanced post (base 1000 vs 999)",
			"G1 ledger_entry_post_guard",
			() => flip(f, bad),
		);
		const good = await draft(f, "g1-bal", "2026-11-05", [
			["6250", "DEBIT", 1000n],
			["3000", "CREDIT", 1000n],
		]);
		await flip(f, good);
		expect(
			(await f.db.journalEntry.findUniqueOrThrow({ where: { id: good } }))
				.status,
		).toBe("POSTED");
	});

	test("refuses a one line post", async () => {
		const id = await draft(f, "g1-one", "2026-11-05", [["6250", "DEBIT", 5n]]);
		await refused("one line entry", "needs at least two lines", () =>
			flip(f, id),
		);
	});

	test("refuses a single currency imbalance even when base balances", async () => {
		const entry = await f.db.journalEntry.create({
			data: {
				date: new Date("2026-11-05T00:00:00.000Z"),
				source: "MANUAL",
				sourceKey: "g1-ccy",
				baseCurrency: "USD",
				createdById: "user-1",
				lines: {
					create: [
						{
							lineNo: 1,
							accountId: acct(f, "6250"),
							currency: "EUR",
							debitMinor: 100n,
							baseDebitMinor: 110n,
							fxRate: "1.1",
							fxOrigin: "MANUAL",
							fxRateAt: new Date(),
						},
						{
							lineNo: 2,
							accountId: acct(f, "3000"),
							currency: "EUR",
							creditMinor: 99n,
							baseCreditMinor: 110n,
							fxRate: "1.1",
							fxOrigin: "MANUAL",
							fxRateAt: new Date(),
						},
					],
				},
			},
		});
		await refused(
			"EUR 100 vs EUR 99, base equal",
			"debits 100 do not equal credits 99 in one currency",
			() => flip(f, entry.id),
		);
	});

	test("refuses a ROUNDING line on an all-base-currency entry (a cent cannot be hidden)", async () => {
		const entry = await f.db.journalEntry.create({
			data: {
				date: new Date("2026-11-05T00:00:00.000Z"),
				source: "MANUAL",
				sourceKey: "g1-round",
				baseCurrency: "USD",
				createdById: "user-1",
				lines: {
					create: [
						{
							lineNo: 1,
							accountId: acct(f, "6250"),
							currency: "EUR",
							debitMinor: 100n,
							baseDebitMinor: 110n,
							fxRate: "1.1",
							fxOrigin: "MANUAL",
							fxRateAt: new Date(),
						},
						{
							lineNo: 2,
							accountId: acct(f, "3000"),
							currency: "USD",
							creditMinor: 109n,
							baseCreditMinor: 109n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
						{
							lineNo: 3,
							accountId: acct(f, "7900"),
							kind: "ROUNDING",
							currency: "USD",
							creditMinor: 1n,
							baseCreditMinor: 1n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
					],
				},
			},
		});
		await refused(
			"1 foreign line, balanced only by a 1 cent ROUNDING line",
			"rounding 1 is larger than 1 foreign lines can explain",
			() => flip(f, entry.id),
		);
	});

	test("refuses a ROUNDING line inside a single-currency base entry", async () => {
		const entry = await f.db.journalEntry.create({
			data: {
				date: new Date("2026-11-05T00:00:00.000Z"),
				source: "MANUAL",
				sourceKey: "g1-round-base",
				baseCurrency: "USD",
				createdById: "user-1",
				lines: {
					create: [
						{
							lineNo: 1,
							accountId: acct(f, "6250"),
							currency: "USD",
							debitMinor: 1000n,
							baseDebitMinor: 1000n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
						{
							lineNo: 2,
							accountId: acct(f, "3000"),
							currency: "USD",
							creditMinor: 999n,
							baseCreditMinor: 999n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
						{
							lineNo: 3,
							accountId: acct(f, "7900"),
							kind: "ROUNDING",
							currency: "USD",
							creditMinor: 1n,
							baseCreditMinor: 1n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
					],
				},
			},
		});
		await refused(
			"USD 1000 vs 999 plus a 1 cent ROUNDING line",
			"debits 1000 do not equal credits 999 in one currency",
			() => flip(f, entry.id),
		);
	});

	test("refuses a base currency line that is not rate 1", async () => {
		const entry = await f.db.journalEntry.create({
			data: {
				date: new Date("2026-11-05T00:00:00.000Z"),
				source: "MANUAL",
				sourceKey: "g1-baserate",
				baseCurrency: "USD",
				createdById: "user-1",
				lines: {
					create: [
						{
							lineNo: 1,
							accountId: acct(f, "6250"),
							currency: "USD",
							debitMinor: 100n,
							baseDebitMinor: 100n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
						{
							lineNo: 2,
							accountId: acct(f, "3000"),
							currency: "USD",
							creditMinor: 100n,
							baseCreditMinor: 100n,
							fxRate: "1.5",
							fxOrigin: "MANUAL",
							fxRateAt: new Date(),
						},
					],
				},
			},
		});
		await refused(
			"USD line at rate 1.5",
			"base currency line must have rate 1",
			() => flip(f, entry.id),
		);
	});

	test("refuses an entry whose base currency is not the ledger's", async () => {
		const entry = await f.db.journalEntry.create({
			data: {
				date: new Date("2026-11-05T00:00:00.000Z"),
				source: "MANUAL",
				sourceKey: "g1-basecur",
				baseCurrency: "EUR",
				createdById: "user-1",
				lines: {
					create: [
						{
							lineNo: 1,
							accountId: acct(f, "6250"),
							currency: "EUR",
							debitMinor: 100n,
							baseDebitMinor: 100n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
						{
							lineNo: 2,
							accountId: acct(f, "3000"),
							currency: "EUR",
							creditMinor: 100n,
							baseCreditMinor: 100n,
							fxRate: "1",
							fxOrigin: "IDENTITY",
							fxRateAt: new Date(),
						},
					],
				},
			},
		});
		await refused(
			"entry base EUR in a USD ledger",
			"is not the ledger base currency",
			() => flip(f, entry.id),
		);
	});

	test("refuses a line on an archived account", async () => {
		// the account nets to zero on this draft, so G7 lets it be archived behind the entry's back
		const id = await draft(f, "g1-arch", "2026-11-05", [
			["6200", "DEBIT", 100n],
			["6200", "CREDIT", 100n],
		]);
		await f.db.ledgerAccount.update({
			where: { id: acct(f, "6200") },
			data: { archivedAt: new Date() },
		});
		await refused("line on archived 6200", "archived account", () =>
			flip(f, id),
		);
		await f.db.ledgerAccount.update({
			where: { id: acct(f, "6200") },
			data: { archivedAt: null },
		});
		await flip(f, id);
	});

	test("refuses posting by an AGENT, by an unset actor and with no postedById; accepts a USER (opposite)", async () => {
		const a = await draft(f, "g1-agent", "2026-11-05", [
			["6250", "DEBIT", 100n],
			["3000", "CREDIT", 100n],
		]);
		await refused("actor AGENT", "may not post", () =>
			flip(f, a, { type: "AGENT", id: "agent-1" }),
		);
		await refused("actor not set", "may not post", () =>
			f.db.journalEntry.update({
				where: { id: a },
				data: { status: "POSTED", postedById: "x" },
			}),
		);
		await refused("postedById null", "must name who posted", () =>
			flip(f, a, USER, null),
		);
		await flip(f, a, { type: "SYSTEM", id: "cron" });
		expect(
			(await f.db.journalEntry.findUniqueOrThrow({ where: { id: a } }))
				.postedAt,
		).not.toBeNull();
	});

	test("assigns a number at post and sets firstPostedAt", async () => {
		const entry = await f.db.journalEntry.findFirstOrThrow({
			where: { sourceKey: "g1-bal" },
		});
		expect(entry.number).toMatch(/^JE-\d{6}$/);
		const s = await f.db.ledgerSettings.findUniqueOrThrow({
			where: { id: "ledger" },
		});
		expect(s.firstPostedAt).not.toBeNull();
	});
});

describe("G1 lock dates", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("lock");
		await f.db.ledgerSettings.update({
			where: { id: "ledger" },
			data: {
				lockDate: new Date("2026-10-31T00:00:00.000Z"),
				hardLockDate: new Date("2026-09-30T00:00:00.000Z"),
			},
		});
	});
	afterAll(() => f.close());

	test("hard lock refuses everyone, even with the soft lock override", async () => {
		const id = await draft(f, "lk-hard", "2026-09-30", [
			["6250", "DEBIT", 100n],
			["3000", "CREDIT", 100n],
		]);
		await refused("date on the hard lock date", "hard lock date", () =>
			flip(f, id, { ...USER, softLockOverride: true }),
		);
	});

	test("soft lock refuses without override and accepts with it (opposite)", async () => {
		const id = await draft(f, "lk-soft", "2026-10-15", [
			["6250", "DEBIT", 100n],
			["3000", "CREDIT", 100n],
		]);
		await refused(
			"date inside the soft lock, no override",
			"no override was given",
			() => flip(f, id),
		);
		await flip(f, id, { ...USER, softLockOverride: true });
		expect(
			(await f.db.journalEntry.findUniqueOrThrow({ where: { id } })).status,
		).toBe("POSTED");
	});

	test("a date after the locks posts normally (opposite)", async () => {
		await manual(f, "lk-open", "2026-11-01", [
			["6250", "DEBIT", 100n],
			["3000", "CREDIT", 100n],
		]);
	});
});

describe("G2 ledger_entry_immutable and G3 ledger_line_immutable", () => {
	let f: Fixture;
	let posted: string;
	beforeAll(async () => {
		f = await fixture("g23");
		posted = await manual(f, "imm", "2026-11-05", [
			["6250", "DEBIT", 700n],
			["3000", "CREDIT", 700n],
		]);
	});
	afterAll(() => f.close());

	test("refuses update of memo on a posted entry", async () => {
		await refused(
			"UPDATE memo of a POSTED entry",
			"G2 ledger_entry_immutable",
			() =>
				sql(f, [
					`UPDATE "journalEntry" SET "memo" = 'edited' WHERE "id" = '${posted}'`,
				]),
		);
	});

	test("refuses delete of a posted entry", async () => {
		await refused("DELETE of a POSTED entry", "G2 ledger_entry_immutable", () =>
			sql(f, [`DELETE FROM "journalEntry" WHERE "id" = '${posted}'`]),
		);
	});

	test("refuses an entry inserted already POSTED", async () => {
		await refused(
			"INSERT with status POSTED",
			"G2 ledger_entry_immutable",
			() =>
				sql(f, [
					`INSERT INTO "journalEntry" ("id","date","status","source","baseCurrency","createdById","number","postedAt","postedById") VALUES ('born-posted','2026-11-05','POSTED','MANUAL','USD','u','JE-X','2026-11-05','u')`,
				]),
		);
	});

	test("refuses update, delete and insert on lines of a posted entry", async () => {
		await refused("UPDATE a posted line", "G3 ledger_line_immutable", () =>
			sql(f, [
				`UPDATE "journalLine" SET "memo" = 'x' WHERE "entryId" = '${posted}'`,
			]),
		);
		await refused("DELETE a posted line", "G3 ledger_line_immutable", () =>
			sql(f, [`DELETE FROM "journalLine" WHERE "entryId" = '${posted}'`]),
		);
		await refused(
			"INSERT a line into a posted entry",
			"G3 ledger_line_immutable",
			() =>
				sql(f, [
					`INSERT INTO "journalLine" ("id","entryId","lineNo","accountId","currency","debitMinor","baseDebitMinor","fxRate","fxOrigin","fxRateAt") VALUES ('late-line','${posted}',9,'${acct(f, "6250")}','USD',1,1,1,'IDENTITY',now())`,
				]),
		);
	});

	test("a DRAFT entry can be edited and deleted, cascading to its lines (opposite)", async () => {
		const d = await draft(f, "imm-draft", "2026-11-05", [
			["6250", "DEBIT", 5n],
			["3000", "CREDIT", 5n],
		]);
		await f.db.journalEntry.update({
			where: { id: d },
			data: { memo: "edit ok" },
		});
		await f.db.journalLine.update({
			where: { entryId_lineNo: { entryId: d, lineNo: 1 } },
			data: { memo: "line edit ok" },
		});
		await f.db.journalEntry.delete({ where: { id: d } });
		expect(await f.db.journalLine.count({ where: { entryId: d } })).toBe(0);
	});
});

describe("G4 ledger_no_truncate and core audit_append_only / audit_no_truncate", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("g412");
		await manual(f, "tr", "2026-11-05", [
			["6250", "DEBIT", 10n],
			["3000", "CREDIT", 10n],
		]);
	});
	afterAll(() => f.close());

	test("refuses TRUNCATE of the ledger tables, including CASCADE from the parent", async () => {
		await refused("TRUNCATE journalEntry", "G4 ledger_no_truncate", () =>
			sql(f, [`TRUNCATE "journalEntry" CASCADE`]),
		);
		await refused("TRUNCATE journalLine", "G4 ledger_no_truncate", () =>
			sql(f, [`TRUNCATE "journalLine"`]),
		);
		await refused(
			"TRUNCATE auditEvent (core trigger)",
			"auditEvent is append-only: TRUNCATE",
			() => sql(f, [`TRUNCATE "auditEvent"`]),
		);
		await refused(
			"TRUNCATE ledgerAccount CASCADE",
			"G4 ledger_no_truncate",
			() => sql(f, [`TRUNCATE "ledgerAccount" CASCADE`]),
		);
		expect(await f.db.journalEntry.count()).toBe(1);
	});

	test("audit rows can be written but never changed or deleted", async () => {
		const id = await f.db.$transaction((tx) =>
			writeAudit(tx, {
				module: "bookkeeping",
				actorType: "USER",
				action: "TEST",
				entityType: "X",
				entityId: "1",
				summary: "s",
			}),
		);
		expect(id.id).toBeTruthy();
		await refused(
			"UPDATE auditEvent",
			"auditEvent is append-only: UPDATE",
			() => sql(f, [`UPDATE "auditEvent" SET "summary" = 'changed'`]),
		);
		await refused(
			"DELETE auditEvent",
			"auditEvent is append-only: DELETE",
			() => sql(f, [`DELETE FROM "auditEvent"`]),
		);
	});
});

describe("G5 ledger_reversal_guard", () => {
	let f: Fixture;
	let original: string;
	beforeAll(async () => {
		f = await fixture("g5");
		original = await manual(f, "rv", "2026-11-05", [
			["6250", "DEBIT", 400n],
			["3000", "CREDIT", 400n],
		]);
	});
	afterAll(() => f.close());

	test("a real reversal posts, a second reversal of the same entry is refused", async () => {
		const first = await f.db.$transaction((tx) =>
			reverse(tx, original, { date: "2026-11-06", reason: "wrong" }, USER),
		);
		expect(first.created).toBe(true);
		await refused(
			"second reversal of the same entry",
			"journalEntry_reversesId_key",
			() =>
				draft(
					f,
					"rv-2nd",
					"2026-11-07",
					[
						["6250", "CREDIT", 400n],
						["3000", "DEBIT", 400n],
					],
					{ reversesId: original, source: "REVERSAL" },
				),
		);
		const revId = first.entryId;
		await refused(
			"reversal of a reversal",
			"a reversal cannot be reversed",
			async () => {
				const id = await draft(
					f,
					"rv-of-rv",
					"2026-11-08",
					[
						["6250", "DEBIT", 400n],
						["3000", "CREDIT", 400n],
					],
					{ reversesId: revId, source: "REVERSAL" },
				);
				await flip(f, id);
			},
		);
	});

	test("a reversal whose lines do not mirror the original is refused", async () => {
		const o = await manual(f, "rv-b", "2026-11-05", [
			["6250", "DEBIT", 400n],
			["3000", "CREDIT", 400n],
		]);
		const bad = await draft(
			f,
			"rv-bad",
			"2026-11-06",
			[
				["6250", "CREDIT", 399n],
				["3000", "DEBIT", 399n],
			],
			{ reversesId: o, source: "REVERSAL" },
		);
		await refused(
			"reversal for 399 of a 400 entry",
			"do not mirror the original",
			() => flip(f, bad),
		);
		const o2 = await manual(f, "rv-c", "2026-11-05", [
			["6250", "DEBIT", 400n],
			["3000", "CREDIT", 400n],
		]);
		const wrongSide = await draft(
			f,
			"rv-side",
			"2026-11-06",
			[
				["6250", "DEBIT", 400n],
				["3000", "CREDIT", 400n],
			],
			{ reversesId: o2, source: "REVERSAL" },
		);
		await refused(
			"reversal with the same sides, not swapped",
			"do not mirror the original",
			() => flip(f, wrongSide),
		);
	});

	test("reversing a DRAFT entry is refused", async () => {
		const d = await draft(f, "rv-draft", "2026-11-05", [
			["6250", "DEBIT", 1n],
			["3000", "CREDIT", 1n],
		]);
		const r = await draft(
			f,
			"rv-of-draft",
			"2026-11-06",
			[
				["6250", "CREDIT", 1n],
				["3000", "DEBIT", 1n],
			],
			{ reversesId: d, source: "REVERSAL" },
		);
		await refused("reversal of a DRAFT", "must exist and be POSTED", () =>
			flip(f, r),
		);
	});
});

describe("G7 ledger_account_guard", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("g7");
		await manual(f, "ac", "2026-11-05", [
			["6250", "DEBIT", 300n],
			["3000", "CREDIT", 300n],
		]);
	});
	afterAll(() => f.close());

	test("type, subtype, currency and system role are frozen once the account has lines", async () => {
		await refused(
			"change type of an account with lines",
			"G7 ledger_account_guard",
			() =>
				f.db.ledgerAccount.update({
					where: { id: acct(f, "6250") },
					data: { type: "ASSET", subtype: "CURRENT_ASSET" },
				}),
		);
		await refused(
			"set currency on an account with lines",
			"G7 ledger_account_guard",
			() =>
				f.db.ledgerAccount.update({
					where: { id: acct(f, "6250") },
					data: { currency: "EUR" },
				}),
		);
	});

	test("the same change on an account with no lines is allowed (opposite)", async () => {
		await f.db.ledgerAccount.update({
			where: { id: acct(f, "6200") },
			data: { type: "ASSET", subtype: "CURRENT_ASSET" },
		});
		await f.db.ledgerAccount.update({
			where: { id: acct(f, "6200") },
			data: { type: "EXPENSE", subtype: "OPERATING_EXPENSE" },
		});
	});

	test("an account with a balance and a system account cannot be archived; a zero one can", async () => {
		await refused(
			"archive account with balance 300",
			"cannot be archived",
			() =>
				f.db.ledgerAccount.update({
					where: { id: acct(f, "6250") },
					data: { archivedAt: new Date() },
				}),
		);
		await refused(
			"archive a system account",
			"system account cannot be archived",
			() =>
				f.db.ledgerAccount.update({
					where: { id: acct(f, "1100") },
					data: { archivedAt: new Date() },
				}),
		);
		await f.db.ledgerAccount.update({
			where: { id: acct(f, "6150") },
			data: { archivedAt: new Date() },
		});
	});

	test("a system account cannot be deleted even with no lines; an unused ordinary account can (opposite)", async () => {
		await refused(
			"delete the Accounts Receivable system account (no lines)",
			"system account 1100 (Accounts Receivable) cannot be deleted",
			() => f.db.ledgerAccount.delete({ where: { id: acct(f, "1100") } }),
		);
		await refused(
			"delete an ordinary account that has lines",
			"Foreign key constraint",
			() => f.db.ledgerAccount.delete({ where: { id: acct(f, "6250") } }),
		);
		await f.db.ledgerAccount.delete({ where: { id: acct(f, "6650") } });
		expect(await f.db.ledgerAccount.count({ where: { isSystem: true } })).toBe(
			10,
		);
	});
});

describe("G13 number_sequence_guard", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("g13");
		await manual(f, "n1", "2026-11-05", [
			["6250", "DEBIT", 10n],
			["3000", "CREDIT", 10n],
		]);
	});
	afterAll(() => f.close());

	test("the sequence cannot move backwards, be renamed or deleted; forward and prefix changes are allowed (opposite)", async () => {
		await refused("rewind ENTRY from 2 to 1", "cannot move backwards", () =>
			f.db.numberSequence.update({
				where: { key: "ENTRY" },
				data: { nextValue: 1 },
			}),
		);
		await refused("rename the ENTRY sequence", "cannot be renamed", () =>
			f.db.numberSequence.update({
				where: { key: "ENTRY" },
				data: { key: "JOURNAL" },
			}),
		);
		await refused("delete the ENTRY sequence", "cannot be deleted", () =>
			f.db.numberSequence.delete({ where: { key: "ENTRY" } }),
		);
		await refused(
			"delete every sequence with raw SQL",
			"cannot be deleted",
			() => sql(f, [`DELETE FROM "numberSequence"`]),
		);
		await f.db.numberSequence.update({
			where: { key: "INVOICE" },
			data: { prefix: "INVOICE-", nextValue: 100 },
		});
		const next = await manual(f, "n2", "2026-11-05", [
			["6250", "DEBIT", 20n],
			["3000", "CREDIT", 20n],
		]);
		const entry = await f.db.journalEntry.findUniqueOrThrow({
			where: { id: next },
		});
		expect(entry.number).toBe("JE-000002");
	});
});

describe("G8 ledger_settings_guard", () => {
	test("the settings row cannot be deleted, so the base currency and lock dates cannot be bypassed", async () => {
		const f = await fixture("g8del");
		await refused(
			"delete the ledgerSettings singleton",
			"cannot be deleted",
			() => f.db.ledgerSettings.delete({ where: { id: "ledger" } }),
		);
		await refused(
			"delete the ledgerSettings singleton with raw SQL as USER",
			"cannot be deleted",
			() => sql(f, [`DELETE FROM "ledgerSettings"`]),
		);
		expect(await f.db.ledgerSettings.count()).toBe(1);
		await f.close();
	});

	test("base currency can change before the first post and not after", async () => {
		const f = await fixture("g8a");
		await f.db.ledgerSettings.update({
			where: { id: "ledger" },
			data: { baseCurrency: "EUR" },
		});
		await f.db.ledgerSettings.update({
			where: { id: "ledger" },
			data: { baseCurrency: "USD" },
		});
		await manual(f, "g8", "2026-11-05", [
			["6250", "DEBIT", 10n],
			["3000", "CREDIT", 10n],
		]);
		await refused(
			"change base currency after the first post",
			"G8 ledger_settings_guard",
			() =>
				f.db.ledgerSettings.update({
					where: { id: "ledger" },
					data: { baseCurrency: "EUR" },
				}),
		);
		await refused("clear firstPostedAt", "firstPostedAt is set once", () =>
			f.db.ledgerSettings.update({
				where: { id: "ledger" },
				data: { firstPostedAt: null },
			}),
		);
		await f.close();
	});

	test("a lock date moves forward freely and backward only with reopen", async () => {
		const f = await fixture("g8b");
		await f.db.ledgerSettings.update({
			where: { id: "ledger" },
			data: {
				lockDate: new Date("2026-10-31T00:00:00.000Z"),
				hardLockDate: new Date("2026-09-30T00:00:00.000Z"),
			},
		});
		await f.db.ledgerSettings.update({
			where: { id: "ledger" },
			data: { hardLockDate: new Date("2026-10-15T00:00:00.000Z") },
		});
		await refused(
			"lower the hard lock date without reopen",
			"needs the reopen permission",
			() =>
				f.db.ledgerSettings.update({
					where: { id: "ledger" },
					data: { hardLockDate: new Date("2026-08-31T00:00:00.000Z") },
				}),
		);
		await refused(
			"clear the hard lock date without reopen",
			"needs the reopen permission",
			() =>
				f.db.ledgerSettings.update({
					where: { id: "ledger" },
					data: { hardLockDate: null },
				}),
		);
		await refused(
			"lower the soft lock date without reopen",
			"needs the reopen permission",
			() =>
				f.db.ledgerSettings.update({
					where: { id: "ledger" },
					data: { lockDate: new Date("2026-10-15T00:00:00.000Z") },
				}),
		);
		await refused(
			"reopen asked by an AGENT",
			"needs the reopen permission",
			() =>
				sql(f, [`UPDATE "ledgerSettings" SET "hardLockDate" = '2026-08-31'`], {
					type: "AGENT",
					id: "a",
					reopen: true,
				}),
		);
		await sql(
			f,
			[`UPDATE "ledgerSettings" SET "hardLockDate" = '2026-08-31'`],
			{ type: "USER", id: "owner", reopen: true },
		);
		expect(
			(
				await f.db.ledgerSettings.findUniqueOrThrow({ where: { id: "ledger" } })
			).hardLockDate
				?.toISOString()
				.slice(0, 10),
		).toBe("2026-08-31");
		await f.close();
	});
});

describe("CHECK constraints observed", () => {
	let f: Fixture;
	beforeAll(async () => {
		f = await fixture("chk");
	});
	afterAll(() => f.close());

	test("a line cannot carry both a debit and a credit", async () => {
		await refused(
			"debit and credit on one line",
			"journalLine_one_side_chk",
			() =>
				sql(f, [
					`INSERT INTO "journalEntry" ("id","date","source","baseCurrency","createdById") VALUES ('chk1','2026-11-05','MANUAL','USD','u')`,
					`INSERT INTO "journalLine" ("id","entryId","lineNo","accountId","currency","debitMinor","creditMinor","baseDebitMinor","fxRate","fxOrigin","fxRateAt") VALUES ('chkl','chk1',1,'${acct(f, "6250")}','USD',5,5,0,1,'IDENTITY',now())`,
				]),
		);
	});

	test("a hard lock later than the soft lock is refused", async () => {
		await refused(
			"hardLockDate after lockDate",
			"ledgerSettings_lock_order_chk",
			() =>
				f.db.ledgerSettings.update({
					where: { id: "ledger" },
					data: {
						lockDate: new Date("2026-10-01T00:00:00.000Z"),
						hardLockDate: new Date("2026-10-02T00:00:00.000Z"),
					},
				}),
		);
	});

	test("an account whose subtype is not in its type family is refused", async () => {
		await refused(
			"ASSET with subtype REVENUE",
			"ledgerAccount_type_family_chk",
			() =>
				f.db.ledgerAccount.create({
					data: {
						code: "9999",
						name: "bad",
						type: "ASSET",
						subtype: "REVENUE",
					},
				}),
		);
	});

	test("a second ledgerSettings row is refused", async () => {
		await refused(
			"settings id other than ledger",
			"ledgerSettings_singleton_chk",
			() =>
				f.db.ledgerSettings.create({
					data: { id: "other", baseCurrency: "USD", timezone: "UTC" },
				}),
		);
	});
});
