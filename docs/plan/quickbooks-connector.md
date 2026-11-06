# QuickBooks Online connector (module `quickbooks`)

Status: PLAN ONLY. Nothing here is built. Written by Agent 2 on 2026-11-06 for the manager (automate-anything-5a).
Owner decision this plan serves: "the default should be what people have and if they don't there is an option."
So a client who already uses QuickBooks Online (QBO) gets the `quickbooks` module, and QuickBooks stays their official books. The built-in Books module (`bookkeeping`) stays for clients with no accounting software.

Read this first: how much of Intuit's documentation I could actually read.
Intuit's developer site (developer.intuit.com) is a JavaScript app. My fetcher got an empty shell from most pages, and the Intuit help-center articles and blog posts were also unreadable (blog links redirect to Medium, which was blocked). So every Intuit fact below is tagged:

- **[read]** I read the page text this session.
- **[search]** It came from a search result that quotes or summarises Intuit's docs; the primary page was unreadable. Treat as likely, re-check before building.
- **[memory]** From my background knowledge, NOT checked this session. Re-check before building.
- **[unconfirmed]** I could not establish it either way.

Section 4 lists everything that needs a human with a browser to confirm.

---

## 0. Repo facts this plan relies on (checked 2026-11-06)

- Module contract: `packages/modules/src/define-module.ts`. Fields are `id, label, description, routers, requires, nav, settings, widgets, roles, permissions, fieldEntities, optionsSchema`. There is `requires` but **no conflict field yet**. `NAV_ICON_KEYS` is only `company, contact, deal, ledger`; `WIDGET_SLOTS` is only `overview`.
- Registries (`packages/modules/src/registry.ts`, `apps/api/src/modules/registry.ts` `MODULE_API`) and `apps/app/proxy.ts` are append-only hotspots shared with Agent 4 (property tax). Every change to them in this plan is a one-line append.
- All product modules' Nest modules are mounted at boot; the `AuthMiddleware` returns NOT_FOUND for a switched-off module's routers (round 2 of the developer account work). The module's `routers` list in `meta.ts` is what makes that gate work, so a new router MUST be listed there. `apps/api/test/module-gate.spec.ts` fails if a router is not owned by a module or in `CORE_ROUTERS`.
- Scheduler: `apps/api/src/scheduler/scheduler.service.ts`. An in-process tick every 60s; each job has a `name`, a Postgres advisory `lockKey` (1 to 5 are taken), a `schedule` of `{ everyMinutes }` or `{ dailyAtUtcHour }`, and `run()`. Success and failure are stored in `SchedulerRun`. The scheduler runs whether or not a module is on, so a module job must do nothing when its module is off or the connection is missing.
- Connections today: Google and Microsoft tokens live in better-auth's `account` table. MCP connections (`McpConnection` in `base.prisma`) store `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiresAt` with a status enum, encrypted by `createSecretBox` (`packages/auth/src/secret-box.ts`, key `MCP_ENCRYPTION_KEY`, 32 base64 bytes). QuickBooks is a per-deploy (not per-user) connection, so it follows the `McpConnection` shape, not the `account` table.
- CRM money today: `Deal.amount` is `Decimal(14,2)` with a `currency` string and an FX base amount. Bookkeeping uses BigInt minor units. The new module stores its own money as BigInt minor units and converts at the edge. No `0n` literals (the web app targets ES2017); use `BigInt(0)`.
- CRM `Company` has `domain` (unique among non-archived), `email`, `phone`, `city`, `stateCode`, `country`, `archivedAt`; `Deal` belongs to one `Company` and has a `stage` and `closedAt`.
- Permissions are checked in tRPC middleware AND in the service (project rule). Audit rows go through `writeAudit(tx, ...)`.
- Writes to the Prisma schema need a hand-written additive migration; `apps/api/src/generated/server.ts` is never hand-edited.

---

## 1. The jobs, from the owner's seat (Step Zero)

Who: the owner of a small business (service company, 1 to 15 people) who already keeps books in QBO, usually with an outside bookkeeper. They live in our CRM all day and open QuickBooks a few times a week. They do not want to type anything twice and they must never be afraid the CRM will damage their books.

The jobs they would hire this for, in their words, ranked by how often and how much it hurts when missing:

| Rank | Job in their words | How often | Screen that does it |
|---|---|---|---|
| 1 | "I won the deal. Bill them without retyping it in QuickBooks." | Every won deal, several a week | Won deal page: **Create invoice in QuickBooks** button, opens a short review sheet (customer, amount, due date, line), then a link **Open in QuickBooks** |
| 2 | "Is this customer already in QuickBooks? Make them the same customer." | Once per customer, plus a big one-off at connect time | Settings, QuickBooks: **Match customers** review list; company page shows a QuickBooks chip (linked, or **Link to QuickBooks customer**) |
| 3 | "Who owes me money, and has this one paid?" | Daily glance | Company page and deal page show **Owed** and **Paid / Overdue**; dashboard widget **Owed to you** (top overdue) |
| 4 | "How are we doing this month?" (profit and loss) | Weekly | Dashboard widget with income, expenses, net for this month, with **As of** time and **Open in QuickBooks** |
| 5 | "I connected it. Is it working? It stopped." | Setup once; then only when broken | Settings, QuickBooks: connection card (company name, last synced, **Reconnect**, **Disconnect**) and a banner when the token died |

Chain check (Step Zero rule: name the screen for every step):
connect (job 5) -> match customers (job 2) -> invoice a won deal (job 1) -> see it paid (job 3). Each step has a named screen above. P&L (job 4) is a read-only extra that does not block the chain.

**Recommended v1 = jobs 5, 2, 1, 3.** That is the full loop from "connected" to "paid". P&L (job 4) ships after, as its own round, because it is the most expensive in API calls and the least tied to the CRM.

Decisions inside job 1, with the reasoning:
- **Draft or sent?** QBO has no true "draft" state for an invoice [memory]. An invoice is either created and unsent, or emailed. Recommend: v1 creates the invoice **unsent** (it exists in QuickBooks, nothing goes to the customer) and the owner or bookkeeper sends it from QuickBooks. A customer-facing email from a tool that was wired up a minute ago is the one mistake that can embarrass the owner. A later setting can add "email it on creation".
- **Automatic or on click?** On click, with a confirmation sheet. Automatic creation on "won" is a v2 option (a switch in settings), because a deal marked won by mistake would otherwise create a real invoice in their books.
- **One invoice per deal.** The link row stores our request id so a double click or a retry never creates a second invoice (see 2.5).
- **What goes on the invoice:** customer, deal name as the line description, deal amount as one line, currency, due date from terms. Line items from a product catalog are out of scope for v1 (the CRM has no catalog).
- **Currency:** v1 refuses to invoice when the deal currency is not the QBO company's home currency, with the plain message "This deal is in EUR but your QuickBooks is in USD. Change the deal's currency first." Multi-currency invoicing is a later round (QBO needs multi-currency turned on for the company [memory]).
- **Sales tax:** v1 sends no tax lines; QuickBooks' own tax settings apply at its end [unconfirmed how QBO US automated sales tax treats API-created invoices]. Called out as an owner question (section 7).

Not in v1 (said plainly so nobody assumes): importing QBO invoices that were not made from a deal, bills and vendors, bank feeds, chart of accounts, journal entries, payroll, two-way editing of customers, attachments, estimates, credit memos, recurring invoices.

---

## 2. Data flow

### 2.1 Direction and source of truth, per entity

Principle: **QuickBooks owns money and billing identity. The CRM owns the relationship.** The connector never overwrites the other side's fields silently.

| Entity | Direction | Source of truth | Notes |
|---|---|---|---|
| Customer (QBO) <-> Company (CRM) | Link in v1, one-way data flow | QBO for billing name, billing address, balance. CRM for owner, stage, contacts, notes, domain | A link row joins them. v1 creates a QBO customer from a CRM company only on an explicit click and only if no match exists. After linking, no automatic field copying either way. |
| Invoice (QBO) from Deal (CRM) | CRM -> QBO create, then QBO -> CRM read-only | QBO | CRM creates once. After that the invoice's amount, balance, status, due date are read from QBO into the link row and never edited from the CRM. To change an invoice, open it in QuickBooks. |
| Payment (QBO) | QBO -> CRM read-only | QBO | Seen through the invoice's balance going down. No Payment entity is stored in v1. |
| Balance per customer | QBO -> CRM read-only | QBO | Stored on the customer link with an "as of" time. |
| P&L report | QBO -> CRM read-only, cached | QBO | One report call per refresh, cached in the database for hours. |
| Items, accounts, tax codes | Read lazily only if the invoice sheet needs them | QBO | The default income "Services" item must exist; if it does not, the sheet asks the user to pick one. |

### 2.2 Conflict rules

1. No two-way field sync in v1, so there are no field conflicts to resolve. That is deliberate: the usual failure of accounting connectors is a sync loop that renames a customer back and forth.
2. Every QBO write that updates (not creates) uses the entity's `SyncToken`; a stale token means somebody edited it in QuickBooks meanwhile [memory: QBO rejects a stale SyncToken]. The connector re-reads, shows the user what changed, and never auto-retries with a forced overwrite.
3. If a linked QBO customer is deleted or made inactive in QuickBooks, the link is marked `GONE`, the company chip says "Customer removed in QuickBooks", and invoicing for that company is blocked until the user relinks. Nothing is deleted on the CRM side.
4. If a CRM company is archived, the link stays. If it is unarchived, it resumes.
5. A QBO invoice that was voided or deleted: the link row shows `VOIDED` or `DELETED`, the deal shows "Invoice voided in QuickBooks", and the button **Create invoice** is offered again (new request id).

### 2.3 Matching and dedup of existing customers (job 2)

At connect time (and on demand) the connector pulls all QBO customers with a paged query (max 1000 per page [read: limits page]) and proposes matches. Never auto-merges a fuzzy match. Order, strongest first:

1. **Existing link** (QBO customer id already on a company). Done.
2. **Exact email**: QBO customer primary email equals a CRM company email or any of its contacts' emails (lower-cased, trimmed).
3. **Exact domain**: the domain of a QBO customer's email or website equals the CRM company's `domain` (reuse `normalizeDomain` in `apps/api/src/companies/domain`). Skip free-mail domains (gmail.com and similar) for this rule.
4. **Normalised name**: equal after lower-casing, removing punctuation and suffixes (inc, llc, ltd, co, the). Exact only.
5. **Suggestions**: fuzzy name matches are shown as "Maybe" with a score and need a click.
6. **No match**: the QBO customer is listed as "Not in your CRM" with **Create company** (creates a CRM company with `source` set to the QuickBooks source value) and **Skip**. The CRM company with no QBO match is listed with **Create in QuickBooks** and **Skip**.

Rules: rules 2 to 4 that point to exactly one pair are shown pre-ticked in a review list for one-click **Confirm all**; any rule that points to two-or-more candidates is "Maybe" and needs a pick. A QBO customer already linked to a company cannot be linked to a second one (unique constraint). Duplicate QBO DisplayNames cannot exist inside one QBO company [memory], which makes "create in QuickBooks" collisions possible: the connector checks by name first and offers to link instead.

### 2.4 Webhooks, Change Data Capture (CDC), or polling

What Intuit offers:
- **Webhooks** [read: configure-webhooks page]: POST to one URL configured per app in the developer dashboard, separately for Development (sandbox) and Production. Payload is a JSON array of CloudEvents-style notifications (`specversion`, `id`, `source`, `type` such as `qbo.invoice.updated.v1`, `time`, `intuitentityid`, `intuitaccountid` = realm id). A single delivery can contain several realms. Verify with HMAC-SHA256 of the raw body keyed by the verifier token, Base64, compared to the `intuit-signature` header. Supported entities include Customer, Invoice, Payment, Estimate, Account and more. First delivery after setup can take up to five minutes. The page gave **no** retry policy and no required response time [read: not stated]. The webhook payload structure is changing: a 2025-11-12 Intuit post is titled "upcoming change to webhooks payload structure", and a community thread mentions a legacy-format retirement extended to 2026-06-30 for US partners [search, inconsistent]. I could not read the post, so the exact current format and cut-off are [unconfirmed].
- **CDC** [read in search snippets, official API reference]: one call lists changed entities since a timestamp, **look-back at most 30 days**, **at most 1000 objects per response**, and Intuit advises shorter windows so nothing is cut off [search of the CDC page].
- **Query API**: up to 1000 entities per response [read].

Fit with this repo, and the recommendation:
- **Webhook URLs are per app, not per deploy.** Our model is one deploy per client. If all clients share one Intuit app (recommended, section 4), a single webhook URL cannot be the API of every client deploy. Options: (a) one Intuit app per client (a questionnaire and keys per client), (b) a small shared relay that receives the webhook and forwards it by realm id to the right deploy, (c) no webhooks in v1.
- **Recommend (c) for v1: CDC polling on the existing scheduler, every 15 minutes, plus a "Sync now" button.** Reasons: it needs no public endpoint and no relay; one CDC call every 15 minutes is about 2,900 calls per client per month, far below the Builder tier cap [read: 500,000 CorePlus calls per workspace per month, then HTTP 429]; and a polled design is also the safety net you need anyway, because webhooks can be missed. Note the cap is **per workspace**, so it is shared by all client deploys using the same Intuit app: 100 clients at this rate is about 290,000 calls a month, which is why the interval is configurable and the relay in the last round is worth doing at scale. Whether a CDC call counts as CorePlus (metered) or Core (free) is [unconfirmed]; assume metered.
- Add webhooks later (last round) through a relay, as a trigger that calls the same CDC function sooner. Webhooks never carry data we trust: they only say "something changed for realm X", then the CDC job fetches the truth. That keeps one code path.

Scheduler job (append in `scheduler.service.ts`; use lock key 7; key 6 is kept for Agent 4 if it adds a job, per the manager):
- `name: "quickbooks-sync"`, `schedule: { everyMinutes: 15 }`, `run: () => quickbooks.syncDue()`.
- `syncDue()` returns immediately when the module is switched off (`enabledModules()` check), when there is no connection, or when status is `NEEDS_RECONNECT`.
- It runs CDC from the stored `cdcWatermark` (the `time` the previous successful response was taken at, minus a 2 minute overlap), for Customer and Invoice (and Payment if needed), pages if 1000 objects came back, then upserts links idempotently (compare the entity's `MetaData.LastUpdatedTime` or SyncToken, ignore older). The watermark only advances after the whole run commits.
- If the connection was down more than 29 days, CDC cannot cover the gap [read: 30 day max look-back]: run a full resync (paged queries) instead.
- Throttling: respect 500 requests per minute and 10 per second per realm [read]. On HTTP 429 wait 60 seconds [read] and end the run; the next tick resumes from the watermark.
- A failure is recorded in `SchedulerRun.lastError` (existing) and in the connection's `lastError`.

### 2.5 Safe writes (create customer, create invoice)

- Pending row first: insert the link row with status `PENDING` and a generated `requestId` in one transaction, commit, then call QBO. QBO's create calls accept a `requestid` query parameter that makes a retry idempotent [memory, unconfirmed]; if that proves wrong, the connector queries QBO by DocNumber / DisplayName before retrying.
- A crash between the QBO call and our commit leaves a `PENDING` row; the next sync run reconciles it by looking it up in QBO.
- Every write is audited with `writeAudit` (`QUICKBOOKS_INVOICE_CREATED`, `QUICKBOOKS_CUSTOMER_LINKED`, `QUICKBOOKS_CONNECTED`, `QUICKBOOKS_DISCONNECTED`).

---

## 3. Connect flow

One QBO company (realm) per client deploy. Mirrors the existing Google/MCP connection pattern but at deploy level.

**Connect** (Settings, QuickBooks, button **Connect to QuickBooks**, owner or admin only):
1. API builds the Intuit authorization URL (OAuth 2.0 authorization code flow) with scope `com.intuit.quickbooks.accounting`, a random `state` stored server-side with the user id and a 10 minute expiry, and our redirect URI.
2. Intuit shows its consent screen; the user picks the company; Intuit redirects back with `code`, `realmId`, `state`.
3. API checks `state`, exchanges `code` for tokens at Intuit's token endpoint, reads `CompanyInfo` for the company name and country, and stores the connection. The user lands back on Settings, QuickBooks, which then offers **Match customers**.
Endpoint URLs and the scope string are [memory/search], to be read off the OAuth page during R1: authorization `https://appcenter.intuit.com/connect/oauth2`, token `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`, revoke `https://developer.api.intuit.com/v2/oauth2/tokens/revoke`, API host `https://quickbooks.api.intuit.com` (sandbox `https://sandbox-quickbooks.api.intuit.com`). All [unconfirmed this session]. The OAuth page is https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0 (unreadable by my fetcher).

**Tokens**:
- Access token lifetime 3,600 seconds; an expired token gives HTTP 401 [search of Intuit docs].
- Refresh token lifetime **100 days, rolling** (the window extends each time it is used), hard cap 5 years, after which the user must authorize again [search]. 
- **The refresh token string rotates**: Intuit returns a new refresh token roughly every 24 hours of use and the previous value stops working [search, from Intuit's token-expiry article]. So the code MUST persist the newest refresh token from every refresh response, and must never reuse the old one. Failing to do so shows up as `invalid_grant` [search].
- Storage: a new `QuickbooksConnection` row (one per deploy), tokens encrypted with `createSecretBox` (same helper as MCP), never logged, never sent to the web app, never returned by any procedure.
- **Refresh must be single-flight.** Two syncs refreshing at once would burn the rotated token. Do the refresh under a Postgres row lock (`SELECT ... FOR UPDATE` on the connection row) or an advisory lock: lock, re-read, refresh only if still near expiry, write the new pair, unlock. Refresh when fewer than 5 minutes remain.
- Because the scheduler uses the connection every 15 minutes, the refresh token is used constantly and the 100 day idle expiry cannot happen in normal operation. It can happen if the module is off for 100 days or the deploy was down.

**What the user sees when the token dies** (invalid_grant on refresh, a 401 that persists after a refresh, or the user revoked access in Intuit):
- Connection status becomes `NEEDS_RECONNECT` (no retry storm: the sync job stops until reconnected).
- A banner on Settings, QuickBooks and on the dashboard widget: "QuickBooks disconnected. Your invoices and balances are paused. [Reconnect]". On company and deal pages the QuickBooks chip shows "Paused" with the last known balance and an "as of" date, greyed, not hidden.
- **Create invoice** is disabled with the reason "QuickBooks is disconnected. Reconnect to create invoices."
- Owner and admins get a one-time notification and an audit row (`QUICKBOOKS_DISCONNECTED_BY_PROVIDER`). Email is only used if the repo's mail path exists (check at build time).
- **Reconnect** runs the same flow; it must return the **same realmId**. If a different company is chosen, refuse with "That is a different QuickBooks company. Disconnect first if you meant to switch." Switching companies is a separate, confirmed action that clears links.

**Disconnect** (owner or admin, confirm dialog): call Intuit's revoke endpoint [memory], then delete the stored tokens and set status `DISCONNECTED`. Keep link rows and cached amounts (labelled "as of") so a reconnect to the same company picks up where it left off; offer a second checkbox **Also forget the links and cached amounts**. Nothing is ever deleted in QuickBooks. If revoke fails (network), still delete our tokens, and say "Disconnected here. If it still shows in QuickBooks, remove it under Apps in QuickBooks."

---

## 4. Intuit realities and what the owner must do

| Topic | What I found | Source / tag |
|---|---|---|
| Sandbox vs production keys | Development keys talk only to sandbox companies (fake data). Production keys are issued after the app assessment and connect to real companies. Webhooks and redirect URIs are configured separately per environment. | Webhooks page [read]; the key split [memory] |
| Production app assessment | The questionnaire applies to private (unlisted) apps too if they connect to production QBO companies. In the dashboard: app, Production Settings, App assessment questionnaire. Reported to take about 30 minutes to fill, can be saved as a draft. Covers app details, hosting location, regulated industry flag, security and privacy questions; also needs a privacy policy URL and an end-user license / terms URL and https redirect URIs [memory]. | [search: Codat, Railz, Apideck, third-party guides; not Intuit's own page] |
| Review time | No official SLA found. Third-party sources say "fast, in most cases", one says "a few hours"; an App Store listing review (a different, longer process) is quoted at 2 to 4 weeks. Plan for days to 2 weeks and build against sandbox meanwhile. Ask Intuit Developer Support for a date. | [search, conflicting, unconfirmed] |
| Pricing | The Intuit App Partner Program starts everyone in the **Builder** tier: **500,000 CorePlus API calls per workspace per month**, beyond which calls are throttled with HTTP 429 [read: limits page]. Higher tiers (Silver and up) are paid; third-party summaries put Silver at about $300 a month with 1,000,000 CorePlus credits and a March 2026 guide lists fees up to $4,500 a month for Platinum [search, third party, treat as unreliable]. "Core" calls (mostly writes, the creates) are uncapped and free; "CorePlus" is the metered read-heavy set (reads, queries, reports) [search of Intuit blog text]. I could not read Intuit's rate card or partner FAQ. | [read] cap; rest [search/unconfirmed] |
| Does a private app serving only our own clients count? | Unconfirmed. The cap is "per workspace", which suggests all deploys on one Intuit app share one allowance. | [unconfirmed] |
| One Intuit app for all deploys? | Intuit apps support several redirect URIs and each client authorizes its own company [memory]; I could not confirm a limit on redirect URIs or on clients per app. Recommend ONE app owned by us. | [unconfirmed] |
| Rate limits | **500 requests per minute per realm ID; 10 requests per second per realm ID and app** (800 per minute if you also hit non-QBO endpoints). Batch endpoint: up to 30 payloads per batch, 40 batch requests per minute per realm. HTTP 429 when throttled; wait 60 seconds. Requests over 120 seconds time out. Query results max 1000 entities. Sandbox limits listed the same. | [read] https://static.developer.intuit.com/output_html/qbo/docs/learn/limits-and-throttles.html |
| Minor version | Intuit deprecated minor versions 1 to 74 from 2025-08-01; requests without a valid `minorversion` default to 75 behaviour, and apps were told to pass 75 explicitly. Whether 75 is still the minimum in Nov 2026, and any newer one, is not established. Send `minorversion` explicitly from one constant, set to 75 until R1 re-checks the changelog. | [search: Intuit blog quoted by Codat/Domo/python-quickbooks] |
| Data storage terms | Whether Intuit's terms limit how long or where we store QBO data is unconfirmed. Our design stores only link ids, balances, statuses and cached report numbers, not full ledgers. | [unconfirmed] |

**What the owner must do (and rough time):**
1. Create (or reuse) an Intuit Developer account and workspace with a US company address so the app lands in the Builder tier [search: "US based address ... default to Builder"]. 15 minutes.
2. Create one app, "Automate Anything", with the accounting scope. 15 minutes. Gives sandbox keys immediately, so the build can start the same day.
3. Publish a privacy policy page and a terms / EULA page on our domain and give the URLs. Depends on whether we already have them. Hours.
4. Fill the app assessment questionnaire for production keys. About 30 minutes of typing [search], then Intuit review: unknown, plan 2 weeks of slack. This runs in parallel with the build.
5. Give the practice deploy's redirect URI (`<APP_URL>/api/quickbooks/callback`; practice: `https://practice-app-af4x.onrender.com/api/quickbooks/callback`) and later each client's. Per client: add the redirect URI in the dashboard (and the webhook relay later). Minutes.
6. Put `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET` in Render for the API service (secret, `sync: false`).
7. Per client: an admin of the client's QBO company clicks **Connect** and approves. The Intuit user needs permission to authorize apps on that company (company admin) [memory].

---

## 5. Coexistence with the Books module

Recommendation: **they cannot both be on.** Two sets of books would disagree, and "QuickBooks stays their official books" is the owner's rule.

Mechanism (new, small, lives in files I own from the developer-account work):
- Add an optional `conflicts: string[]` to `defineModule` (pure data, same validation as `requires`: module-id regex, unique, not self).
- Declare it on **`quickbooks` only**: `conflicts: ["bookkeeping"]`, and treat the relation as symmetric in code. That way nothing in `packages/modules/bookkeeping/**` (Agent 3's area) has to change.
- Enforce in three places: (1) `modules.service.set` (switching `quickbooks` on while `bookkeeping` is on, or the reverse, is refused with a reason, in a transaction like the `requires` check); (2) `resolveModuleIds` / `ENABLED_MODULES` at boot: a config naming both is a startup error with a plain message; (3) the Features list shows the blocked reason and disables the switch (same UI as "requires").
- Switching QuickBooks on while Books has data: refuse, say "Switch off Books first." Books data is never deleted by switching it off; it stays and returns if they ever come back.
- Provisioning default: a client config (`clients/<id>/...`) lists `modules`. New clients who use QuickBooks start with `["crm","quickbooks"]`; clients without accounting software start with `["crm","bookkeeping"]`. That is the "default is what people have" rule in config.

What the Features page says (copy, plain language):
- QuickBooks row description: "Connect your QuickBooks Online. Create invoices from won deals and see who owes you, right in the CRM. Your books stay in QuickBooks."
- When Books is on: switch disabled, text "Switch off Books first. A business keeps one set of books."
- Books row when QuickBooks is on: switch disabled, text "Not available while QuickBooks is on. Your books are kept in QuickBooks."
- Confirm dialog on switching QuickBooks off: "Turn off QuickBooks? Invoices and balances stop showing here and syncing stops. Nothing changes in QuickBooks. Your connection and links are kept, so turning it back on picks up where you left off." (Tokens are kept but the job is a no-op while off; after 100 days of being off the token expires and a Reconnect is needed, which the page says.)

---

## 6. Module shape and build rounds

### 6.1 Shape (existing pattern)

- `packages/modules/quickbooks/meta.ts` (pure data):
  - `id: "quickbooks"`, `label: "QuickBooks"`, `description` as in section 5, `requires: ["crm"]`, `conflicts: ["bookkeeping"]`.
  - `routers: ["quickbooks", "quickbooksCustomers", "quickbooksInvoices", "quickbooksReports"]` (the tRPC aliases; the module-gate test requires every one listed).
  - `nav: []` (no rail item: this is an integration, not an app area; the rail icon set has no QuickBooks icon and adding one is a core change). `settings: [{ title: "QuickBooks", href: "/settings/quickbooks", after: "/settings/connections" }]` (check the real sibling href when building).
  - `widgets: [{ id: "quickbooks.owed", slot: "overview" }, { id: "quickbooks.profit", slot: "overview" }]`.
  - `roles: []` (core roles only). `permissions`:
    - `quickbooks.read`: owner, admin, member (see balances and invoice status)
    - `quickbooks.invoice`: owner, admin, member (create an invoice from a won deal)
    - `quickbooks.link`: owner, admin (confirm customer matches, create customer in QBO)
    - `quickbooks.connect`: owner, admin (connect, reconnect, disconnect)
    - `quickbooks.reports`: owner, admin (P&L widget)
  - `fieldEntities: []`.
- Registry appends (hotspots, one line each): `packages/modules/src/registry.ts` (add `quickbooks`), `apps/api/src/modules/registry.ts` `MODULE_API` (add `quickbooks: [QuickbooksModule]`), the web widget id map (add the two widget ids), the web module-page map if any. Check Agent 4's property-tax additions merged first, and rebase on them rather than resolve by hand.
- API: `apps/api/src/quickbooks/` with `quickbooks.module.ts`, `quickbooks.contracts.ts`, `quickbooks.router.ts` (+ small routers), `connection.service.ts` (OAuth, token store, refresh single-flight), `intuit.client.ts` (fetch wrapper: base URL by environment, `minorversion`, retries only on 429/5xx, 429 waits 60s, 401 triggers one refresh), `customers.service.ts` (matching, linking), `invoices.service.ts`, `sync.service.ts` (CDC job body), `reports.service.ts`, `money.ts`.
  - Permissions checked in middleware AND in each service method (project rule).
  - OAuth callback is an unauthenticated browser redirect from Intuit: do it as a Nest controller route (not tRPC) that validates `state` (single use, bound to the user who started it, 10 minute expiry) and then redirects to the settings page. Add the route to the public list in the web `proxy.ts` only if the callback lands on the web app; prefer the API host to avoid touching `proxy.ts` (hotspot).
  - Agent tools: none in v1. Later read-only tools gate with `requireModuleOn`-style helper in `apps/agent/agent/lib/module-gate.ts`.
- Schema: new file `packages/db/prisma/schema/quickbooks.prisma` (the `bookkeeping.prisma` precedent), hand-written additive migration `packages/db/prisma/migrations/<timestamp>_quickbooks/migration.sql`, `CREATE TABLE IF NOT EXISTS`, no changes to existing tables:
  - `QuickbooksConnection` (single row; `id`, `realmId`, `environment` SANDBOX|PRODUCTION, `companyName`, `homeCurrency`, `status` CONNECTED|NEEDS_RECONNECT|DISCONNECTED, `encryptedAccessToken`, `encryptedRefreshToken`, `accessTokenExpiresAt`, `refreshTokenIssuedAt`, `connectedById`, `connectedAt`, `lastSyncedAt`, `cdcWatermark`, `lastError`; unique on a constant so only one row can exist).
  - `QuickbooksCustomerLink` (`companyId` unique, `qboCustomerId` unique, `syncToken`, `displayName`, `balanceMinor BigInt`, `currency`, `status` LINKED|GONE|PENDING, `matchedBy` EMAIL|DOMAIN|NAME|MANUAL|CREATED, `balanceAsOf`).
  - `QuickbooksInvoiceLink` (`dealId` unique per active invoice, `qboInvoiceId` unique, `docNumber`, `totalMinor BigInt`, `balanceMinor BigInt`, `currency`, `dueDate`, `status` PENDING|OPEN|PAID|PARTIAL|OVERDUE|VOIDED|DELETED, `requestId` unique, `createdById`, `lastSyncedAt`).
  - `QuickbooksReportCache` (`kind`, `periodKey`, `payloadJson`, `fetchedAt`).
  - `QuickbooksOauthState` (`state` unique, `userId`, `expiresAt`, `usedAt`).
  - Money is BigInt minor units; convert from `Decimal` via one helper that uses the currency's minor-unit exponent. Never write a `0n` literal; use `BigInt(0)`.
- Env (the three places an env var must be added; I read "env trio" as these three, correct me if it means something else): (1) `apps/api/src/config/env.validation.ts` with `@ValidateIf` so they are optional when the module is off; (2) `.env.example` and `turbo.json` global env list; (3) `render.yaml.template` and each `clients/<id>/render.yaml`, API service only, `sync: false`.
  - `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_ENVIRONMENT` (`sandbox` or `production`, default `sandbox`), `QUICKBOOKS_ENCRYPTION_KEY` (32 base64 bytes; or reuse `MCP_ENCRYPTION_KEY` to save one secret, see question 5).
  - Redirect URI derived from the API base URL; no extra var.
- Web: `apps/app/app/(app)/[slug]/settings/quickbooks/` (connection card, match review, status), a QuickBooks chip component used on company and deal pages, the **Create invoice** sheet on the deal page, two overview widgets. Wrap module-owned pages in `<ModuleGate id="quickbooks">`. Labels follow the app's existing words ("company", not "customer", on our side; "customer" only when it names the QuickBooks record).
- Tests (written, not run locally, per owner rule): pure-unit tests for matching, money conversion, token-rotation persistence and single-flight, CDC paging and watermark; a fake Intuit server fixture in `apps/api/test`; router coverage already enforced by `module-gate.spec.ts`; conflicts rule in `packages/modules/test`.

### 6.2 Rounds (each ends with a "Done when" check on the live practice deploy, run against the Intuit SANDBOX company)

**R0. Owner prerequisites and re-checks (no code; parallel to R1).** Owner creates the Intuit app and sandbox keys (section 4, steps 1 to 3, 6). Someone with a browser confirms every [memory]/[unconfirmed] item: OAuth URLs, revoke URL, minor version minimum, webhook payload format, CorePlus definition, one-app-many-clients, invoice `requestid`.
Done when: the owner has pasted sandbox `client id` and `secret` into the practice Render API service, and a short "verified facts" note replaces the tags in this file.

**R1. Foundation: conflicts rule, schema, connect, disconnect.**
Build: `conflicts` field and its three enforcements; `quickbooks` meta + registry appends; migration + schema; env in all three places; connection service with encrypted tokens, single-flight refresh, state table; callback route; settings page with connection card; Features entry.
Practice precondition: the practice deploy has Books ON with posted entries, so the developer first switches Books OFF on the Features page (data is kept, nothing deleted). Because QuickBooks conflicts with Books, this is required before QuickBooks can be switched on there.
Callback and redirect: the OAuth callback is a Nest route on the API, reached THROUGH the web app. The redirect URI registered in the Intuit dashboard must be exactly `<APP_URL>/api/quickbooks/callback` (practice: `https://practice-app-af4x.onrender.com/api/quickbooks/callback`). The browser lands on the app host with its session cookie, the app's `/api/*` proxy (`apps/app/app/api/[...path]/route.ts`) forwards the cookie and passes the 3xx through, so this does not depend on AUTH_COOKIE_DOMAIN or custom domains. CORS is not involved: Intuit sends the browser to that URL as a plain redirect. After exchanging the code, the API answers with a redirect to the web settings page with a status in the query (`/<slug>/settings/quickbooks?status=connected` or `?status=error&reason=<code>`), and the page reads that once, shows a toast, and clears the query. No token or realm id is ever put in that URL.
New-client docs: add a step to `docs/setup.md`, section "Deploy a new client": add the client's redirect URI (`<APP_URL>/api/quickbooks/callback`) to the Intuit app's redirect URIs (Development and Production lists) and set the client's `QUICKBOOKS_*` env vars; and add a matching line to "Verify a new client deploy".
Done when (practice deploy): (0) after Books is switched off, switching Books back ON later restores everything as it was (journal, accounts, reports unchanged), checked once at the end of R1 and again after R6. (1) Features shows QuickBooks; switching it on with Books on is refused with the sentence in section 5, and the Books row is disabled while QuickBooks is on. (2) Settings, QuickBooks, **Connect** goes to Intuit, approving a sandbox company returns to the page showing the company name, "Connected", and a last-synced time. (3) A second tab's replay of the same callback URL is refused (state is single-use). (4) Waiting past one hour and pressing **Check connection** still works (token refreshed; the stored refresh token changed in `QuickbooksConnection`, verified by `refreshTokenIssuedAt` moving). (5) **Disconnect** returns the card to "Not connected", and Intuit's sandbox "connected apps" no longer lists the app. (6) No token appears in any API response or log line (grep the practice logs).

**R2. Customers: match and link.**
Build: paged QBO customer pull, matching rules (2.3), review list with **Confirm all**, link chip on company page, **Create in QuickBooks** and **Create company**.
Done when: with a sandbox company holding 10+ customers and a practice CRM holding overlapping companies, **Match customers** lists exact matches pre-ticked, "Maybe" rows needing a pick, and unmatched on both sides; **Confirm all** links them; a QBO customer cannot be linked to two companies; **Create in QuickBooks** on an unmatched company creates one customer that then appears in the sandbox QuickBooks; clicking it twice creates one.

**R3. Invoice from a won deal.**
Build: **Create invoice** button and review sheet on a won deal, invoice link row with pending-first write, **Open in QuickBooks** link, currency refusal, error messages in plain words.
Done when: a won deal of a linked company creates exactly one unsent invoice visible in sandbox QuickBooks with the right customer, amount, currency and due date; a double click or an API retry creates no second invoice; a deal in a different currency is refused with the sentence in section 1; an unlinked company offers to link first; a member without `quickbooks.invoice` sees no button and the API refuses (check both layers).

**R4. Sync: balances, paid status, scheduler.**
Build: `quickbooks-sync` job (lock key 7, 15 minutes), CDC with watermark and overlap, full-resync fallback, 429 handling, balances on the customer link, status on the invoice link, **Sync now** button, company and deal "Owed / Paid / Overdue" display.
Done when: after taking a payment against the invoice in sandbox QuickBooks, within 15 minutes (or after **Sync now**) the deal shows Paid and the company's owed amount drops; an invoice edited in QuickBooks shows its new total; voiding it shows "Invoice voided in QuickBooks"; `SchedulerRun` shows the job succeeding and not running while the module is off; killing the network for one tick and restoring it loses no changes (watermark did not advance).

**R5. Dashboard: Owed and Profit.**
Build: `quickbooks.owed` widget (top overdue companies, total owed) from cached link rows (no API call on page view); `quickbooks.profit` widget from the ProfitAndLoss report, cached in `QuickbooksReportCache`, refreshed by the sync job at most hourly, with an "As of" time and **Open in QuickBooks**.
Done when: the dashboard widgets match the figures on QuickBooks' own Profit and Loss and Unpaid Invoices for the same period in the sandbox company; opening the dashboard ten times causes zero Intuit calls (check via the connection's request counter or logs); both widgets are absent when the module is off.

**R6. Hardening: dead token, reconnect, optional webhooks relay.**
Build: `NEEDS_RECONNECT` state and banner across the app, owner notification, Reconnect with same-realm check, "different company" refusal, forget-links option, then (only if the owner wants speed at scale) a relay that receives the webhook, verifies `intuit-signature`, and forwards by realm id to the deploy, which triggers the same CDC function.
Done when: revoking the app inside the sandbox company turns the practice deploy to "QuickBooks disconnected" within one sync tick with the banner on settings and the dashboard, **Create invoice** disabled with the reason, nothing crashing and no retry storm in logs; **Reconnect** to the same company restores everything with links intact; connecting a different sandbox company is refused until the owner chooses to switch; (if the relay is built) an edit in QuickBooks shows in the CRM in under 2 minutes.

Production go-live (after R3 at the earliest): swap `QUICKBOOKS_ENVIRONMENT` and keys to production on the first real client, re-run R1 checks 2 to 5 and R3 against their real company with a test invoice they void afterwards. Needs the app assessment approved.

### 6.3 Risks

- The assessment may take longer than a week; sandbox work is not blocked by it.
- The 500,000-call cap is shared by every client deploy on the one Intuit app; at scale the interval must grow or the relay and webhooks must replace most polling.
- Rotated refresh tokens are the classic failure: a lost write after a refresh locks the client out until Reconnect. Single-flight refresh under a lock, and write-then-use ordering, are mandatory.
- Webhook payload format is mid-migration at Intuit; the polling-first design avoids depending on it in v1.
- Hotspot files shared with Agent 4: registries, `scheduler.service.ts` constructor, `MODULE_API`, widget id map. Append only; the scheduler lock key is settled: QuickBooks takes 7, Agent 4 keeps 6.
- Nothing here has been compiled or run, by design.

---

## 7. Owner questions (answer one at a time; recommended answer first)

**ANSWERED 2026-11-07: the owner accepted every recommendation below** (relayed by the manager). Decided: one Intuit app (ours) for all clients; a button creates an unsent invoice; sync every 15 minutes plus Sync now; owners and admins connect; no tax lines; the QuickBooks company's own currency only; Books and QuickBooks conflict and cannot both be on. The questions stay below for the record. Question 5 (encryption key) was not relayed separately; R1 reuses `MCP_ENCRYPTION_KEY`, which is the recommended answer. Questions 7 and 8 follow the recommendation as well.

1. **Who owns the Intuit developer account and app?** Recommended: **us, one app for all clients**, each client just clicks Connect and approves. (Alternative: each client creates their own app; far more work for them and for us.)
2. **When a deal is won, should an invoice be created automatically?** Recommended: **No. A button creates it unsent; the owner or bookkeeper sends it from QuickBooks.** (Alternative: automatic, and optionally emailed, as a later setting.)
3. **Real-time or every 15 minutes?** Recommended: **every 15 minutes plus a Sync now button for v1;** add instant webhooks later only if it matters. (Alternative: build the webhook relay up front.)
4. **Who may connect, reconnect and disconnect QuickBooks?** Recommended: **owners and admins only;** everyone else with CRM access can see balances and create invoices. (Alternative: owner only.)
5. **Encryption key for QuickBooks tokens:** Recommended: **reuse the existing key (`MCP_ENCRYPTION_KEY`),** one less secret to set per client. (Alternative: a separate `QUICKBOOKS_ENCRYPTION_KEY`, cleaner key rotation, one more env var per client.)
6. **Sales tax on invoices:** Recommended: **v1 sends no tax; the client's QuickBooks tax settings apply,** and we say so on the sheet. (Alternative: block invoicing until we can set a tax code per client.)
7. **Money in other currencies:** Recommended: **refuse invoices whose currency differs from the QuickBooks company's own currency in v1.** (Alternative: build multi-currency now.)
8. **Switching an existing Books client to QuickBooks later:** Recommended: **they switch Books off first (data kept) and then QuickBooks on; no automatic migration of their ledger.** (Alternative: a one-time import of QuickBooks balances; not planned.)

---

## 8. Sources

Read this session (page text):
- https://static.developer.intuit.com/output_html/qbo/docs/learn/limits-and-throttles.html (rate limits, Builder cap, 429 behavior, query and batch limits)
- https://static.developer.intuit.com/output_html/qbo/docs/develop/webhooks/configure-webhooks.html (webhook setup, signature, entities, payload shape)

Seen only through search results (primary page unreadable by my fetcher; re-check):
- https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0
- https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/faq
- https://help.developer.intuit.com/s/article/Handling-OAuth-token-expiration (1 hour access token, rolling 100 day refresh token, rotation about every 24 hours, 5 year cap)
- https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture (30 day look-back, 1000 objects)
- https://help.developer.intuit.com/s/article/API-call-limits-and-throttling
- https://developer.intuit.com/app/developer/qbo/docs/get-started/partner-faq (Builder tier; unreadable)
- https://blogs.intuit.com/2025/11/12/upcoming-change-to-webhooks-payload-structure/ (title only; redirects to Medium, blocked)
- https://blogs.intuit.com/2025/01/21/changes-to-our-accounting-api-that-may-impact-your-application/ (Core vs CorePlus; redirects to Medium, blocked)
- Minor version 75 default from 2025-08-01: https://docs.codat.io/updates/250219-qbo-minor-versions-update , https://community-forums.domo.com/main/discussion/69370/quickbooks-online-and-quickbooks-multiaccount-connector-api-upgrade , https://github.com/ej2/python-quickbooks/pull/381
- App assessment applies to private apps; about 30 minutes: https://docs.codat.io/integrations/accounting/quickbooks-online/qbo-app-assessment-questionnaire , https://help.railz.ai/en/articles/6395617-steps-to-complete-the-quickbooks-online-app-assessment-questionnaire , https://developers.apideck.com/connectors/quickbooks/docs/application_owner+app_compliance
- Partner program tiers and fees (third party, unreliable on dollar figures): https://www.apideck.com/blog/quickbooks-api-pricing-and-the-intuit-app-partner-program , https://truto.one/blog/how-much-does-the-quickbooks-api-cost-2026-pricing-rate-limits/

Could not confirm at all (needs a person with a browser, in R0): the OAuth endpoint URLs and revoke URL; whether `requestid` makes invoice creation idempotent; Invoice `EmailStatus` behaviour; the current minimum minor version in Nov 2026; the exact current webhook payload and the legacy cut-off date; which calls are CorePlus; whether single-company private apps are metered; whether one Intuit app can serve many client deploys; production approval time; Intuit data-storage terms.
