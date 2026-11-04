# Template modules plan

Owner: Dashboard S2. Status: PLAN, awaiting manager review. No code written.
Audience: you and the next agent. Statuses: TODO / DOING / DONE / BLOCKED.

Goal (owner's words): "copy and paste this and use it for any business. Bookkeeping
client, boom, deploy bookkeeping. Hair salon, boom, hair salon." One deploy and one
database per client. Same core, modules switched on per client.

Out of scope here (S1 owns): Render conversion, env.validation.ts, setup/environment docs, workflows.

---

## 0. Decisions I am making (override me in review)

| # | Decision | Why |
|---|---|---|
| D1 | **One module registry in code (`packages/modules`) + one per-client config file (`client.config.ts`, repo root).** A new client is: copy repo, edit that file, deploy. | Typed, greppable, one place. No admin UI, no DB flag. The owner said "copy and paste". |
| D2 | **All Prisma tables exist in every client DB; modules gate code, not schema.** | Prisma has no conditional models. One linear migration history. Turning a module on later needs no migration. Cost: empty tables for modules a client never uses. Accepted. |
| D3 | **Disabled module = not mounted.** Nest module not imported, tRPC router not registered, nav item absent, route returns 404, agent tools not exposed. The generated tRPC types still contain every router. | A disabled endpoint that does not exist cannot be called, which beats a flag check someone forgets. |
| D4 | **Rename `@crm/*` to `@app/*` once, early, by codemod.** Brand lives in config, never in package names. | 1433 occurrences in 517 files. Mechanical, but it collides with every other session, so it runs in a quiet window (Phase 1). |
| D5 | **Bookkeeping owns its own counterparty table** (customers and vendors), with an optional soft link to a CRM contact or company. | Modules must not require each other. A salon with no CRM still needs customers. |
| D6 | **Bookkeeping stores money as integer minor units (BigInt), double-entry, immutable once posted.** | See section 5. Differs from the CRM's Decimal on purpose: ledgers sum exactly. |
| D7 | **Default telemetry OFF for client deploys.** `packages/telemetry/src/project.ts` hard-codes a PostHog key and host `k.trycomp.ai` (Comp AI's). Every client deploy would report to a third party. | Found during the brand sweep. Must be fixed before the first deploy. Blocking. |

Open for the owner (one question, recommended answer in bold):
- **Q1. Is the bookkeeping module the business keeping its OWN books, or a bookkeeping firm keeping MANY clients' books?** One business per deploy only fits the first. **Recommend: own books (single entity).** A firm would need multi-entity ledgers, which contradicts the one-business-per-deploy rule; the firm's own customers would just be CRM companies.

---

## 1. Core vs module split

Core = in every client deploy, never switched off.

| Area | Where it lives today | Notes |
|---|---|---|
| Auth, sessions, SSO, API keys | `packages/auth`, `apps/api/src/{auth,sso,api-keys}` | Roles owner/admin/member (`packages/auth/src/organization.ts`). |
| Users, members, workspace singleton | `apps/api/src/{users,workspace}`, `WORKSPACE_ID` | Single tenant stays. Workspace name/slug become brand-driven (section 3). |
| Settings shell | `apps/app/app/(app)/[slug]/settings/*`, `apps/api/src/settings` | Sections: general, members, api-keys, sso, connections, currencies. Modules contribute extra sections. |
| Layout, nav rail, mobile nav, header, page shell | `apps/app/components/{app-icon-rail,mobile-nav,app-header,page-shell}.tsx` | Nav built from the registry, not a hard-coded `ITEMS` array. |
| Property registry + custom fields | `FieldDefinition/FieldOption/FieldValue`, `apps/api/src/fields`, `packages/db/src/fields*.ts`, `apps/app/components/crm/fields` | Core mechanism; entities are contributed by modules. Coupling issue in 1.2. |
| Data table, saved views, search, command palette | `packages/ui` data-table, `SavedView`, `apps/api/src/{saved-views,search}`, `quick-switcher.tsx` | Search must query only enabled modules' entities. |
| Archive/purge pattern | `apps/api/src/archive` | Generic cron; each module registers a `purgeExpired`. |
| Connections (Slack, MCP, OAuth providers) | `/settings/connections`, `apps/api/src/{slack,mcp}`, `packages/mcp-integrations` | Core. Google/Microsoft mailbox sync is NOT core (see crm). |
| Currency + exchange rates | `apps/api/src/currency`, `ExchangeRate`, `packages/db/src/{currency,fx}.ts`, `docs/currency.md` | Core, because deals and bookkeeping both convert. |
| The agent runtime + chat + agent builder | `apps/agent` (shell), `apps/app/components/agent-builder`, `apps/api/src/agent` | Core shell; tools are module-owned (D3, section 2.6). |
| Telemetry | `packages/telemetry` | Core but off by default (D7). |
| Logging, health, cache, OpenAPI | `apps/api/src/{logging,health,cache}` | Core. |

### 1.1 The `crm` module (everything sales-shaped)

| Piece | Paths |
|---|---|
| Models | Company, CompanyEnrichment, Contact, ContactFact, ContactBrief, Deal, DealContact, Activity (timeline), SuppressedContact/Domain, enums DealStage/ActivityType/EnrichmentStatus/RecordSource |
| API | `apps/api/src/{companies,contacts,deals,activities,enrichment,backfill,dashboard}`, `crm/` (stamp, bulk, values), `conversations` (record chat) |
| Mail and calendar sync | `apps/api/src/{mailbox,google,microsoft,sync}`; models MailboxSync, EmailThread, EmailMessage, CalendarEvent, CalendarAttendee. These create companies and contacts, so they belong to crm, not core. |
| Web tracking | `apps/api/src/tracking`, `apps/app/app/t`, Tracked* models, FormSubmission. Separate module `web-tracking`, `requires: ["crm"]` (form submissions become leads). |
| App | `app/(app)/[slug]/{companies,contacts,deals}`, `sales-dashboard.tsx`, `components/crm/*` (record sheet, timeline, enrichment, stage UI) |
| Agent | tools: enrich_company, research_company, research_person, identify_contact, find_contact_socials, get_contact_work_history, get_linkedin_profile, resolve_linkedin_profile, fetch_contact_photo, record_fact, record_job_change, write_brief, set_contact_socials, list_deals, read_*_history, search_crm; skills `identity-matching`, `writing-a-brief`, `evidence`; the dispatch schedule and AgentTask enrichment lanes; `lib/{enrichment,facts,people,portrait*,socials,identity,brand*,context-dev}.ts` |

Generic agent tools stay core: set_chat_title, web_search, web_fetch, request_connection, list_fields, manage_fields, archive_field, set_field_value, schedule_recheck, list_outstanding_work, agent, mcp.

### 1.2 Coupling that must be cut (the real work)

These core things point at CRM tables today. Each needs a decision before module split is real.

| Coupling | Today | Plan |
|---|---|---|
| `FieldEntity` enum is `COMPANY, CONTACT, DEAL`; `FieldValue` has FKs companyId/contactId/dealId | core to crm | **v1: keep nullable FK columns, add one per new module entity** (keeps cascade and integrity). Entity list comes from the registry. Revisit generic `(entity, recordId)` only if there are more than about four entities. Honest cost: core schema names module entities. |
| `Activity` has companyId/contactId/dealId, email/calendar FKs | crm timeline | Stays inside crm. Bookkeeping gets its own audit trail, not this table. |
| `AgentTask` has contactId/companyId/dealId, no FKs | crm lanes | Stays in core table, rename ids into `subject` + `kind` over time. v1 leave as is. |
| `SavedView.entity` uses `FieldEntity` | core | Same as fields. |
| `Overview` page is the sales dashboard | crm | Overview becomes a widget host. Modules register widgets; core renders greeting plus widgets. |
| `deal-stage`, `crm-events` in `packages/db/src` | crm helpers in a core package | Move under `packages/db/src/modules/crm/` (still the same package, subfolder per module). |
| URL slug `/comp-ai/companies` | workspace slug | Stays (cosmetic, see `docs/api.md`). Default workspace name comes from brand config. |

---

## 2. The module mechanism

### 2.1 Client config (the only thing that differs per client)

ONE repo, no forks (manager decision, 2026-11-04: a copy per client means every core fix is re-merged N times). Each client is a folder `clients/<id>/` holding `client.config.ts` plus `brand/` assets (logo, favicons). A deploy picks its client with env var `CLIENT_ID`. `clients/default/` (neutral brand, no modules) exists so dev and CI boot with no variable set. CI typechecks default plus every client folder. The config is validated by zod at boot (API and app both import it):

```ts
export default defineClient({
  brand: { name, shortName, tagline?, logo, favicon, primaryColor, supportEmail, emailFromName, domain },
  modules: ["bookkeeping"],            // "crm", "web-tracking", "salon" ...
  locale: { currency: "USD", timezone: "America/New_York" },
  features: { telemetry: false, landing: false },
});
```

Rules: unknown module id fails the boot with a clear message; a module whose `requires` is not listed fails boot; no secrets in this file (names of env vars only). Env override `ENABLED_MODULES` is allowed for one-off testing, not documented as the normal path.

### 2.2 Module definition (`packages/modules`)

Each module is a folder `packages/modules/<id>/` exporting `defineModule`:

```ts
defineModule({
  id: "crm",
  label: "CRM",
  requires: [],
  nav: [{ title, href, icon, match }],            // rail items
  settings: [{ title, href }],                     // settings sidebar items
  widgets: [{ id, slot: "overview", component }],  // overview widgets
  fieldEntities: ["COMPANY","CONTACT","DEAL"],
  permissions: { "crm.write": ["owner","admin","member"] },
  searchProviders: [...],
  seed: async (db) => {...},                       // idempotent
  agentTools: ["enrich_company", ...],
  apiModule: "CrmFeatureModule",                   // Nest module name
})
```

Server pieces (Nest module, routers) and client pieces (nav, widgets) cannot live in the same file without dragging Nest into the browser bundle. So the registry has two entry points per module: `meta.ts` (pure data, safe everywhere: id, labels, nav, permissions, requires) and `server.ts` / `client.tsx` (loaded only by the side that needs them).

### 2.3 How each surface switches

| Surface | Mechanism | Disabled behavior |
|---|---|---|
| Nav rail, mobile nav, settings sidebar | Built from `enabledModules().flatMap(m => m.nav)` plus core items | Item absent |
| Routes (`apps/app`) | Module route folders stay in the repo. Each module's layout calls `requireModule("crm")`, which calls `notFound()` | 404. No dead page reachable by URL. |
| Proxy gates (onboarding etc.) | Unchanged | n/a |
| tRPC routers | `AppModule` builds its import list with `enabledModules().map(m => m.apiModule)` (dynamic Nest module array) | Router not mounted, procedure unknown |
| Generated types | `src/generated/server.ts` still includes all routers (generator scans files; it is committed and must not regenerate at build, see `docs/api.md`) | Types exist, runtime absent. A UI path for a disabled module is unreachable anyway. |
| Permissions | Core helper `can(role, key)` reads module `permissions`; service and UI both call it (the existing rule: service enforces, UI hides) | Key unknown to disabled module returns false |
| Prisma models and migrations | All tables always migrated (D2). Module-owned models live in `packages/db/prisma/schema/<module>.prisma` using Prisma multi-file schema so ownership is visible. Spike needed: confirm multi-file schema works with the repo's Prisma version and the generator config; fallback is one file with `// module:` section headers | Tables exist, empty |
| Seed data | `bun run db:seed` runs `seed` for enabled modules only, each idempotent. Core seed first. | Nothing seeded for off modules |
| Agent tools | **Spike first**: read `apps/agent/node_modules/eve/docs` (needs `bun install`) for how tools are discovered and whether `defineTool`/`defineDynamic` can be conditional. Preferred: tool files live in `agent/tools/<module>/` and a build-time list excludes disabled modules. Fallback: a `moduleTool("crm", defineTool({...}))` wrapper whose `execute` refuses and a preamble that omits it | Tool not offered to the model |
| Agent instructions | `instructions.md` is composed from core text plus one section per enabled module (`agent/instructions/<module>.md`) | Section absent |
| Search / command palette | Providers registered per module | No results from off modules |
| Overview | Widget host reads enabled modules' widgets | Core greeting only |
| Cron / internal routes (`/internal/*`) | Controller part of the module's Nest module | Not mounted, so a cron hitting it gets 404; Render cron list is generated from config (hand-off to S1) |

### 2.4 Why this design (alternatives rejected)

- **DB-stored feature flags / admin toggle:** needs a UI, an authz story and cache invalidation, and a flag can drift from the deployed code. The owner's unit of change is a deploy.
- **Separate repo or fork per vertical:** loses "same core". Fixes to core would be re-merged by hand into N forks.
- **Separate Prisma schema per client:** migration history diverges per client; too costly.
- **Env var list only (no file):** fine for toggling, but brand and locale need a typed home too. One file holds both; env override stays as an escape hatch.

### 2.5 Adding a client (the target experience)

1. Add `clients/<id>/client.config.ts` (brand, modules, locale).
2. Drop logo and favicon files into `clients/<id>/brand/`.
3. Create a new Render deploy with `CLIENT_ID=<id>` and its own database.
4. `bun run db:deploy && bun run db:seed` for that deploy.
Anything beyond that (a custom field, a stage list) is data in Settings, not code.

### 2.6 Checks that keep it honest (a guard that is not on is not a guard)

- Lint rule: code under `packages/modules/<a>` may not import from `<b>` unless `<b>` is in `a.requires`. Verify by feeding it a violation.
- Test: boot the API with `modules: []` and with every module; assert the mounted router set equals the config.
- Test: with a module off, its route returns 404 and its nav item is absent.
- CI cold `check-types` runs for the default config AND an empty config.

---

## 3. Rebranding

Inventory from the repo (counts from a grep on 2026-11-04):

| What | Where | Fix |
|---|---|---|
| Package scope `@crm/*` | 11 workspace `package.json` names, 1433 occurrences in 517 files; root name `crm` | D4: codemod to `@app/*`, root `template`. Run once in a quiet window, then `bun install`, cold typecheck. |
| Page title and description | `apps/app/app/layout.tsx` ("Comp AI - CRM", "%s · Comp AI CRM") | Read from brand config via `generateMetadata`. |
| Web manifest | `apps/app/public/site.webmanifest` (name, short_name) | Generated from config (route handler `manifest.ts`). |
| Logo | `packages/ui/src/components/logo.tsx` (inline Comp AI SVG, aria-label "Comp AI Logo"); `entity-logo.tsx`, `wordmark.tsx` | `<BrandLogo />` reads config logo path; default is a neutral placeholder mark. |
| Favicons and app icons | `apps/app/public/{favicon*,apple-touch-icon,web-app-manifest-*}` | Per-client files from `brand/`, copied by a small script. |
| Brand colour | `packages/ui/src/styles/globals.css` (`--primary #006b4f`, `--ring`, `--sidebar-primary`) | Config `primaryColor` injected as a CSS variable in root layout. Rule from `docs/design.md` stays: same value both themes. Keep ring-lightening exception. |
| Default workspace name | `DEFAULT_WORKSPACE_NAME = "CRM"` in `packages/auth/src/organization.ts`; header renders `<name> CRM` | Default becomes `brand.name`; suffix comes from the enabled module set, not the literal "CRM". |
| Landing/marketing | `apps/app/app/(landing)/page.tsx`, `components/landing/*` (hero, product shot, GitHub star, footer), `IS_MARKETING` | Delete for the template. Keep only sign-in, grant-access, onboarding. |
| Agent text | `apps/agent/agent/instructions.md`, skills, tools mention Comp AI | Name comes from brand config at runtime (`lib/workspace.ts` already feeds who "we" are). Remove literals. |
| Telemetry | `packages/telemetry/src/project.ts` (PostHog key and `k.trycomp.ai`), env `CRM_TELEMETRY_DISABLED` | D7: off by default; if kept, owner supplies own key via env. Remove the hard-coded key. |
| Tests/fixtures | 20+ spec files mention comp ai domains | Replace with neutral fixtures during codemod. |
| Outbound email sender | no hard-coded sender found in `apps/api/src`; mail is sync, not send | Brand `emailFromName`/`supportEmail` ready for when sending is added (alerts). |
| Docs | `README.md`, `CONTRIBUTING.md`, `docs/*` mention CRM and Comp AI | Rewritten as each area is touched. README last. |
| LICENSE | keep crm MIT notice, owner copyright line above it (per DECISIONS.md) | Same for any file lifted from next-shadcn-dashboard-starter. |

---

## 4. Reference inventory

Source: research pass over `..\next-shadcn-dashboard-starter` (A, MIT, code reusable) and `..\relaticle` (B, AGPL-3.0, IDEAS ONLY: never copy or paste its code, never read it while writing the implementation in a way that reproduces it; describe the idea in our own words first). Paths below were reported by the research pass, not re-verified by me line by line; re-check when lifting.

Our baseline (so nothing is rebuilt): nav is a hard-coded array (`apps/app/components/app-icon-rail.tsx`); cmd+K exists (`components/crm/quick-switcher.tsx`); light/dark only (`app-header.tsx`); data table with nuqs and saved views exists (`components/data-table/*`, `packages/ui/src/components/data-table.tsx`); charts exist (`dashboard-chart.tsx`, `sales-dashboard.tsx`); custom fields have 10 types and no money type; no kanban, no i18n, no CSV import/export, no ledger or invoice models. Note the app has no `src/` folder (code is in `apps/app/app`, `components`, `lib`).

### 4.1 From next-shadcn-dashboard-starter (A, MIT)

Licence: `next-shadcn-dashboard-starter/LICENSE`, "Copyright (c) 2023 Kiranism". Any lifted file keeps that notice; add a root `THIRD_PARTY_NOTICES.md` carrying it in full. Stack gap: A uses `@base-ui/react`, TanStack Table v9, Clerk; we use Radix-based `packages/ui`, so UI lifts need a port and anything Clerk-bound is rewritten.

| Feature | A path | Lands in | Verdict |
|---|---|---|---|
| Typed nav config with groups and an `access{permission, role, feature}` block feeding sidebar and palette | `src/config/nav-config.ts`, `src/types/index.ts`, `src/hooks/use-nav.ts`, `docs/nav-rbac.md` | `packages/modules` `NavItem` type (section 2.2); filter hook rewritten for better-auth plus enabled modules | **Yes, Phase 3.** Add `module` key. Its plan/feature check is a stub; ours is real. |
| 10 CSS theme presets and selector | `src/styles/themes/*.css`, `src/components/themes/*` | Per-client brand theme in `packages/ui/src/styles` (optional named presets in `client.config.ts`) | **Yes, Phase 5.** CSS lifts directly; selector UI is a port. Must keep the `docs/design.md` rule (primary same in both themes). |
| Per-slot parallel-route overview with loading/error per widget | `src/app/dashboard/overview/@*`, `src/features/overview/components/*` | Overview widget host (section 2.3) | Pattern only. |
| Data table date and range filters | `src/components/data-table/*`, `src/hooks/use-data-table.ts` | `packages/ui` data-table | **Yes, Phase 7** for transaction lists. Needs TanStack Table v9; port selectively or reimplement on our version. |
| Kanban (dnd-kit) | `src/features/kanban/*`, `src/components/ui/kanban.tsx` | crm deals board; later salon appointments | Later (Phase 9). New dep `@dnd-kit/*`. |
| Multi-step forms (TanStack Form) | `src/features/forms/components/*`, `docs/forms.md` | Invoice wizard | Pattern; new dep. Decide in Phase 7. |
| File uploader | `src/components/file-uploader.tsx` | Receipts and attachments (bookkeeping) | Phase 7; new dep `react-dropzone`. |
| Breadcrumbs, page container, collapsible sidebar groups | `src/components/layout/*`, `breadcrumbs.tsx` | Core layout | Optional; only if the icon rail gets crowded with many modules. |
| kbar palette | `src/components/kbar/*` | none | Skip. Keep cmdk; generate palette actions from the nav config instead. |
| Auth, profile, billing, org switcher | `src/app/auth/*`, `profile`, `billing` | none | Skip. Clerk components. |
| Notifications center | `src/features/notifications/*` | core | Later, if needed. |

### 4.2 From relaticle (B, AGPL: ideas only)

| Idea | What to take (in our own design, no code) | Lands in |
|---|---|---|
| Feature flags read from config; code checks them for pages, onboarding steps, timeline sources | A typed `modules` map checked in nav, routers, onboarding | Section 2 (already the design) |
| Optional packages behind contracts with no-op defaults, one provider per package | Module = package with a registration entry point; core talks to contracts, not modules | `packages/modules/<id>` (section 2.2) |
| Entity registry (model, query, table, URL per entity) | Generalise `FieldEntity` into a registry modules extend | Section 1.2 and `packages/modules` |
| Use-case presets that seed stages and fields per workspace | Per-vertical seed preset (bookkeeping, salon) run by module `seed` | Module `seed` (section 2.3) and onboarding |
| Capability-based permissions | Capability keys like `bookkeeping.post`, `invoice.void`, checked in service and UI | `can(role, key)` (section 2.3) |
| CURRENCY custom-field type (amount plus currency code) | Add `CURRENCY` to `FieldType`, stored as minor units + code | Core fields, Phase 4 or 7 |
| Import wizard (map columns, infer types, match or upsert, review before commit) | Bank/CSV import flow with dry-run review, idempotent by external id | Bookkeeping bank import (5.1 rule 7) |
| Per-entity exporters | Accountant exports (CSV of journal, invoices) | Bookkeeping reports |
| List/board view switcher | Board view on deals and later appointments | crm, Phase 9 |
| Activation checklist, filterable by module | Per-module onboarding steps | Core onboarding, Phase 8 |
| Activity log page | Audit log screen over `AuditEvent` | Core settings, with bookkeeping |
| AI credit/entitlement gating | Idea only | Not needed now |

Neither reference has invoices, ledgers or a chart of accounts. The bookkeeping base is our own money rules (`docs/currency.md`, section 5.1).

Licence guard for the build: no file under `relaticle` is opened while implementing a related feature; designs in 4.2 are already stated here in our words. Any PR touching an area named in 4.2 states "no relaticle code".

---

## 5. Bookkeeping module outline (first module)

Read first when building: `money-truth-doctrine`, `report-verification`, `bank-reconciliation`, `standard-database-design`, `security-rls-permissions`. The doctrine is written for POS, but its core holds for books: money and its record are inseparable, never invent a number, detect and surface every gap, never hide money.

### 5.1 Money rules (non-negotiable)

1. **Amounts are `BigInt` minor units + an ISO currency code.** Never float, never `Decimal` for ledger amounts. Minor-unit exponent comes from `minorUnitsOf` in `@crm/db/currency` (reuse; 3-decimal currencies need it right).
2. **Double entry.** Every posting is a `JournalEntry` with at least two lines; sum of debits equals sum of credits per entry, per currency, checked in the service inside the same transaction AND by a database CHECK/trigger as backstop.
3. **Posted entries are immutable.** A correction is a new reversing entry (`reversesId`) plus a new correct entry. No UPDATE, no DELETE of posted lines. Drafts may be edited; "voided" is a status, never a delete.
4. **Report only from the ledger.** Trial balance, P&L, balance sheet, aging all read journal lines. Invoices, bills and payments are documents that POST entries; nothing sums document tables for a total.
5. **Frozen FX.** Same pattern as `docs/currency.md`: each line stores `amountMinor`, `currency`, `baseAmountMinor`, `baseCurrency`, `fxRate`, `fxRateAt`; rate resolved once at posting; missing rate is a disclosed null (`unconverted` count), never a zero. Every writer of a base amount writes the base currency in the same statement.
6. **Period lock.** A closed period rejects new postings dated inside it (service check plus DB guard). Reopen is an owner-only audited action.
7. **Idempotent intake.** Bank imports and any API/agent posting carry an `externalId`/idempotency key unique per source (reuse `packages/db/src/idempotency.ts`). Re-importing the same file cannot double-post.
8. **Atomic document + posting.** "Issue invoice" and its journal entry commit in one transaction. Where an external source is async (bank feed), stage the raw line first, then match, then post.
9. **Nothing is auto-deleted, nothing is silently dropped.** Unmatched bank lines and unbalanced imports surface in an Attention list and through the error reporter. An agent may propose entries; only a human posts above a threshold (config).
10. **Audit trail.** Every create/post/void/lock writes an `AuditEvent` row (who, what, before/after). New core table (or reuse the `AgentAuditEvent` shape), not the CRM `Activity` timeline.

### 5.2 Data model sketch (names provisional)

```
Account            id, code, name, type(ASSET|LIABILITY|EQUITY|INCOME|EXPENSE), parentId, currency?, archivedAt
Counterparty       id, name, kind(CUSTOMER|VENDOR|BOTH), email, taxId, contactId? companyId? (soft links to crm)
JournalEntry       id, number, date, memo, status(DRAFT|POSTED|VOIDED), reversesId?, sourceType, sourceId, postedAt, postedById, periodId
JournalLine        id, entryId, accountId, debitMinor, creditMinor, currency, baseDebitMinor, baseCreditMinor, baseCurrency, fxRate, fxRateAt, counterpartyId?
Period             id, start, end, lockedAt?, lockedById?
Invoice / Bill     id, number, counterpartyId, issueDate, dueDate, currency, status, totalMinor, entryId (the posting), lines[]
DocumentLine       id, documentId, description, quantity, unitMinor, accountId, taxRateId?
Payment            id, counterpartyId, date, amountMinor, currency, method, bankAccountId?, entryId, allocations[] (to invoices/bills)
BankAccount        id, name, accountId (ledger account), currency, lastImportedAt
BankTransaction    id, bankAccountId, date, amountMinor, currency, description, externalId (unique per account), status(UNMATCHED|MATCHED|IGNORED), matchedEntryId?
TaxRate            id, name, rateBasisPoints, accountId
Attachment         id, ownerType, ownerId, blobUrl (reuse packages/db/src/blob.ts)
```
Custom fields attach to Counterparty, Invoice, Bill via the core property registry (nullable FK columns on `FieldValue`, per 1.2). Access rules for each new table are decided in Phase 4 with `security-rls-permissions` (API-level permission keys: `bookkeeping.read`, `.write`, `.post`, `.close_period`).

### 5.3 Screens (user's job, not the schema's)

Overview widget (cash, receivable, payable, attention count). Invoices and Bills lists with record sheet. Payments. Bank (import CSV, match, create entry). Chart of accounts. Journal. Reports: P&L, balance sheet, trial balance, AR/AP aging, all with export. Settings: periods and locking, tax rates, default accounts. Agent: categorise bank lines, draft invoices from a note, explain a number; proposals only.

---

## 6. Phased checklist

Gate between phases: manager review. No phase starts before the one above is DONE and reviewed.

| # | Item | Status |
|---|---|---|
| 0 | This plan reviewed by manager; owner answers Q1 | TODO |
| 1 | **Spikes (no product code):** (a) Prisma multi-file schema works with current version; (b) eve tool discovery allows per-module exclusion; (c) lint rule for cross-module imports; (d) codemod dry run for `@crm/*` to `@app/*` on a scratch copy | DONE, results in section 8 |
| 2 | Quiet window: `@crm/*` to `@app/*` codemod + root rename, cold typecheck, tests green | DONE (e3dfbac). Also DONE: telemetry destination removed (70fac77), `.gitattributes` (2130175), real test baseline in `docs/testing.md` |
| 3 | `packages/modules` registry, `clients/<id>/client.config.ts` + zod (including `modules.options`, per-module settings), `requireModule`, nav and settings built from registry, overview widget host, **`can(role, key)` with ONE data-driven role list** (core roles + enabled modules' roles, e.g. bookkeeper, accountant) replacing the 3 literals listed in section 9, **core `AuditEvent` table + append-only triggers + `writeAudit(tx, event)` helper**, **per-module `seed` hook** | BLOCKED: waits for the owner's go via the manager |
| 4 | Move CRM code behind the `crm` module (API imports, routes, agent tools, seed); empty-config boot test; every-module boot test | TODO |
| 5 | Brand pass: layout metadata, manifest, `BrandLogo`, colour variable, workspace default name, delete landing, telemetry off (D7) | TODO |
| 6 | Reference imports from section 4 chosen by manager | TODO |
| 7 | Bookkeeping module v1: accounts, journal, invoices/bills, payments, periods, reports, bank import and match (sub-checklist created when Phase 6 is approved) | TODO |
| 8 | Docs: rewrite README, area docs for template; DECISIONS.md entries; updates folder note | TODO |
| 9 | Second module as proof (smallest salon-shaped one: appointments + services) to confirm the mechanism is not bookkeeping-shaped | TODO |

## 7. Risks

- Phase 2 touches 517 files and will collide with any open edit. Needs a freeze and S1's files committed first.
- Prisma multi-file schema or eve conditional tools may not behave as hoped; fallbacks are named in 2.3.
- `FieldValue` FK-per-entity grows the core schema with each module (1.2). Accepted for v1.
- crm docs (`docs/api.md`, `docs/agent.md`, others) describe CRM and Vercel; they stay accurate for the crm module but mislead for the template until Phase 8.
- Single-entity bookkeeping (Q1) is an assumption until the owner answers.

---

## 8. Spike results (2026-11-04)

| Spike | Result | What it means for the build |
|---|---|---|
| (a) Prisma multi-file schema | **PASS.** Prisma 7.10.1. A scratch copy of the real schema split into `base.prisma` (datasource, generator, core models) and `mod.prisma` validated and generated; a moved model's generated code was byte identical to the single-file output. | Module models go in `packages/db/prisma/schema/<module>.prisma`. `prisma.config.ts` points `schema` at the directory. The datasource and generator blocks stay in exactly one file. Migrations stay one linear folder. Agents cannot run `migrate dev`/`reset` non-interactively: write the migration with `prisma migrate diff --from-config-datasource --to-schema <dir> --script`, save it as the migration folder, then `migrate deploy`. Knip's `.prisma` handling needs a glance when the split happens. |
| (b) eve per-module tool exclusion | **PASS on the docs, compile trial still owed.** `apps/agent/node_modules/eve/docs/guides/dynamic-capabilities.md`: a tool file may `export default defineDynamic({ events: { "session.started": ... } })` and return a `defineTool(...)` or `null` to omit it; instructions, skills, connections and subagents resolve the same way. Static `disableTool()` also exists but is not config driven. | Each module's tool files become `defineDynamic` wrappers that return the tool only when `isModuleEnabled(id)`. Rules from the docs: tool callbacks and schemas inline inside `defineTool`, closure values JSON serializable, imported helpers stay live code. Existing tools call into `lib/*`, so the wrap is mechanical. Trial first: wrap one CRM tool, run `bun run build` in `apps/agent`. Fallback: the tool's `execute` refuses when the module is off. Instructions per module use dynamic instructions. |
| (c) cross-module import rule | **PASS.** Biome 2.5.15 `style/noRestrictedImports` with `patterns`, set per folder through `overrides[].includes`. In a scratch project `crm/bad.ts` importing bookkeeping and `bookkeeping/bad.ts` importing crm were both reported with the custom message; `crm/ok.ts` (same module) was not. | Add overrides to `biome.jsonc`: one block per module forbidding the other modules' paths and package names. A module's `requires` is the only exception, so the override list is generated from the registry or reviewed when a module is added. |
| (d) codemod dry run | **PASS, then run for real.** Only the plain `@crm/` form existed (518 files, no `@crm` variant, no `@app/` collision). | Done in e3dfbac. |

## 9. Role literals to replace in Phase 3 (from Session 3's spike)

`Member.role` is a free String (`packages/db/prisma/schema.prisma`). Three places restrict it, and two quietly turn an unknown role into `member`:
- `WORKSPACE_ROLES` and `toWorkspaceRole` in `packages/auth/src/organization.ts`
- the duplicate `toRole` in `apps/api/src/workspace/workspace.service.ts`
- `z.enum(WORKSPACE_ROLES)` in `apps/api/src/workspace/workspace.contracts.ts`

Plan: one role list = core roles plus enabled modules' roles, read by all of them; unknown stored roles are kept, not demoted; a test proves a stored `bookkeeper` survives a read.

## 10. Standing facts for the next agent

- Real tests need a throwaway Postgres: `docs/testing.md`. Baseline there: 4 known failures.
- Plain `bun run lint` works (LF enforced by `.gitattributes`).
- Telemetry sends nothing unless `TELEMETRY_POSTHOG_KEY` and `TELEMETRY_POSTHOG_HOST` are set.
- No phase starts without the owner's go, relayed by the manager.
