import type { Db } from "@app/db";
import { businessToday } from "@app/modules/bookkeeping/engine";
import { dateToDateOnly } from "@app/modules/bookkeeping/ledger/posting";
import { trialBalanceRoster } from "@app/modules/bookkeeping/ledger/queries";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { naturalBalance } from "./accounts.service";
import { BookkeepingAccess } from "./bookkeeping-access";

@Injectable()
export class SummaryService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(BookkeepingAccess) private readonly access: BookkeepingAccess,
	) {}

	async granted(userId: string) {
		const { role, keys } = await this.access.grantedKeys(userId);

		return { role, granted: keys as string[] };
	}

	/**
	 * The Books home, round A version: what needs a person's attention in the ledger itself. The
	 * profit and cash cards arrive with documents, payments and banking (a profit figure with no
	 * invoices behind it would be a made-up number). Ledger figures are only sent to people who
	 * may see the ledger.
	 */
	async summary(userId: string) {
		await this.access.assert(userId, "bookkeeping.read");

		const settings = await this.db.ledgerSettings.findUnique({
			where: { id: "ledger" },
		});
		if (!settings) {
			throw new NotFoundException(
				"The books are not set up on this deploy yet.",
			);
		}

		const today = businessToday(settings.timezone);
		const monthStart = `${today.slice(0, 8)}01`;
		const canSeeLedger = await this.access.has(userId, "bookkeeping.reports");

		const [entriesThisMonth, draftEntries, roster] = await Promise.all([
			this.db.journalEntry.count({
				where: { status: "POSTED", date: { gte: new Date(`${monthStart}T00:00:00.000Z`) } },
			}),
			this.db.journalEntry.count({ where: { status: "DRAFT" } }),
			canSeeLedger ? trialBalanceRoster(this.db) : Promise.resolve(null),
		]);

		const balanceOf = (role: string): string | null => {
			if (!roster) return null;
			const row = roster.find((item) => item.systemRole === role);
			if (!row) return null;

			return naturalBalance(row.type, row.debitBase, row.creditBase).toString();
		};

		return {
			baseCurrency: settings.baseCurrency,
			timezone: settings.timezone,
			today,
			setupComplete: settings.setupCompletedAt !== null,
			lockDate: settings.lockDate ? dateToDateOnly(settings.lockDate) : null,
			suspenseBalance: balanceOf("SUSPENSE"),
			openingBalanceEquity: balanceOf("OPENING_BALANCE_EQUITY"),
			entriesThisMonth,
			draftEntries,
			canSeeLedger,
		};
	}
}
