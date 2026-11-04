import { Module } from "@nestjs/common";
import { CompaniesModule } from "../companies/companies.module";
import { ContactsModule } from "../contacts/contacts.module";
import { DealsModule } from "../deals/deals.module";
import { ArchiveRetentionController } from "./archive-retention.controller";
import { ArchiveRetentionService } from "./archive-retention.service";

@Module({
	imports: [CompaniesModule, ContactsModule, DealsModule],
	controllers: [ArchiveRetentionController],
	providers: [ArchiveRetentionService],
	exports: [ArchiveRetentionService],
})
export class ArchiveModule {}
