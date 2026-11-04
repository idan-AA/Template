import type { Db } from "@app/db";
import { readArchiveRetentionDays } from "@app/db/settings";
import { Injectable, Logger } from "@nestjs/common";
import { CompaniesService } from "../companies/companies.service";
import { ContactsService } from "../contacts/contacts.service";
import { InjectDatabase } from "../database/database.constants";
import { DealsService } from "../deals/deals.service";

const DAY_MS = 24 * 60 * 60_000;

@Injectable()
export class ArchiveRetentionService {
	private readonly logger = new Logger(ArchiveRetentionService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly companies: CompaniesService,
		private readonly contacts: ContactsService,
		private readonly deals: DealsService,
	) {}

	async run() {
		const retentionDays = await readArchiveRetentionDays(this.db);
		const before = new Date(Date.now() - retentionDays * DAY_MS);

		const [companies, contacts, deals] = await Promise.all([
			this.companies.purgeExpired(before),
			this.contacts.purgeExpired(before),
			this.deals.purgeExpired(before),
		]);

		this.logger.log({
			message: "Archive retention swept",
			retentionDays,
			companies: companies.succeeded,
			companiesSkipped: companies.skipped,
			contacts: contacts.succeeded,
			contactsSkipped: contacts.skipped,
			deals: deals.succeeded,
			dealsSkipped: deals.skipped,
		});

		return { retentionDays, companies, contacts, deals };
	}
}
