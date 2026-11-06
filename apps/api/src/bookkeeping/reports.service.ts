import type { Db } from "@app/db";
import { businessToday } from "@app/modules/bookkeeping/engine";
import { dateToDateOnly } from "@app/modules/bookkeeping/ledger/posting";
import { trialBalanceRoster } from "@app/modules/bookkeeping/ledger/queries";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type {
	accountType,
	trialBalanceInput,
} from "./bookkeeping.contracts";
import { BookkeepingAccess } from "./bookkeeping-access";

type AccountType = z.infer<typeof accountType>;

@Injectable()
export class ReportsService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(BookkeepingAccess) private readonly access: BookkeepingAccess,
	) {}

	/**
	 * Every account of the chart appears, zeros included (an archived account only when it still
	 * carries a balance). Each account shows as a debit OR a credit balance. The proof is that the
	 * two columns add up to the same total; the screen shows it as a tick or a red mismatch.
	 */
	async trialBalance(userId: string, input: z.infer<typeof trialBalanceInput>) {
		await this.access.assert(userId, "bookkeeping.reports");

		const settings = await this.db.ledgerSettings.findUnique({
			where: { id: "ledger" },
		});
		if (!settings) {
			throw new NotFoundException(
				"The books are not set up on this deploy yet.",
			);
		}

		const asOf = input.asOf ?? businessToday(settings.timezone);
		const [roster, drafts] = await Promise.all([
			trialBalanceRoster(this.db, asOf),
			this.db.journalEntry.count({ where: { status: "DRAFT" } }),
		]);

		let totalDebit = 0n;
		let totalCredit = 0n;

		const rows = roster
			.map((row) => {
				const net = row.debitBase - row.creditBase;
				const debit = net > 0n ? net : 0n;
				const credit = net < 0n ? -net : 0n;
				totalDebit += debit;
				totalCredit += credit;

				return {
					accountId: row.accountId,
					code: row.code,
					name: row.name,
					type: row.type as AccountType,
					archived: row.archived,
					debitBase: debit.toString(),
					creditBase: credit.toString(),
				};
			})
			.filter(
				(row) => !row.archived || row.debitBase !== "0" || row.creditBase !== "0",
			);

		return {
			baseCurrency: settings.baseCurrency,
			timezone: settings.timezone,
			asOf,
			generatedAt: new Date().toISOString(),
			lockDate: settings.lockDate ? dateToDateOnly(settings.lockDate) : null,
			draftEntries: drafts,
			rows,
			totalDebitBase: totalDebit.toString(),
			totalCreditBase: totalCredit.toString(),
			balanced: totalDebit === totalCredit,
		};
	}
}
