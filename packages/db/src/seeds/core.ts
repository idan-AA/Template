import { DEFAULT_REPORTING_CURRENCY } from "../currency";
import type { Prisma } from "../generated/prisma/client";
import { RateSource } from "../generated/prisma/enums";
import { SETTINGS_ID } from "../settings";

/** Placeholder rates against USD so converted figures work before the rates cron has run. */
export const SEED_RATES: ReadonlyMap<string, number> = new Map(
	Object.entries({
		EUR: 1.09,
		GBP: 1.27,
		CAD: 0.73,
		AUD: 0.66,
		JPY: 0.0067,
	}),
);

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Data every deploy needs whatever modules it runs: the settings row and a set
 * of starting exchange rates. Idempotent, and it never overwrites a rate the
 * rates cron has already fetched.
 */
export async function seedCore(
	client: Prisma.TransactionClient,
): Promise<number> {
	const asOf = new Date(Date.now() - DAY_MS);

	await client.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: {
			id: SETTINGS_ID,
			reportingCurrency: DEFAULT_REPORTING_CURRENCY,
		},
		update: {},
		select: { id: true },
	});

	for (const [quoteCurrency, rate] of SEED_RATES) {
		await client.exchangeRate.upsert({
			where: {
				baseCurrency_quoteCurrency_source: {
					baseCurrency: "USD",
					quoteCurrency,
					source: RateSource.FETCHED,
				},
			},
			create: {
				baseCurrency: "USD",
				quoteCurrency,
				rate,
				asOf,
				source: RateSource.FETCHED,
				provider: "seed",
			},
			update: {},
		});
	}

	return SEED_RATES.size;
}
