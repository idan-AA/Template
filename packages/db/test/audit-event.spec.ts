import { describe, expect, it } from "bun:test";
import { writeAudit } from "../src/audit";
import { db } from "../src/client";

/**
 * The audit trail may only grow. Every case runs inside a transaction that is
 * rolled back, so the test leaves no rows behind (it could not delete them) and
 * a broken guard could not wipe a real table.
 */

class Rollback extends Error {}

async function inRolledBackTransaction<T>(
	body: (
		tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
	) => Promise<T>,
): Promise<T> {
	let result: T | undefined;

	await db
		.$transaction(async (tx) => {
			result = await body(tx);
			throw new Rollback();
		})
		.catch((error: unknown) => {
			if (!(error instanceof Rollback)) throw error;
		});

	return result as T;
}

const EVENT = {
	module: "core",
	actorType: "USER",
	actorId: "user-1",
	actorLabel: "Ada",
	action: "MEMBER_ROLE_CHANGED",
	entityType: "member",
	entityId: "member-1",
	summary: "Role changed from member to admin",
	before: { role: "member" },
	after: { role: "admin" },
} as const;

describe("writeAudit", () => {
	it("appends a row with everything it was given", async () => {
		const row = await inRolledBackTransaction(async (tx) => {
			const { id } = await writeAudit(tx, { ...EVENT, requestId: "req-1" });
			return tx.auditEvent.findUniqueOrThrow({ where: { id } });
		});

		expect(row).toMatchObject({
			module: "core",
			actorType: "USER",
			actorId: "user-1",
			actorLabel: "Ada",
			action: "MEMBER_ROLE_CHANGED",
			entityType: "member",
			entityId: "member-1",
			before: { role: "member" },
			after: { role: "admin" },
			reason: null,
			requestId: "req-1",
		});
		expect(row.at).toBeInstanceOf(Date);
	});

	it("keeps nulls as nulls when the optional fields are left out", async () => {
		const row = await inRolledBackTransaction(async (tx) => {
			const { id } = await writeAudit(tx, {
				module: "core",
				actorType: "SYSTEM",
				action: "LOCK_CHANGED",
				entityType: "period",
				entityId: "p1",
				summary: "Locked",
			});
			return tx.auditEvent.findUniqueOrThrow({ where: { id } });
		});

		expect(row.actorId).toBeNull();
		expect(row.before).toBeNull();
		expect(row.after).toBeNull();
	});

	it("disappears with the transaction it was written in", async () => {
		const before = await db.auditEvent.count({ where: { entityId: "gone-1" } });

		await inRolledBackTransaction((tx) =>
			writeAudit(tx, { ...EVENT, entityId: "gone-1" }),
		);

		expect(await db.auditEvent.count({ where: { entityId: "gone-1" } })).toBe(
			before,
		);
	});
});

describe("the audit trail is append-only (guards, by observation)", () => {
	it("refuses an UPDATE", async () => {
		await expect(
			inRolledBackTransaction(async (tx) => {
				const { id } = await writeAudit(tx, EVENT);
				await tx.$executeRaw`UPDATE "auditEvent" SET "summary" = 'rewritten' WHERE "id" = ${id}`;
			}),
		).rejects.toThrow("auditEvent is append-only: UPDATE is not allowed");
	});

	it("refuses a DELETE", async () => {
		await expect(
			inRolledBackTransaction(async (tx) => {
				const { id } = await writeAudit(tx, EVENT);
				await tx.$executeRaw`DELETE FROM "auditEvent" WHERE "id" = ${id}`;
			}),
		).rejects.toThrow("auditEvent is append-only: DELETE is not allowed");
	});

	it("refuses a TRUNCATE", async () => {
		await expect(
			inRolledBackTransaction(async (tx) => {
				await tx.$executeRawUnsafe(`TRUNCATE "auditEvent"`);
			}),
		).rejects.toThrow("auditEvent is append-only: TRUNCATE is not allowed");
	});

	it("is wired by exactly the two triggers the migration wrote", async () => {
		const triggers = await db.$queryRaw<{ tgname: string }[]>`
			SELECT tgname FROM pg_trigger
			WHERE tgrelid = '"auditEvent"'::regclass AND NOT tgisinternal
			ORDER BY tgname
		`;

		expect(triggers.map((row) => row.tgname)).toEqual([
			"audit_append_only",
			"audit_no_truncate",
		]);
	});
});
