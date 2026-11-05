import { defineServer } from "../src/define-server";
import { activeClient } from "../src/runtime";

export default defineServer({
	/**
	 * The ledger settings, number sequences, system accounts and the default
	 * chart. The base currency and time zone come from the client's `locale`;
	 * the base currency locks at the first posting, so this runs before any.
	 */
	async seed(client) {
		const { seedLedger } = await import("@app/db/seeds/bookkeeping");
		const { locale } = activeClient().config;
		await seedLedger(client, {
			baseCurrency: locale.currency,
			timezone: locale.timezone,
		});
	},
});
