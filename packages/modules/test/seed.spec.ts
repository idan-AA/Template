import { describe, expect, it } from "bun:test";
import { db } from "@app/db";
import { seedCore } from "@app/db/seeds/core";
import { orderModules } from "../src/client-config";
import { loadServer } from "../src/servers";

/**
 * The seed hook: core first, then each enabled module, and every one idempotent.
 * It all runs inside a transaction that is rolled back, so the test leaves no
 * demo data in the database it runs against.
 */

class Rollback extends Error {}

type Client = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/** Every column of every table the seeds write, in a stable order, as text. */
async function snapshot(tx: Client): Promise<Record<string, string>> {
	const tables = {
		appSetting: await tx.appSetting.findMany({ orderBy: { id: "asc" } }),
		exchangeRate: await tx.exchangeRate.findMany({ orderBy: { id: "asc" } }),
		company: await tx.company.findMany({ orderBy: { id: "asc" } }),
		contact: await tx.contact.findMany({ orderBy: { id: "asc" } }),
		deal: await tx.deal.findMany({ orderBy: { id: "asc" } }),
		dealContact: await tx.dealContact.findMany({
			orderBy: [{ dealId: "asc" }, { contactId: "asc" }],
		}),
		activity: await tx.activity.findMany({ orderBy: { id: "asc" } }),
		fieldDefinition: await tx.fieldDefinition.findMany({
			orderBy: { id: "asc" },
		}),
		fieldOption: await tx.fieldOption.findMany({ orderBy: { id: "asc" } }),
		fieldValue: await tx.fieldValue.findMany({ orderBy: { id: "asc" } }),
		user: await tx.user.findMany({ orderBy: { id: "asc" } }),
	};

	return Object.fromEntries(
		Object.entries(tables).map(([name, rows]) => [name, JSON.stringify(rows)]),
	);
}

async function inRolledBackTransaction(
	body: (tx: Client) => Promise<void>,
): Promise<void> {
	await db
		.$transaction(
			async (tx) => {
				await body(tx);
				throw new Rollback();
			},
			{ timeout: 180_000, maxWait: 30_000 },
		)
		.catch((error) => {
			if (!(error instanceof Rollback)) throw error;
		});
}

describe("seeding", () => {
	it("runs the core seed and the crm seed twice and the second run changes nothing", async () => {
		const crm = await loadServer("crm");
		const seedCrm = crm.seed;
		expect(seedCrm).toBeDefined();

		const runs: Array<Record<string, string>> = [];

		await inRolledBackTransaction(async (tx) => {
			for (let run = 0; run < 2; run++) {
				await seedCore(tx);
				await seedCrm?.(tx);
				runs.push(await snapshot(tx));
			}
		});

		const [first, second] = runs;
		expect(first).toBeDefined();

		for (const table of Object.keys(first ?? {})) {
			expect(second?.[table], `${table} changed on the second run`).toBe(
				first?.[table],
			);
		}

		// And the first run really did seed something, so "unchanged" means something.
		expect(JSON.parse(first?.company ?? "[]").length).toBeGreaterThan(0);
		expect(JSON.parse(first?.deal ?? "[]").length).toBeGreaterThan(0);
		expect(JSON.parse(first?.exchangeRate ?? "[]").length).toBeGreaterThan(0);
	}, 240_000);

	it("leaves nothing behind once the test is over", async () => {
		expect(await db.company.count({ where: { domain: "acme.test" } })).toBe(0);
	});
});

describe("the seed order", () => {
	it("seeds a module's requirements before the module", () => {
		expect(orderModules(["bookkeeping", "crm"]).map((m) => m.id)).toEqual([
			"bookkeeping",
			"crm",
		]);
	});

	it("gives bookkeeping a server half with a seed, so the runner seeds the ledger", async () => {
		const books = await loadServer("bookkeeping");

		expect(books.seed).toBeInstanceOf(Function);
	});
});
