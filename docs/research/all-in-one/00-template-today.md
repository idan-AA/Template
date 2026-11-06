# Template today: what the product can do, from code

Date: 2026-11-06. Source of truth: the code under `packages/db`, `apps/api`, `apps/app`, `apps/agent`, `packages/modules`. The plan docs under `docs/plan` were read only to find claims to verify; where they disagree with code, code wins and the disagreement is called out in section 11.

Shorthand used below: YES means a user can do it end to end in the UI or API today. PARTIAL means the data model or engine exists but the user-facing path is incomplete, or the feature exists only for one of several expected cases. NO means nothing in code.

Repository shape:

- `apps/app`: Next.js web app (routes under `apps/app/app`).
- `apps/api`: NestJS with tRPC routers (`*.router.ts`) exposed also as a REST bridge at `/rest` via `restMeta` (`apps/api/src/trpc/openapi.ts`), plus a few plain controllers.
- `apps/agent`: an `eve` agent (tools, subagents, one cron schedule, channels).
- `packages/db`: Prisma, three schema files under `packages/db/prisma/schema/`.
- `packages/modules`: module registry (`crm`, `bookkeeping`) and the bookkeeping ledger engine.
- `packages/mcp-integrations`: catalog of MCP vendors.
- `clients/`: per-client config (`default` has no modules, `practice` has `crm` and `bookkeeping`).

---

## 1. Data model (Prisma)

Files: `packages/db/prisma/schema/base.prisma` (core, 1199 lines), `crm.prisma` (590 lines), `bookkeeping.prisma` (181 lines). Every table is migrated in every deploy; modules gate code, not schema.

### 1.1 Auth and workspace (base.prisma)

| Model | Purpose | Key fields and relations |
|---|---|---|
| `User` | A person who can sign in | `email` unique, `passwordChangeRequired`, `removedAt` (soft removal keeps authorship); relations to owned companies, contacts, deals, activities, mailbox syncs, saved views, agent definitions, versions, runs, conversations, MCP connections, API keys |
| `Session` | better-auth session | `token`, `expiresAt`, `activeOrganizationId` |
| `Account` | better-auth credential or OAuth account | `providerId`, `accessToken`, `refreshToken`, `password` |
| `Verification` | better-auth verification tokens | `identifier`, `value`, `expiresAt` |
| `RateLimit` | better-auth rate limiter | `key`, `count`, `lastRequest` |
| `Organization` | The single workspace (one per deploy, `WORKSPACE_ID`) | `name`, `slug`, `logo`, `website`; members, invitations, MCP connections |
| `Member` | Workspace membership | `role` plain string (owner, admin, member, plus module roles), unique per org and user |
| `Invitation` | better-auth invitation table | `email`, `role`, `status`, `expiresAt`. Present in schema; the product adds members directly with a first password instead (`apps/api/src/workspace/workspace.service.ts`), no invite email path |
| `SsoProvider` | OIDC or SAML provider | `issuer`, `oidcConfig`, `samlConfig`, `domain`, `providerId` unique |
| `Apikey` | better-auth API keys | `key`, `prefix`, `permissions`, rate limit fields, `expiresAt` |
| `WorkspaceProfile` | Agent-written profile of the customer's own company | `website`, `narrative`, `sections` Json, `refreshedAt` |

### 1.2 CRM (crm.prisma)

Enums: `DealStage` = DEMO_BOOKED, QUALIFIED_TO_BUY, UNQUALIFIED_TO_BUY, DECISION_MAKER_BOUGHT_IN, CONTRACT_SENT, CLOSED_WON, CLOSED_LOST (one fixed pipeline). `ActivityType` = NOTE, CALL, EMAIL, MEETING, TASK, STAGE_CHANGE, ENRICHMENT. `EnrichmentStatus` = PENDING, RUNNING, COMPLETE, FAILED, SKIPPED. `RecordSource` = MANUAL, IMPORT, EMAIL, CALENDAR, TRACKING. `FactBand` = VERIFIED, PROBABLE, POSSIBLE. `FactStatus` = APPLIED, PROPOSED, DISMISSED, SUPERSEDED.

| Model | Purpose | Key fields and relations |
|---|---|---|
| `Company` | Account record | `name`, `domain` (unique among active), `website`, brand fields (`logoUrl`, `iconUrl`, `brandColor`), `industry`, location, social URLs, `ownerId`, `primaryContactId`, `enrichmentStatus`, `source`, `lastActivityAt`, `archivedAt`; contacts, deals, activities, email threads, calendar events, field values, agent conversations |
| `CompanyEnrichment` | Raw Context.dev payload | `raw` Json, `source` default `context.dev`, `fetchedAt` |
| `Contact` | Person record | `firstName`, `lastName`, `email` (unique among active), `phone`, `title`, `seniority`, `function`, social URLs, `imageUrl`, `enrichmentStatus`, `companyId`, `ownerId`, `source`, `archivedAt`; brief, facts, deals (via DealContact), activities, threads, events, attendance, field values, tracked visitors, form submissions |
| `ContactFact` | One agent-observed claim with evidence | `field`, `value`, `score`, `band`, `evidence` Json, `method`, `sourceUrl`, `status`, `decidedById` |
| `ContactBrief` | Agent-written Background panel | `narrative`, `sections` Json, `score`, `sourceUrl` |
| `Deal` | Opportunity | `name`, `companyId` required, `ownerId` required, `stage`, `stageChangedAt`, `amount` Decimal(14,2), `currency` default USD, `expectedCloseDate`, `closedAt`, `closedReason`, `baseAmount`, `baseCurrency`, `fxRate`, `fxRateAt`, `archivedAt` |
| `DealContact` | Many to many deal and contact with a role | composite id, `role` |
| `Activity` | Timeline entry | `type`, `subject`, `body`, `occurredAt`, `dueAt`, `completedAt`, one of `companyId` / `contactId` / `dealId`, `createdById`, `meta` Json, optional 1:1 link to `EmailThread` or `CalendarEvent` |
| `SuppressedDomain`, `SuppressedContact` | Never create or file records for these | `domain` / `email` id, `reason` |

### 1.3 Custom fields and saved views (base.prisma)

Enums: `FieldEntity` = COMPANY, CONTACT, DEAL. `FieldType` = TEXT, LONG_TEXT, NUMBER, DATE, CHECKBOX, SELECT, URL, EMAIL, PHONE, USER (no MULTI_SELECT).

| Model | Purpose | Key fields |
|---|---|---|
| `FieldDefinition` | Admin-defined property | `entity`, `key` (unique per entity), `label`, `type`, `agentFilled`, `agentBrief`, `required`, `showOnSheet`, `showOnTable`, `showOnFilter`, `position`, `archivedAt` |
| `FieldOption` | SELECT option | `label`, `position`, `archivedAt` |
| `FieldValue` | One value per field per record | typed columns `text`, `number`, `date`, `bool`, `optionId`, `userId`; unique per field and record |
| `SavedView` | Saved list filter set | `entity`, `name`, `shared`, `filters` Json, `ownerId`; unique per entity, owner, name |

### 1.4 Email and calendar sync (crm.prisma)

Enums: `GoogleSyncStatus` = IDLE, RUNNING, NEEDS_RECONNECT, FAILED. `EmailDirection` = INBOUND, OUTBOUND.

| Model | Purpose | Key fields |
|---|---|---|
| `MailboxSync` | Per user, per source sync cursor | `userId`, `source` (gmail, calendar, outlook), `status`, `cursor`, `lastSyncedAt`, `retryAfter`, `autoCreate` |
| `EmailThread` | Thread filed to a company or contact | `rootMessageId`, `subject`, `companyId`, `contactId`, `firstMessageAt`, `lastMessageAt`, `messageCount`; 1:1 Activity |
| `EmailMessage` | Synced message (read only) | `rfcMessageId`, `gmailMessageId`, `outlookMessageId`, `outlookWebLink`, `direction`, `fromEmail`, `recipients` Json, `snippet`, `body`, `sentAt` |
| `CalendarEvent` | Synced Google Calendar event | `iCalUid`, `originalStartTime`, `title`, `location`, `conferenceUrl`, `startsAt`, `endsAt`, `isAllDay`, `status`, `organizerEmail`, `companyId`, `contactId`, `googleEventId`; attendees; 1:1 Activity |
| `CalendarAttendee` | Attendee with CRM match | `email`, `name`, `responseStatus`, `isOrganizer`, `contactId` |

### 1.5 Website tracking and forms (crm.prisma)

Enum `DomainScope` = SITE_AND_SUBDOMAINS, EXACT_HOST.

| Model | Purpose | Key fields |
|---|---|---|
| `TrackedDomain` | Allowed host for the script | `host` unique, `scope`, `pageViews`, `lastSeenAt` |
| `TrackedVisitor` | First-party visitor with first and last touch UTM | `contactId`, `firstSource` ... `firstLanding`, `lastSource` ... `lastLanding` |
| `TrackedEvent` | Raw page view or event | `visitorId`, `type`, `host`, `path`, `referrer`, `label`, `source`, `medium`, `campaign`, `occurredAt` |
| `TrackedPageDaily` | Daily rollup | `day`, `host`, `path`, `views`, `visitors` |
| `TrackingCounter` | Rate counters | `key`, `value`, `expiresAt` |
| `FormSubmission` | Captured HTML form post | `visitorId`, `contactId`, `host`, `path`, `email`, `fields` Json, `firstTouch`, `lastTouch`, `dedupeKey` unique, `filedAt`, `skipReason` |

### 1.6 Agent runtime, builder and deployed agents (base.prisma)

Enums: `AgentConversationKind` = RECORD, BUILDER. `AgentDefinitionStatus` = DRAFT, DEPLOYING, LIVE, PAUSED, ARCHIVED, DELETED. `AgentVersionStatus` = DRAFT, VALIDATING, READY, DEPLOYED, REJECTED. `AgentTriggerType` = MANUAL, SCHEDULE, EVENT, WEBHOOK. `AgentRunStatus` = QUEUED, RUNNING, WAITING_FOR_APPROVAL, SUCCEEDED, FAILED, CANCELLED. `AgentActionStatus` = PLANNED, RUNNING, SUCCEEDED, FAILED, CANCELLED. `AgentConversationPermissionMode` = MANUAL, AUTO, BYPASS. `AgentResponseRating` = UP, DOWN.

| Model | Purpose | Key fields |
|---|---|---|
| `AgentTask` | Enrichment and research work queue | `contactId`/`companyId`/`dealId`, `kind`, `reason`, `payload`, `priority`, `budget`, `attempts`, `dueAt`, `leasedUntil`, `sessionId`, `outcome` |
| `AgentEvent` | Streamed event of a chat session (encrypted body) | `sessionId`, `streamIndex`, `conversationId`, `type`, `data`, `encryptedData` |
| `AgentConversation` | A record chat (RECORD) or private builder chat (BUILDER) | record ids, `userId`, `agentId`, `sessionId`, `continuationToken`, `pendingInputRequest`, `permissionMode`, `title`, `messageCount`, `lastReadAt` |
| `AgentConversationFeedback` | Thumbs up or down on a message | `messageId`, `rating` |
| `AgentConversationShare` | Workspace share link for a chat | `tokenHash`, `scope` WORKSPACE_LINK, `expiresAt`, `revokedAt` |
| `AgentConversationSubmission` | Durable queue of builder messages | `clientRequestId`, `commandType` CHAT or CREATE_AGENT, `message` Json, `status` |
| `AgentConversationAttachment` | Uploaded file bytes on a submission | `name`, `mediaType`, `size`, `content` Bytes |
| `AgentDefinition` | A team agent | `name`, `description`, `status`, `currentVersionId`, `archivedAt`, `deletedAt` |
| `AgentVersion` | Immutable version | `number`, `status`, `instructions`, `manifest` Json, `modelId`, `sandboxPolicy`, `validation`, `sourceConversationId`, `deployedAt` |
| `AgentBuilderArtifact` | Files the builder wrote (`agent/instructions.md`, `agent/manifest.json`, `agent/README.md`) | `path`, `language`, `content`, `previousContent`, `revision`, `status` |
| `AgentTrigger` | MANUAL, SCHEDULE, EVENT or WEBHOOK trigger | `type`, `name`, `config` Json, `enabled`, `nextRunAt`, `lastRunAt` |
| `AgentRun` | One execution | `triggerType`, `status`, `idempotencyKey`, `correlationId`, `input`, `result`, `summary`, token counts, `costUsd`, cancel timestamps |
| `AgentRunEvent` | Ordered run events | `sequence`, `type`, `data` |
| `AgentAction` | Action ledger (idempotent side effects) | `type`, `provider`, `targetType`, `targetId`, `summary`, `status`, `idempotencyKey`, `externalId` |
| `AgentAuditEvent` | Per-agent audit trail | `type`, `actorType`, `before`, `after`, `requestId` |

### 1.7 Connections, Slack and MCP (base.prisma)

Enums: `McpConnectionStatus` = CONNECTING, CONNECTED, ERROR, DISCONNECTED. `McpAccessMode` = READ_ONLY, READ_WRITE. `McpToolReviewState` = PENDING, REVIEWED, CHANGED, REMOVED.

| Model | Purpose | Key fields |
|---|---|---|
| `SlackMemberMatch` | CRM user to Slack user match | `crmUserId` unique, `slackUserId`, `slackHandle`, `slackEmail` |
| `SlackChannel` | Cached channel inventory | `name`, `memberCount`, `isPrivate`, `isMember`, `inviteRequestedAt` |
| `SlackInstallation`, `SlackWorkspaceGrant` | Slack OAuth user tokens and scopes | `teamId`, `userToken`, `userScopes` |
| `McpConnection` | One OAuth connection to an MCP vendor per workspace | `platformSlug` unique per org, `status`, `accessMode`, `grantedScopes`, encrypted tokens, `lastSuccessfulCallAt` |
| `McpClientRegistration` | Dynamic client registration record | `issuer`, `clientId`, encrypted secret |
| `McpToolSnapshot` | Discovered tool with fingerprint and review state | `name`, `inputSchema`, `fingerprint`, `callKind`, `reviewState` |
| `McpOauthState` | PKCE state | `stateHash`, `encryptedCodeVerifier`, `returnPath`, `expiresAt` |

### 1.8 Bookkeeping (bookkeeping.prisma)

Enums: `AccountType` (ASSET, LIABILITY, EQUITY, INCOME, EXPENSE), `AccountSubtype` (18 values, BANK to OTHER_EXPENSE), `AccountSystemRole` (ACCOUNTS_RECEIVABLE, ACCOUNTS_PAYABLE, RETAINED_EARNINGS, OPENING_BALANCE_EQUITY, FX_GAIN_LOSS, ROUNDING, SUSPENSE), `EntryStatus` (DRAFT, POSTED), `EntrySource` (MANUAL, ADJUSTMENT, OPENING_BALANCE, INVOICE, BILL, CREDIT_NOTE, VENDOR_CREDIT, PAYMENT, ALLOCATION, BANK_SPEND, BANK_RECEIVE, TRANSFER, REVERSAL), `LineKind` (NORMAL, TAX, FX_ADJUSTMENT, ROUNDING), `FxOrigin` (IDENTITY, MANUAL, FETCHED).

| Model | Purpose | Key fields |
|---|---|---|
| `LedgerSettings` | Singleton | `baseCurrency`, `timezone`, `fiscalYearStartMonth`, `lockDate`, `hardLockDate`, `conversionDate`, `firstPostedAt`, `attentionStaleDays`, `setupCompletedAt` |
| `NumberSequence` | Document numbering | `key`, `prefix`, `padding`, `nextValue` |
| `LedgerAccount` | Chart of accounts (tree) | `code` unique, `name`, `type`, `subtype`, `systemRole`, `parentId`, `currency`, `isSystem`, `archivedAt` |
| `JournalEntry` | Header | `number`, `date`, `memo`, `status`, `source`, `sourceId`, `sourceKey` unique, `reversesId`, `postedAt`, `postedById` |
| `JournalLine` | Line, integer minor units | `accountId`, `kind`, `currency`, `debitMinor`, `creditMinor`, `baseDebitMinor`, `baseCreditMinor`, `fxRate`, `fxOrigin`, `counterpartyId`, `documentId`, `paymentId`, `taxRateId` (the last four are plain strings: no Counterparty, Document, Payment, TaxRate or Bank tables exist yet) |

### 1.9 Settings, currency, telemetry, audit, scheduler, modules (base.prisma)

| Model | Purpose | Key fields |
|---|---|---|
| `AppSetting` | Singleton app settings | `agentModelId`, `agentModelContextWindow`, `contextDevApiKey`, `reportingCurrency`, `ratesRefreshedAt`, `archiveRetentionDays` (180), tracking flags (`trackingSiteId`, cross domain, DNT, cookie days 395, `trackingPaused`), `developerUserId` |
| `ExchangeRate` | FX rate per pair and source | `baseCurrency`, `quoteCurrency`, `rate`, `asOf`, `source` FETCHED or MANUAL, `provider` |
| `Install`, `TelemetryMilestone`, `TelemetryCounter` | Product telemetry (PostHog, off by default per client config) | `uuid`, `version`, counters |
| `SchedulerRun` | Last run per in-process job | `job` id, `lastSuccessAt`, `lastFailureAt`, `lastError` |
| `AuditEvent` | Append-only audit log (DB triggers refuse update and delete) | `module`, `actorType`, `actorId`, `action`, `entityType`, `entityId`, `summary`, `before`, `after`, `reason`, `requestId` |
| `ModuleSwitch` | Runtime module on or off, written by the developer account | `moduleId`, `enabled`, `changedById` |

Permission keys declared in code: `crm.read`, `crm.write`, `crm.tracking` (`packages/modules/crm/meta.ts`); `bookkeeping.read`, `.write`, `.post`, `.bank`, `.reports`, `.settings`, `.lock`, `.reopen` (`packages/modules/bookkeeping/meta.ts`). Core roles owner, admin, member (`packages/modules/src/roles.ts`); bookkeeping adds `bookkeeper` and `accountant`.

---

## 2. API surface

All tRPC routers live under `apps/api/src/**/*.router.ts`, use `AuthMiddleware` unless noted, and most procedures carry `restMeta(...)` so they are also served as REST under `/rest` (`apps/api/src/trpc/openapi.ts`). `AuthMiddleware` also answers NOT_FOUND for any procedure owned by a switched-off module (`apps/api/src/trpc/middlewares/auth.middleware.ts`, `refuseSwitchedOffModule`).

### 2.1 tRPC routers and procedures

| Router (alias) | File | Procedures |
|---|---|---|
| `account` (public for first two) | `account/account.router.ts` | bootstrapStatus, createOwner, state, changePassword |
| `activities` | `activities/activities.router.ts` | timeline, timelineCounts, myTasks, create, complete |
| `agents` | `agent/agents.router.ts` | list, capabilities, revise, files, saveFile, byId, history, activity, update, deploy, pause, resume, archive, restore, remove, runNow, retryRun, cancelRun |
| `apiKeys` (session only) | `api-keys/api-keys.router.ts` | list, create, revoke |
| `bookkeeping` | `bookkeeping/bookkeeping.router.ts` | access, home |
| `bookkeepingAccounts` | `bookkeeping/accounts.router.ts` | list, ledger, create, update |
| `bookkeepingJournal` | `bookkeeping/journal.router.ts` | list, byId, post, reverse |
| `bookkeepingReports` | `bookkeeping/reports.router.ts` | trialBalance (general ledger is served through `bookkeepingAccounts.ledger` and `ledger/queries.ts generalLedger`) |
| `bookkeepingSettings` | `bookkeeping/settings.router.ts` | get, update, updateSequence |
| `companies` | `companies/companies.router.ts` | list, byId, options, create, update, archive, restore, purge, bulkAssignOwner, bulkEnrich, bulkArchive, bulkRestore, bulkPurge, enrich, research, setPrimaryContact |
| `contacts` | `contacts/contacts.router.ts` | list, byId, create, update, archive, restore, purge, enrich, bulkAssignOwner, bulkSetCompany, bulkEnrich, bulkArchive, bulkRestore, bulkPurge, decideFact |
| `conversations` (agent chat, not customer messaging) | `conversations/conversations.router.ts` | list, builderList, builderResources, builderById, events, save, createBuilder, submitBuilder, answerBuilderQuestion, answerBuilderApproval, setBuilderPermissionMode, rateBuilderResponse, markRead, shareStatus, createShare, revokeShare, shared, remove |
| `currency` | `currency/currency.router.ts` | settings, setReportingCurrency, setManualRate, removeManualRate, refreshRates |
| `dashboard` | `dashboard/dashboard.router.ts` | summary (scope me or everyone) |
| `deals` | `deals/deals.router.ts` | list, byId, create, update, archive, restore, purge, setStage, contactOptions, attachContact, detachContact, setContactRole, bulkAssignOwner, bulkSetStage, bulkArchive, bulkRestore, bulkPurge |
| `enrichment` | `enrichment/enrichment.router.ts` | queue |
| `fields` | `fields/fields.router.ts` | list, byKey, filters, coverage, create, update, reorder, archive, restore, delete, backfill |
| `google` | `google/google.router.ts` | status, purgeSyncedData, revokeAccess, syncNow, setAutoCreate, suppressDomain, thread, event |
| `mcp` | `mcp/mcp.router.ts` | list, get, tools, start, reconnect, disconnect, reviewTools |
| `microsoft` | `microsoft/microsoft.router.ts` | status, purgeSyncedData, revokeAccess, syncNow, setAutoCreate |
| `modules` (session only, developer account) | `modules/modules.router.ts` | state, list, set |
| `savedViews` | `saved-views/saved-views.router.ts` | list, create, update, delete |
| `search` | `search/search.router.ts` | quick (companies, contacts, deals) |
| `settings` | `settings/settings.router.ts` | agentModel, modelCatalog, setAgentModel, researchKey, setResearchKey, archiveRetention, setArchiveRetention |
| `slack` | `slack/slack.router.ts` | status, matches, channels, joinChannel, refreshPeople, createChannel, disconnect |
| `sso` | `sso/sso.router.ts` | signInOptions (public), settings, list, register, remove |
| `tracking` | `tracking/tracking.router.ts` | settings, setFlag, setCookieLifetime, addDomain, removeDomain, rotateSiteId, verify, sources, companyActivity, contactActivity |
| `users` | `users/users.router.ts` | me, list |
| `workspace` | `workspace/workspace.router.ts` | get, members, update, setMemberRole, addMember, removeMember, resetMemberPassword |

List filters accepted by the CRM list procedures (`apps/api/src/trpc/list-input.ts`, `contacts.contracts.ts`, `companies.contracts.ts`, `deals.contracts.ts`): `q`, `sort`, `dir`, `page`, `pageSize`, plus multi-value arrays: contacts `owner`, `company`, `source`, `title`, `seniority`, `persona`, `activity` (7, 30, 90 days); companies `owner`, `industry`, `enrichment`, `source`, `activity`; deals `status`, `owner`, `stage`, `closing` (overdue, this-month, next-month, later, none); all three accept `fields: Record<fieldKey, string[]>` for SELECT and USER custom fields and `archived`. Facet counts are returned with every list.

### 2.2 REST controllers (NestJS)

| Route | File | Purpose |
|---|---|---|
| `GET /auth/me`, `GET /auth/session` | `auth/auth.controller.ts` | Profile and session check |
| `GET /health` | `health/health.controller.ts` | Liveness with DB probe |
| `GET /api/t/config/:siteId`, `POST /api/t/e` (anonymous) | `tracking/tracking.controller.ts` | Tracking script config and event ingest |
| `GET /api/conversations/attachments/:id` | `conversations/conversation-attachments.controller.ts` | Download chat attachment (session or share token) |
| `GET /api/mcp/callback` | `mcp/mcp-callback.controller.ts` | Finish MCP OAuth |
| `GET /internal/mcp/connections/:id/token` (AGENT_BRIDGE_SECRET) | `mcp/mcp-internal.controller.ts` | Token broker for the agent |
| `GET|POST /internal/sync/mailboxes`, `/internal/sync/google` (CRON_SECRET) | `sync/sync.controller.ts` | Run due Gmail, Outlook, Calendar sync |
| `GET|POST /internal/sync/rates` (CRON_SECRET) | `currency/rates.controller.ts` | Refresh FX and convert pending |
| `GET|POST /internal/tracking/retention` (CRON_SECRET) | `tracking/tracking.controller.ts` | Roll up and sweep tracking data |
| `GET|POST /internal/archive/prune` (CRON_SECRET) | `archive/archive-retention.controller.ts` | Purge archived records past retention |
| `GET|POST /internal/telemetry/rollup` (CRON_SECRET) | `telemetry/telemetry.controller.ts` | Telemetry rollup |

Web app routes that proxy: `apps/app/app/api/[...path]/route.ts` (API proxy), `apps/app/app/eve/v1/[...path]/route.ts` (signed proxy to the agent for record chats), `apps/app/app/t/crm.js/route.ts` and `apps/app/app/t/[site]/route.ts` (tracking loader and per-site bundle), `apps/app/app/brand/[file]/route.tsx`, `apps/app/app/api/health/route.ts`.

### 2.3 Scheduler jobs

In-process scheduler, one tick per minute with Postgres advisory locks (`apps/api/src/scheduler/scheduler.service.ts`): `mailboxes` every 5 minutes, `rates` daily 06:00 UTC, `telemetry-rollup` daily 07:00, `tracking-retention` daily 04:00, `archive-prune` daily 05:00. The same jobs are reachable by the `/internal/*` cron routes above. Failures are only logged and stored in `SchedulerRun.lastError` (a TODO notes there is no error reporter).

The agent has its own cron: `apps/agent/agent/schedules/dispatch.ts` runs every minute and sweeps blank facts, reconciles stale tasks, drains the `AgentTask` queue, queues due SCHEDULE triggers (`lib/custom-agent-dispatch.ts queueDueAgentRuns`), and resumes pending builder submissions and queued runs.

### 2.4 Outbound integrations found in code

| Target | Where | What for |
|---|---|---|
| Google Gmail and Calendar APIs, Google OAuth token endpoint | `apps/api/src/google/gmail.client.ts`, `calendar.client.ts`, `apps/api/src/mailbox/mailbox-token.service.ts` | Read-only mail and calendar sync |
| Microsoft Graph | `apps/api/src/microsoft/graph.client.ts` | Read-only Outlook mail sync (no calendar: no calendar code in `microsoft-sync.service.ts`) |
| Slack Web API | `apps/api/src/slack/*`, `apps/agent/agent/lib/slack-membership.ts`, `slack-people.ts`, `run-runtime.ts` | Channel list, join, create, people match, post message from deployed agents |
| open.er-api.com | `apps/api/src/currency/rates.service.ts` | Daily FX rates |
| Context.dev SDK (`context.dev` package) | `apps/agent/agent/lib/context-dev.ts`, `people.ts`, `portrait.ts` | Company brand and LinkedIn person data |
| Perplexity | `apps/agent/agent/lib/perplexity.ts` | Web research with citations |
| GitHub API, x.com, linkedin.com | `apps/agent/agent/lib/socials.ts`, `portrait-sources.ts` | Social verification and photo sources |
| Vercel Blob (`BLOB_READ_WRITE_TOKEN`) | `packages/db/src/blob.ts`, `apps/api/src/backfill/image-mirror.service.ts` | Store logos and photos |
| MCP vendors (Clerk, Cloudflare, Linear, Neon, Notion, PlanetScale, Prisma, Supabase, Vercel) | `packages/mcp-integrations/src/vendors/*.ts`, `apps/api/src/mcp/mcp-connections.service.ts`, `apps/agent/agent/lib/mcp-runtime.ts` | OAuth connect, tool discovery, gated tool calls |
| PostHog | `packages/telemetry/src/client.ts` | Product telemetry, off unless `features.telemetry` |
| Stripe, Twilio, Resend, SendGrid, nodemailer, WhatsApp | none | Not present (only a Stripe brand logo SVG in `packages/ui/src/components/brand-logos/stripe.tsx`) |

---

## 3. Web surface (apps/app/app)

### 3.1 Public and auth routes

| Route | What the user can do | Evidence |
|---|---|---|
| `/` | Marketing landing page (hero, product shot, agent section, capabilities, CTA) | `(landing)/page.tsx` |
| `/sign-in` | Email and password sign-in; Google or Microsoft social sign-in when configured; SSO provider buttons; first visitor creates the owner account | `(landing)/sign-in/page.tsx`, `create-owner-form.tsx`, `sso-sign-in.tsx` |
| `/change-password` | Forced password change after admin set a temporary one | `(landing)/change-password/page.tsx` |
| `/grant-access` | Grant read-only Gmail, Calendar or Outlook access ("nothing is ever sent on your behalf") | `(landing)/grant-access/page.tsx` |
| `/onboarding` | Name the workspace and optional website | `(landing)/onboarding/page.tsx` |
| `/onboarding/research` | Enter a Context.dev key (CRM module only), skippable | `(landing)/onboarding/research/page.tsx` |
| `/t/crm.js`, `/t/:site.js` | Tracking loader and per-site bundle served to customer websites | `t/crm.js/route.ts`, `t/[site]/route.ts` |

No `/intake`, `/units`, `/upload` or public booking routes exist.

### 3.2 Workspace routes (`/(app)/[slug]`)

| Route | What the user can do | Evidence |
|---|---|---|
| `/[slug]` | Overview: core greeting plus module widgets (`crm.sales` sales dashboard with pipeline by stage, won this and previous month, win rate, average deal, cycle days, 6 month trend, closing this month, biggest open deals, overdue tasks, recent activity, scope me or everyone; `bookkeeping.overview` widget declared) | `[slug]/page.tsx`, `sales-dashboard.tsx`, `dashboard-summary.tsx`, `apps/api/src/dashboard/dashboard.contracts.ts`, `widget-ids.ts` |
| `/[slug]/companies` | Data table: search, sort, column show or hide, facets (owner, industry, enrichment, source, activity, custom SELECT and USER fields), saved views (private or shared), archived toggle, multi-select bulk actions (assign owner, enrich, archive, restore, purge), create sheet, click opens record sheet | `companies/companies-table.tsx`, `companies-bulk-actions.tsx`, `components/data-table/saved-views-menu.tsx`, `components/crm/fields/field-facets.tsx` |
| `/[slug]/companies/[companyId]` | Record sheet with inline edit of standard and custom fields, primary contact, enrichment and research actions, contacts list, deals, timeline with composer (note, call, email, meeting, task with due date), website activity, Agent tab (record chat) | `companies/[companyId]/page.tsx`, `components/crm/record-sheet/company-sheet.tsx`, `components/crm/timeline/activity-composer.tsx`, `components/crm/website-activity.tsx`, `components/crm/agent-panel.tsx` |
| `/[slug]/contacts` | Same table pattern; facets owner, company, source, title, seniority, persona, activity, custom fields; bulk assign owner, set company, enrich, archive, restore, purge | `contacts/contacts-table.tsx`, `contacts-bulk-actions.tsx` |
| `/[slug]/contacts/[contactId]` | Sheet tabs Overview, Deals, Activity, Agent; inline fields; agent facts with accept or dismiss; Background brief; socials; photo; relationship stats (emails, threads, meetings, next meeting, colleagues) | `components/crm/record-sheet/contact-sheet.tsx`, `components/crm/facts.tsx` |
| `/[slug]/deals` | Table only (no kanban board exists: no "kanban" or board component in `apps/app`); stage changed via a per-row menu; facets status, owner, stage, closing window, custom fields; open pipeline total in reporting currency; bulk assign owner, set stage, archive, restore, purge | `deals/deals-table.tsx`, `components/crm/stage-change.tsx`, `deals-bulk-actions.tsx` |
| `/[slug]/deals/[dealId]` | Sheet: stage stepper, amount with currency and FX, close date, description, contacts with roles (attach, detach, set role), timeline, Agent tab | `components/crm/record-sheet/deal-sheet.tsx`, `components/crm/stage-stepper.tsx` |
| `/[slug]/chat`, `/[slug]/chat/[chatId]` | Private agent builder chat: ask about CRM, tag records and integrations, describe an agent to build; attachments; approval and question prompts; permission mode; share link; thumbs rating; delete | `(agent-builder)/chat/*`, `components/agent-builder/agent-builder-home.tsx`, `agent-builder-chat.tsx`, `agent-composer.tsx`, `share-chat-dialog.tsx` |
| `/[slug]/agents`, `/[slug]/agents/[agentId]` | Team agents index and detail: review draft version, deploy, pause, resume, archive, restore, delete, run now, retry, cancel; runs drawer with events and action ledger; audit activity; capabilities panel; code workspace to view and save agent files | `(agent-builder)/agents/*`, `components/agent-builder/team-agents-index.tsx`, `team-agent-detail.tsx`, `agent-runs-drawer.tsx`, `agent-code-workspace.tsx` |
| `/[slug]/books` | Books home (base currency, lock date, suspense and opening balance equity, entries this month, drafts); tabs Home, Accounting, Reports shown by permission | `books/page.tsx`, `books-home.tsx`, `books/_components/books-nav.tsx` |
| `/[slug]/books/accounting/accounts`, `/accounts/[id]` | Chart of accounts table with create and edit sheets, archive; account ledger with date range and running balance | `books/accounting/accounts/*` |
| `/[slug]/books/accounting/journal`, `/journal/new`, `/journal/[id]` | Journal list with filters by date and source; new manual or adjustment entry with 2 to 200 lines and lock override; entry view with history and reverse dialog | `books/accounting/journal/*`, `journal-form.tsx`, `reverse-dialog.tsx` |
| `/[slug]/books/reports`, `/trial-balance`, `/general-ledger` | Trial balance as of a date with balanced proof; general ledger by date range | `books/reports/*` |
| `/[slug]/settings` | General: workspace name and website, Context.dev research key, archive retention days, agent model picker | `settings/page.tsx`, `workspace-form.tsx`, `research-key.tsx`, `archive-retention.tsx`, `agent-model.tsx` |
| `/[slug]/settings/account` | Change own password | `settings/account/page.tsx` |
| `/[slug]/settings/connections` and children | Google, Microsoft, Slack (channels, people matches, scopes, disconnect), Supabase and other MCP vendors (connect, review tools, read-only or read-write, disconnect); "Add connection" dialog | `settings/connections/*` |
| `/[slug]/settings/currencies` | Reporting currency, manual rates, refresh | `settings/currencies/*` |
| `/[slug]/settings/members` | Table of members; add with first password; change role; reset password; remove | `settings/members/*` |
| `/[slug]/settings/api-keys` | Create and revoke API keys | `settings/api-keys/*` |
| `/[slug]/settings/sso` | Register and remove OIDC or SAML providers | `settings/sso/*` |
| `/[slug]/settings/tracking` | Allowed domains, tracking rules, script snippet, verify installation, traffic sources, cookie settings | `settings/tracking/*` |
| `/[slug]/settings/books` | Fiscal year start, lock and hard lock dates, attention stale days, number sequences | `settings/books/books-settings.tsx` |
| `/[slug]/settings/features` | Developer account only: switch modules on or off at runtime | `settings/features/*` |

Custom field administration (create, reorder, archive, backfill by agent) is a sheet reachable from record sheets and tables, not a route: `components/crm/fields/fields-sheet.tsx`, `field-editor.tsx`.

---

## 4. Module mechanism (packages/modules)

| Piece | What it does | File |
|---|---|---|
| `defineModule` | Pure-data module definition validated by zod: `id`, `label`, `description`, `routers` (tRPC aliases gated by the module), `requires`, `nav` (title, href, icon from company, contact, deal, ledger; match exact or prefix), `settings` items with `after` ordering, `widgets` (slot `overview` only), `roles`, `permissions` (keys prefixed by module id mapped to role lists), `fieldEntities`, `optionsSchema` | `src/define-module.ts` |
| Registry | `ALL_MODULES = { crm, bookkeeping }` | `src/registry.ts` |
| Client config | `clients/<id>/client.config.ts` picks brand, enabled modules, locale, features; `ENABLED_MODULES` env overrides | `src/client-config.ts`, `src/define-client.ts`, `clients/registry.ts` |
| Runtime | `enabledModules`, `isModuleEnabled`, `requireModule`, `moduleNav`, `settingsNav`, `moduleWidgets`, `enabledFieldEntities`, `workspaceRoleIds`, `roleOptions`, `can(role, key)` | `src/runtime.ts` |
| State | Runtime switches from `ModuleSwitch` table, 5 second TTL, re-read by API and agent | `src/state.ts` |
| Developer account | `DEVELOPER_EMAIL` pinned to a user id on first sign-in; only this account sees Features and may call `modules.set` | `src/developer.ts` |
| Server side | `defineServer({ seed })` per module | `crm/server.ts`, `bookkeeping/server.ts` |

Modules declared:

- `crm` (`crm/meta.ts`): routers companies, contacts, deals, activities, enrichment, savedViews, tracking; nav Companies, Contacts, Deals; settings Tracking & Analytics; widget `crm.sales`; permissions `crm.read`, `crm.write` (owner, admin, member), `crm.tracking` (owner, admin); fieldEntities COMPANY, CONTACT, DEAL. Comment: "moving it behind this module is a later phase" (the API middleware does gate its routers already).
- `bookkeeping` (`bookkeeping/meta.ts`): routers bookkeeping, bookkeepingAccounts, bookkeepingJournal, bookkeepingSettings, bookkeepingReports; nav Books; settings Books; widget `bookkeeping.overview`; roles bookkeeper, accountant; eight permission keys listed in section 1.9.

No `property-tax` or other module exists.

---

## 5. Agent (apps/agent)

Framework: `eve` (`apps/agent/agent/agent.ts`), model chosen per session from `AppSetting.agentModelId` (`lib/model.ts`). Capability gates (`lib/capabilities.ts`): `PERPLEXITY_API_KEY` (web research), Context.dev key from settings (company brand, LinkedIn people), `BLOB_READ_WRITE_TOKEN` (picture storage). Module gate: CRM tools throw `ModuleSwitchedOffError` when `crm` is off (`lib/module-gate.ts`). Shell features (builder and team agents) need a sandbox with a shell: off on Render unless `AGENT_SHELL=1` (`apps/api/src/agent/agent-shell.ts`, `apps/agent/agent/lib/shell.ts`).

### 5.1 Top-level tools (`apps/agent/agent/tools`)

archive_field, enrich_company, fetch_contact_photo, find_contact_socials, get_contact_work_history, get_linkedin_profile, identify_contact, list_deals, list_fields, list_outstanding_work, manage_fields, mcp (dynamic: granted MCP tools for team-agent runs), read_company_history, read_crm_history, read_deal_history, record_fact, record_job_change, request_connection, research_company, research_person, resolve_linkedin_profile, schedule_recheck, search_crm, set_chat_title, set_contact_socials, set_field_value, web_fetch, web_search (disabled in workspace chats), write_brief, write_workspace_profile. All are read or research oriented or write to CRM records and fields; none sends email, SMS or messages to customers.

### 5.2 Subagents

- `agent_builder` (`subagents/agent_builder`): tools bash, inspect_context, read_file, save_agent_draft, web_fetch, web_search, write_agent_file, write_file. Designs one bounded team agent, writes `agent/instructions.md`, `agent/manifest.json`, `agent/README.md`, saves a READY version for human review. Instructions state the only executable action types: `crm.activity.create` (NOTE or TASK), `run.summary`, `slack.message.post`; "Do not promise email sending, arbitrary webhooks, or any integration the context does not report."
- `agent_runner` (`subagents/agent_runner`): tools bash, create_crm_activity, finish_run, inspect_run, post_slack_message, query_crm, read_crm_record, read_file, web_fetch, web_search, write_file. Executes one pinned run with an idempotent action ledger (`AgentAction`).

### 5.3 Skills, schedules, channels

Skills: `skills/data-boundaries.md`, `evidence.md`, `identity-matching.md`, `writing-a-brief.md`. Schedule: `schedules/dispatch.ts` (every minute). Channels: `channels/crm.ts` (internal routes `/internal/crm/dispatch`, `dispatch-health`, `builder-dispatch`, `agent-dispatch`, `cancel-run`, `slack/create-channel`, `verify-key`, all behind `AGENT_BRIDGE_SECRET`), `channels/eve.ts`.

### 5.4 Deployed agent versions, manifests, triggers, MCP grants

- Manifest schema: `packages/validation/src/agents.ts` (`capabilities`: `actions[]` with type, provider, summary, optional Slack destination; `mcp[]` grants; `dataScope` SELECTED or WORKSPACE with resources) and `packages/validation/src/agent-manifest.ts`.
- Triggers: MANUAL (run now), SCHEDULE (interval minutes with `nextRunAt`, queued by the agent cron), EVENT (CRM events `company.created`, `contact.created`, `deal.created`, `deal.stage.changed`, `deal.opened`, `deal.closed` from `packages/db/src/crm-events.ts`, emitted by the companies, contacts and deals services through `apps/api/src/agent/agent-trigger.service.ts`). WEBHOOK exists in the enum only: no inbound webhook controller exists.
- Lifecycle: revise (builder creates a version), deploy, pause, resume, archive, restore, remove; runs with retry and cancel (`apps/api/src/agent/agents.router.ts`).
- MCP grants: tool names and fingerprints pinned in the manifest; at run start only CONNECTED connections with REVIEWED snapshots matching fingerprint are exposed, and READ_ONLY connections hide non-read tools (`apps/agent/agent/tools/mcp.ts`, `lib/mcp-runtime.ts`).

---

## 6. Communication today

| Capability | Exists today? | Where in code | Notes |
|---|---|---|---|
| Read Gmail threads into the timeline | YES | `apps/api/src/google/gmail-sync.service.ts`, `apps/api/src/mailbox/thread-writer.service.ts` | Read-only; files threads to companies and contacts; optional auto-create of contacts for replied-to external addresses |
| Read Outlook mail | YES | `apps/api/src/microsoft/microsoft-sync.service.ts`, `graph.client.ts` | Read-only |
| Read Google Calendar meetings | YES | `apps/api/src/google/calendar-sync.service.ts` | Attendees matched to contacts; optional auto-create |
| Send email (transactional or to customers) | NO | no nodemailer, resend, sendgrid, postmark, mailgun or sendMail code anywhere in `apps` or `packages`; `/grant-access` copy says "nothing is ever sent on your behalf" | Members are added with a first password shown on screen, no invite email |
| SMS or WhatsApp | NO | no twilio, whatsapp or sms code | |
| Shared team inbox or conversation threads with customers | NO | `conversations` router is agent chat (`AgentConversation`), not customer messaging | Email threads are viewable per record (`components/crm/timeline/email-thread-entry.tsx`) but there is no inbox view, reply or assignment |
| Slack messages | PARTIAL | `apps/agent/agent/subagents/agent_runner/tools/post_slack_message.ts`, `apps/api/src/slack/*` | Only a deployed team agent posts, to one pinned channel or person; no user-facing compose |
| Call logging | YES (manual) | `components/crm/timeline/activity-composer.tsx` (CALL type) | No telephony |

---

## 7. Money today

| Capability | Exists today? | Where in code | Notes |
|---|---|---|---|
| Chart of accounts (create, edit, archive, tree, system roles) | YES | `apps/api/src/bookkeeping/accounts.*`, `apps/app/app/(app)/[slug]/books/accounting/accounts/*`, `packages/db/src/seeds/bookkeeping.ts` | Seeded `general-services` preset only |
| Manual and adjustment journal entries, posting, reversal, lock dates, numbering | YES | `apps/api/src/bookkeeping/journal.*`, `packages/modules/bookkeeping/ledger/posting.ts`, `settings.*` | Integer minor units, base currency, idempotent `requestKey`, append-only audit |
| Trial balance, account ledger, general ledger | YES | `apps/api/src/bookkeeping/reports.*`, `packages/modules/bookkeeping/ledger/queries.ts`, `books/reports/*` | |
| Profit and loss, balance sheet, AR and AP aging, cash flow | NO | no code; `docs/plan/bookkeeping.md` phase 3.4 TODO | |
| Invoices, bills, credit notes (documents) | PARTIAL (engine only) | `packages/modules/bookkeeping/engine/builders/documents.ts` (`buildDocumentEntry`), `engine/document.ts` tax math | No Prisma tables, no API, no screens; `JournalLine.documentId` is a bare string |
| Payments, allocations, credits, refunds | PARTIAL (engine only) | `engine/builders/payments.ts` (`buildPaymentEntry`, `buildApplyCreditEntry`), `builders/reversal.ts` (`buildVoidPayment`) | Same: no tables, API or UI |
| Bank spend, receive, transfer, park to suspense | PARTIAL (engine only) | `engine/builders/bank.ts` | No bank account, import, matching or rule tables; no CSV import |
| Counterparties (customers, vendors) | NO | `JournalLine.counterpartyId` string only | |
| Tax rates | NO | `JournalLine.taxRateId` string only | |
| Online payments, Stripe, card processing | NO | only `packages/ui/src/components/brand-logos/stripe.tsx` | |
| Quotes or estimates | NO | | |
| Currency: reporting currency, daily FX fetch, manual rates, deal base amount conversion | YES | `apps/api/src/currency/*`, `packages/db/src/fx.ts`, `Deal.baseAmount` | open.er-api.com, 06:00 UTC job |
| Bookkeeping roles and permissions | YES | `packages/modules/bookkeeping/meta.ts`, `apps/api/src/bookkeeping/bookkeeping-access.ts` | bookkeeper, accountant plus core roles |

---

## 8. Scheduling today

| Capability | Exists today? | Where in code | Notes |
|---|---|---|---|
| Synced calendar events on the timeline | YES | `CalendarEvent`, `CalendarAttendee`, `apps/api/src/google/calendar-sync.service.ts`, `components/crm/timeline/meeting-entry.tsx` | Google only, read-only |
| Create or edit a calendar event from the CRM | NO | | |
| Public booking page, availability, appointment types | NO | no routes or models | |
| Tasks with due dates, my tasks, overdue list | YES | `activities.myTasks`, `activities.complete`, dashboard `overdueTasks` | |
| Reminders or notifications to users | NO | no notification model, no email or push | |
| Agent-scheduled rechecks of contacts | YES | `apps/agent/agent/tools/schedule_recheck.ts`, `AgentTask.dueAt` | Internal research cadence, not a customer appointment |
| Scheduled team agent runs (interval) | YES | `AgentTrigger` SCHEDULE, `apps/agent/agent/lib/custom-agent-dispatch.ts` | |

---

## 9. Marketing today

| Capability | Exists today? | Where in code | Notes |
|---|---|---|---|
| Website visitor tracking script, first-party cookies, UTM first and last touch | YES | `apps/api/src/tracking/*`, `apps/app/app/t/*`, `apps/app/lib/tracking/*`, `TrackedVisitor`, `TrackedEvent` | DNT honoured, cross-domain, allowed domains, retention sweep |
| Website form capture filed to contacts | YES | `apps/api/src/tracking/tracking-filing.service.ts` (creates contacts with `RecordSource.TRACKING`), `FormSubmission` | Captures existing HTML forms on tracked sites; no hosted form builder |
| Website activity on a record | YES | `tracking.contactActivity`, `tracking.companyActivity`, `components/crm/website-activity.tsx` | |
| Traffic sources report | YES | `tracking.sources`, `settings/tracking/traffic-sources.tsx` | |
| Form builder, landing pages, hosted intake | NO | | |
| Email campaigns, sequences, broadcasts | NO | | `docs/plan/crm-plan.md` section 8 lists sequences as deliberately left out |
| Reviews or reputation | NO | | |
| Lead scoring | PARTIAL | `ContactFact.score` and `band` are evidence confidence for identity, not a sales score | |
| Segmentation | PARTIAL | Saved views with multi-value facets and custom field filters (`SavedView`, `savedViews` router) | Lists only; nothing consumes a segment |

---

## 10. Automation and reporting today

| Capability | Exists today? | Where in code | Notes |
|---|---|---|---|
| Natural-language agent builder producing reviewable team agents | YES | `apps/agent/agent/subagents/agent_builder`, `conversations` router, `agents` router, `components/agent-builder/*` | Needs a shell-capable host |
| Triggers: manual, schedule, CRM events | YES | `AgentTrigger`, `packages/db/src/crm-events.ts`, `agent-trigger.service.ts` | Webhook trigger type declared, no inbound endpoint |
| Actions: CRM note or task, Slack post, run summary, granted MCP tools | YES | `agent_runner/tools/*`, `tools/mcp.ts` | No email, SMS, HTTP webhook actions |
| Auto enrichment on record creation (brand, LinkedIn, socials, photo, brief, facts) | YES | `AgentTask` queue, `apps/api/src/agent/agent-trigger.service.ts`, agent tools | Gated by Context.dev key and Perplexity key |
| Custom field backfill by agent | YES | `fields.backfill`, `packages/validation/src/field-backfill.ts` | |
| Deterministic workflow builder (if this then that without an LLM) | NO | | |
| Sales dashboard | YES | `apps/api/src/dashboard/dashboard.service.ts`, `sales-dashboard.tsx`, `components/dashboard-charts.tsx` | Fixed metrics, scope me or everyone |
| Custom report builder | NO | | `docs/plan/crm-plan.md` section 8 lists "reporting builder" as left out |
| Bookkeeping reports | PARTIAL | trial balance, GL, account ledger only | |
| Append-only audit log | YES | `AuditEvent`, `packages/db/src/audit.ts`, bookkeeping entry history | Not surfaced as a UI page except per journal entry |
| Public REST API with OpenAPI | YES | `apps/api/src/trpc/openapi.ts` (`/rest`), API keys | |
| Data import (CSV) | NO | `RecordSource.IMPORT` exists in the enum but no import endpoint or UI | |
| Data export | NO | | |

---

## 11. Known gaps versus a HubSpot-style CRM, verified in code

| Gap named in docs or comments | Verified state in code | Evidence |
|---|---|---|
| Multi-value ("is any of") filters | YES, exists. Every facet is an array; `ownerFilter` handles multiple ids plus unassigned | `apps/api/src/trpc/list-input.ts`, `contacts.contracts.ts` `owner: z.array(...)`. `docs/list-building-roadmap.md` ("1 value per filter, 0 saved views") is stale |
| Saved and shared list views | YES, exists | `SavedView` model, `apps/api/src/saved-views/*`, `components/data-table/saved-views-menu.tsx` |
| Filtering by custom fields | YES for SELECT and USER types; NO for TEXT, NUMBER, DATE ranges | `fields.filters` (`filterableFieldsFor`), `components/crm/fields/field-facets.tsx` comment "SELECT and USER admin fields become filter facets automatically" |
| Multi-select field type | NO | `FieldType` enum has no MULTI_SELECT |
| Multiple pipelines | NO. One fixed `DealStage` enum, no Pipeline model | `packages/db/prisma/schema/crm.prisma`; `docs/plan/crm-plan.md` section 8 |
| Custom deal stages | NO | stages are an enum, labels in `apps/app/lib/deal-stage.ts` |
| Kanban board for deals | NO | no board component; `deals-table.tsx` only |
| Email sequences and cadences | NO | section 8 of `docs/plan/crm-plan.md`; no sending code |
| Quotes | NO | |
| Reporting builder | NO | |
| Permissions and roles | PARTIAL. Core roles plus module permission keys; CRM keys `crm.read`, `crm.write`, `crm.tracking` exist but the comment in `auth.middleware.ts` says "the CRM services have not yet" repeated the module check for their writes | `packages/modules/crm/meta.ts`, `apps/api/src/trpc/middlewares/auth.middleware.ts` |
| Invitations by email | NO (table exists, flow adds members with a first password) | `apps/api/src/workspace/workspace.service.ts` |
| Error reporter | NO | TODO in `apps/api/src/scheduler/scheduler.service.ts`, comment in `(agent-builder)/layout.tsx` |
| Bookkeeping: Sales, Purchases, Banking sections | NO ("join this bar in later rounds") | `books/_components/books-nav.tsx` |
| Bookkeeping plan phase status | `docs/plan/bookkeeping.md` marks phase 2 (routers, screens) as TODO, but the routers and screens exist. Code is ahead of the doc | `apps/api/src/bookkeeping/*`, `apps/app/app/(app)/[slug]/books/**` |
| Overview widgets without components | `bookkeeping.overview` is declared but may be in `widget-ids.ts` "no component yet" list | `apps/app/app/(app)/[slug]/widget-ids.ts` |
| Webhook triggers | Declared in enum, not receivable | no controller under `apps/api/src` handles inbound webhooks |

---

## 12. Capability summary

| # | Area | Capability | Exists today? | Evidence (file paths) |
|---|---|---|---|---|
| 1 | CRM | Companies, contacts, deals CRUD with archive, restore, purge | YES | `apps/api/src/{companies,contacts,deals}/*.router.ts` |
| 2 | CRM | Deal pipeline with stages, stage history, closed reason | YES (single fixed pipeline) | `crm.prisma` `DealStage`, `deals.setStage` |
| 3 | CRM | Multiple or custom pipelines | NO | `DealStage` enum only |
| 4 | CRM | Kanban board | NO | `apps/app/app/(app)/[slug]/deals/deals-table.tsx` only |
| 5 | CRM | Custom fields (10 types) on all three entities, admin UI, agent backfill | YES | `base.prisma` FieldDefinition, `apps/api/src/fields/*`, `components/crm/fields/*` |
| 6 | CRM | Multi-select field type | NO | `FieldType` enum |
| 7 | CRM | List filters: multi-value facets, custom SELECT and USER filters, search, sort, facet counts | YES | `apps/api/src/trpc/list-input.ts`, `*.contracts.ts` |
| 8 | CRM | Saved views, private and shared | YES | `apps/api/src/saved-views/*`, `components/data-table/saved-views-menu.tsx` |
| 9 | CRM | Bulk actions (owner, company, stage, enrich, archive, restore, purge) | YES | `*-bulk-actions.tsx`, bulk procedures |
| 10 | CRM | Timeline: notes, calls, emails, meetings, tasks, stage changes, enrichment | YES | `activities` router, `components/crm/timeline/*` |
| 11 | CRM | Tasks with due dates, my tasks, overdue on dashboard | YES | `activities.myTasks`, `dashboard.summary` |
| 12 | CRM | Deal contacts with roles, primary contact | YES | `DealContact`, `companies.setPrimaryContact` |
| 13 | CRM | Record enrichment (brand, LinkedIn, socials, photo, brief, facts with evidence) | YES (needs Context.dev or Perplexity keys) | `apps/agent/agent/tools/*`, `AgentTask` |
| 14 | CRM | Global quick search | YES | `apps/api/src/search/search.router.ts`, `components/crm/quick-switcher.tsx` |
| 15 | CRM | CSV import or export | NO | `RecordSource.IMPORT` enum only |
| 16 | CRM | Duplicate detection or merge | NO | unique active email and domain constraints only |
| 17 | Inbox | Gmail and Outlook read-only sync to records | YES | `apps/api/src/google/*`, `apps/api/src/microsoft/*`, `apps/api/src/mailbox/*` |
| 18 | Inbox | Send email from the CRM | NO | no sender library in `apps` or `packages` |
| 19 | Inbox | Shared team inbox, assignment, reply | NO | no model or UI |
| 20 | Inbox | SMS or WhatsApp | NO | no code |
| 21 | Inbox | Slack outbound | PARTIAL (deployed agents only) | `agent_runner/tools/post_slack_message.ts` |
| 22 | Scheduling | Google Calendar meetings synced to records | YES | `apps/api/src/google/calendar-sync.service.ts` |
| 23 | Scheduling | Booking page, availability, appointment types | NO | no routes |
| 24 | Scheduling | Reminders or notifications to users | NO | no code |
| 25 | Marketing | Website tracking with UTM attribution | YES | `apps/api/src/tracking/*`, `apps/app/app/t/*` |
| 26 | Marketing | Form capture to contacts | YES (existing site forms) | `tracking-filing.service.ts`, `FormSubmission` |
| 27 | Marketing | Form or landing page builder | NO | |
| 28 | Marketing | Email campaigns, sequences | NO | |
| 29 | Marketing | Reviews, reputation | NO | |
| 30 | Money | Chart of accounts, journal, posting, reversal, locks, numbering | YES | `apps/api/src/bookkeeping/*`, `packages/modules/bookkeeping/ledger/*` |
| 31 | Money | Trial balance, general ledger, account ledger | YES | `bookkeeping/reports.*`, `books/reports/*` |
| 32 | Money | P and L, balance sheet, aging | NO | |
| 33 | Money | Invoices, bills, payments, bank import | PARTIAL (engine builders only, no tables, API or UI) | `packages/modules/bookkeeping/engine/builders/*` |
| 34 | Money | Online payments, Stripe | NO | |
| 35 | Money | Multi-currency rates, reporting currency, deal FX | YES | `apps/api/src/currency/*` |
| 36 | Automation | Agent builder chat producing reviewable, deployable team agents | YES (shell host required) | `apps/agent/agent/subagents/*`, `agents` router |
| 37 | Automation | Triggers manual, schedule, CRM events | YES | `AgentTrigger`, `packages/db/src/crm-events.ts` |
| 38 | Automation | Webhook trigger | NO (enum only) | no inbound controller |
| 39 | Automation | Actions: CRM note or task, Slack post, MCP tools | YES | `agent_runner/tools/*`, `tools/mcp.ts` |
| 40 | Automation | Actions: email, SMS, HTTP webhook | NO | builder instructions forbid promising them |
| 41 | Automation | Deterministic no-LLM workflow builder | NO | |
| 42 | Reporting | Sales dashboard (pipeline, won, win rate, cycle, trend) | YES | `apps/api/src/dashboard/*`, `sales-dashboard.tsx` |
| 43 | Reporting | Custom report builder | NO | |
| 44 | Reporting | Audit log (append-only) | YES (DB and journal history; no global UI) | `AuditEvent`, `packages/db/src/audit.ts` |
| 45 | Admin | Owner bootstrap, password sign-in, Google and Microsoft social sign-in, OIDC and SAML SSO | YES | `(landing)/sign-in/*`, `apps/api/src/sso/*` |
| 46 | Admin | Members, roles (core plus module roles), admin password reset, removal | YES | `apps/api/src/workspace/*`, `settings/members/*` |
| 47 | Admin | Email invitations | NO | members added with a first password |
| 48 | Admin | API keys and REST with OpenAPI | YES | `apps/api/src/api-keys/*`, `apps/api/src/trpc/openapi.ts` |
| 49 | Admin | Module switches per client and at runtime (developer account) | YES | `packages/modules/*`, `settings/features/*` |
| 50 | Admin | Connections: Google, Microsoft, Slack, MCP vendors with tool review | YES | `settings/connections/*`, `apps/api/src/mcp/*` |
| 51 | Admin | Archive retention and purge, tracking retention | YES | `apps/api/src/archive/*`, `tracking-retention.service.ts` |
| 52 | Admin | Error reporting or alerting | NO | TODO in `scheduler.service.ts` |
