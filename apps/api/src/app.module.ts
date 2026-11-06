import { auth } from "@app/auth/auth";
import { Module, type ModuleMetadata } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { AccountModule } from "./account/account.module";
import { ActivitiesModule } from "./activities/activities.module";
import { AgentModule } from "./agent/agent.module";
import { ApiKeysModule } from "./api-keys/api-keys.module";
import { ArchiveModule } from "./archive/archive.module";
import { AuthModule } from "./auth/auth.module";
import { BackfillModule } from "./backfill/backfill.module";
import { AppCacheModule } from "./cache/cache.module";
import { CompaniesModule } from "./companies/companies.module";
import { validateEnv } from "./config/env.validation";
import { ContactsModule } from "./contacts/contacts.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { CrmModule } from "./crm/crm.module";
import { CurrencyModule } from "./currency/currency.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { DealsModule } from "./deals/deals.module";
import { EnrichmentModule } from "./enrichment/enrichment.module";
import { FieldsModule } from "./fields/fields.module";
import { GoogleModule } from "./google/google.module";
import { HealthModule } from "./health/health.module";
import { LoggingModule } from "./logging/logging.module";
import { logAuthRoute } from "./logging/request-logger.middleware";
import { MailboxModule } from "./mailbox/mailbox.module";
import { McpModule } from "./mcp/mcp.module";
import { MicrosoftModule } from "./microsoft/microsoft.module";
import { ModulesModule } from "./modules/modules.module";
import { enabledApiModules } from "./modules/registry";
import { SavedViewsModule } from "./saved-views/saved-views.module";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { SearchModule } from "./search/search.module";
import { SettingsModule } from "./settings/settings.module";
import { SlackModule } from "./slack/slack.module";
import { SsoModule } from "./sso/sso.module";
import { SyncModule } from "./sync/sync.module";
import { TelemetryModule } from "./telemetry/telemetry.module";
import { TrackingModule } from "./tracking/tracking.module";
import { TrpcModule } from "./trpc/trpc.module";
import { UsersModule } from "./users/users.module";
import { WorkspaceModule } from "./workspace/workspace.module";

/**
 * Mounted in every deploy, whatever modules are switched on. That still includes
 * the CRM's Nest modules; see `modules/registry.ts` for why.
 */
export const ALWAYS_MOUNTED: NonNullable<ModuleMetadata["imports"]> = [
	LoggingModule,
	ConfigModule.forRoot({
		isGlobal: true,
		cache: true,
		validate: validateEnv,
	}),
	AppCacheModule,
	DatabaseModule,
	CrmModule,
	BetterAuthModule.forRoot({ auth, middleware: logAuthRoute }),
	AuthModule,
	HealthModule,
	TrpcModule,
	AccountModule,
	UsersModule,
	ApiKeysModule,
	CompaniesModule,
	ContactsModule,
	ConversationsModule,
	CurrencyModule,
	DealsModule,
	FieldsModule,
	ActivitiesModule,
	AgentModule,
	EnrichmentModule,
	DashboardModule,
	SearchModule,
	MailboxModule,
	GoogleModule,
	MicrosoftModule,
	McpModule,
	SyncModule,
	SchedulerModule,
	SettingsModule,
	WorkspaceModule,
	SsoModule,
	SlackModule,
	BackfillModule,
	TelemetryModule,
	TrackingModule,
	ArchiveModule,
	SavedViewsModule,
	ModulesModule,
];

@Module({
	imports: [...ALWAYS_MOUNTED, ...enabledApiModules()],
})
export class AppModule {}
