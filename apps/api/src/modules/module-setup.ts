import type { Prisma } from "@app/db";
import { activeClient } from "@app/modules";
import type { ModuleId } from "@app/modules/registry";

/**
 * What a module needs in the database before it can work, run once inside the
 * transaction that first switches it on. Idempotent, and NEVER demo data: a
 * module's `seed` (the CRM's is a pile of fake companies and deals) is for local
 * development and must not run on a client's real database.
 *
 * Today only bookkeeping has any: its ledger settings, number sequences, system
 * accounts and default chart, which every posting needs.
 */
export type ModuleSetup = (tx: Prisma.TransactionClient) => Promise<void>;

export const MODULE_SETUP: Partial<Record<ModuleId, ModuleSetup>> = {
	bookkeeping: async (tx) => {
		const { seedLedger } = await import("@app/db/seeds/bookkeeping");
		const { locale } = activeClient().config;

		await seedLedger(tx, {
			baseCurrency: locale.currency,
			timezone: locale.timezone,
		});
	},
};
