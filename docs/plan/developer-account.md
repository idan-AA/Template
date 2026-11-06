# Developer account and Features page: findings and build plan

Audience: you and the next agent. Written by Agent 2 on 2026-11-06 (research only, HEAD ccbdcc6), reviewed by the manager: key claims re-checked against code (activeClient() memoised per process at packages/modules/src/runtime.ts; MODULE_API crm and bookkeeping both empty so the CRM API is always mounted; no developer notion anywhere).

Manager decisions on review:
- P1 to P5 and Q-A to Q-G accepted as written.
- Agent tools when CRM is off: tools answer "switched off" in v1; hiding tool names is later.
- CLASH RULE: Agent 3 owns packages/modules/bookkeeping/meta.ts. Agent 2 adds `description` and `routers` to define-module.ts as OPTIONAL fields and fills them in crm/meta.ts only; Agent 3 fills them for bookkeeping in its Round A. The router-coverage test must tolerate a module with no routers yet.
- Migration: Agent 2 owns the only migration in this round; Agent 3 Round A has none. Any later bookkeeping migration waits until this one is merged.
- Better-auth org endpoint names and hooks are UNVERIFIED until bun install; verify first, before building step 3.

### 1. Findings (with evidence)

**Q1. Where the enabled module set is decided, and when it is read**

The whole set comes from ONE place: `activeClient()` (`packages/modules/src/runtime.ts:19-25`),
memoised per process on first call from `process.env` (`CLIENT_ID`, `ENABLED_MODULES`) via
`resolveClient` (`packages/modules/src/client-config.ts:27-60`; base set from
`clients/<id>/client.config.ts` through `clients/registry.ts`). Everything below reads it:

| Reader | Where | When it is fixed | Runtime fix |
|---|---|---|---|
| `isModuleEnabled`, `requireModule`, `moduleNav`, `settingsNav`, `moduleWidgets`, `enabledFieldEntities`, `workspaceRoleIds`, `roleOptions`, `can` | `runtime.ts:32-133` | once per PROCESS (memo at :19-25) | Make `enabledModules()` read a refreshable snapshot (2.2). All stay synchronous, so no caller changes. |
| Web build check | `apps/app/next.config.ts:8` (`activeClient()`) | build time, only validates | Keep. It validates the STARTING set only. |
| Web nav rail | `apps/app/app/(app)/[slug]/layout.tsx:43-47` (`ModuleRail`, already `await connection()`); fallback at :28 | request time already, but the memo makes it fixed | Add `await ensureModuleState()` next to `connection()`. The Suspense fallbacks at :28 and `settings/layout.tsx:17` render the static set for one frame; make them module-free skeletons so a switched-off item never flashes. |
| Web CRM overlays, header enrichment | `[slug]/layout.tsx:50-66`, `:96` (`isCrmEnabled`) | same | same |
| Web settings sidebar | `settings/layout.tsx:28-32` (already `connection()`) | same | same; add the Features item (developer only) |
| Web route gates | `requireModule("crm")` in `companies|contacts|deals/layout.tsx`, `settings/tracking/layout.tsx`, `(landing)/onboarding/research/page.tsx:14`; wrapper `apps/app/lib/modules.ts:14-16` is SYNC | per process | Make the wrapper `async` (`await ensureModuleState()` then `notFound()`) and the 5 call sites `async` + `await`. `apps/app/test/modules-nav.spec.ts:127-142` only checks the layout file CONTAINS `requireModule("crm")`, so it keeps passing. `cacheComponents: true` (`next.config.ts:52`) means any layout reading module state MUST read request-time data (`connection()`), or it is prerendered and goes stale. |
| API mounting | `apps/api/src/app.module.ts:94-96` imports `enabledApiModules()` (`modules/registry.ts:31-33`) | BOOT; Nest cannot unmount a module at runtime | Today `MODULE_API` is `{ crm: [], bookkeeping: [] }` (`registry.ts:17-20`): **the CRM API is always mounted, and bookkeeping has no API yet**. So D3 "not mounted" is not true today for CRM. Runtime switching cannot use mounting; use a guard (2.4). |
| API search | `apps/api/src/search/search.service.ts:28` | per process | Reads the snapshot; no change besides the snapshot. |
| API role validation | `packages/auth/src/organization.ts:24-30` -> `workspaceRoleIds()` | per process | Snapshot. A member who already holds `bookkeeper` keeps it when bookkeeping is off: `can` returns false for unknown keys (`runtime.ts:121-133`), so the role is dormant, not lost. |
| Seed | `packages/modules/scripts/seed.ts:11` | one-off script | Keep using the STARTING set (config). Module seeds are idempotent (`define-server.ts:13`). Switching ON later runs the module seed once (see Q5). |
| Agent (eve) | `apps/agent` has NO import of `@app/modules` (grep: zero hits). Tools are static files in `apps/agent/agent/tools/` (all CRM tools: `list_deals.ts`, `search_crm.ts`, ...). | static | The tool LIST cannot change at runtime. Gate inside `execute` the way the repo already gates by capability (`apps/agent/agent/lib/capabilities.ts:34-36,78-82`, used at `tools/research_person.ts:22`): read the same snapshot from the DB and return "the CRM is switched off for this workspace". Accepted limit: the model still sees the tool names. |
| Brand, locale, features | `activeClient().config` (`apps/app/lib/brand.ts:8`, `brand-files.ts:35`; `bookkeeping/server.ts:12`) | BUILD time: the web bakes `CLIENT_ID` at `next build` (`render.yaml.template:94-99`) | NOT changed by this work. Only the module set becomes runtime. |

Summary: nothing about modules is truly baked at build except `CLIENT_ID` (brand/locale) and the
Nest import list. The module set is "per process, first call", which is why a redeploy was
needed. A DB-backed snapshot removes the redeploy for every reader above except the agent tool
LIST.

**Q2. Roles and `can(role, key)`**

- Roles are plain strings on `member.role` (`packages/db/prisma/schema/base.prisma:1064-1077`).
  Core roles `owner|admin|member` (`packages/modules/src/roles.ts:6`); modules add roles
  (`bookkeeping/meta.ts:16-19`: bookkeeper, accountant). The better-auth organization plugin is
  on (`packages/auth/src/auth.ts:279-298`: `allowUserToCreateOrganization:false`,
  `disableOrganizationDeletion:true`, `creatorRole:"owner"`); there is one fixed workspace
  (`WORKSPACE_ID`, `packages/auth/src/organization.ts:2,142-152`).
- `can(role,key)` (`runtime.ts:126-133`) is true only if an ENABLED module declares the key for
  that role. Module permission keys live in each module's pure-data `meta.ts`
  (`crm/meta.ts:31-35`, `bookkeeping/meta.ts:20-41`; schema at `define-module.ts:78-80`).
- BUT the CRM and all core features do NOT use `can`. They use role helpers:
  `isWorkspaceAdmin = owner || admin` and `canChangeRole/canManageCurrency/canManageConnections/
  canManageTracking` (`organization.ts:32-54`), plus raw `role === "owner"` checks
  (`workspace.service.ts:215,289,396`; `agent-definitions.service.ts:813`). `can` is used only in
  a test today (`apps/api/test/workspace-roles.integration.spec.ts:111,126`). Every authorisation
  re-reads the role from the DB per call (`workspaceRoleOf`, `organization.ts:142-152`).
- Enforcement today: `AuthMiddleware` per router (`workspace.router.ts:27-29`;
  `trpc/middlewares/auth.middleware.ts:26-54`) only checks "signed in" and
  `passwordChangeRequired` (a DB read per call at :39). Role checks live in the SERVICES. There
  is no central permission middleware.

**Q3. Any existing developer / super-admin notion?** None. Confirmed: no `developer`, `superadmin`
or `isDeveloper` in `packages/auth`, `apps/api/src`, `apps/app`. The closest things are the owner
bootstrap (`apps/api/src/account/account.service.ts`: first person on an empty DB, advisory lock,
audited `OWNER_ACCOUNT_CREATED`) and the last-owner guard (`workspace.service.ts:215-227`).

**Q4. Where runtime module state would live, and how readers get it fast**

- Pattern to follow: `AppSetting` is a single-row runtime settings table (`base.prisma:973-995`,
  `packages/db/src/settings.ts`, id `"app"`). Audit is `writeAudit(tx, ...)` in the caller's
  transaction into the append-only `AuditEvent` (`packages/db/src/audit.ts:29-50`;
  `base.prisma:1157-1177`), used in exactly this shape at `workspace.service.ts:240-252`.
- Cache facts: `AppCacheModule` falls back to a per-instance in-memory cache when `REDIS_URL` is
  unset (`apps/api/src/cache/cache.module.ts:22-29`), and a client deploy is one API instance.
  Three processes read module state (API, web, agent) and do not share memory. So each process
  keeps its own snapshot with a short TTL.

**Q5. A module switched OFF then ON**

- Data survives by design: "all Prisma tables exist in every client DB; modules gate code, not
  schema" (`docs/plan/template-modules.md` D2). A switch is a row in a settings table, never a
  migration or a delete. Switching OFF must NOT run anything destructive.
- What must hide when OFF (each is a guard point in 2.4): nav and settings items
  (`runtime.ts:59-82`), overview widgets, search (`search.service.ts:28`), web routes
  (`requireModule`), API procedures (new guard; CRM is currently always mounted), agent tools (in
  `execute`), role options (`roleOptions`), custom-field entities (`enabledFieldEntities`,
  `runtime.ts:91-93`).
- Background work is a gap to decide: `SyncModule`, `SchedulerModule` and the mailbox sync are
  always mounted (`app.module.ts:77,81-82`) and keep working on CRM data while CRM is OFF.
  Recommendation: leave them running (no data loss, nothing visible); revisit when the CRM is
  moved behind its module (Phase 4).
- Switching ON: if the module has a `server.seed` (bookkeeping does: `bookkeeping/server.ts:10`,
  idempotent), run it once on first enable, in the same transaction as the switch, so "ON" never
  exposes a half-seeded module.
- Deep link to an OFF module: the web route returns the 404 page (existing `notFound()`) with a
  one-line explanation (2.5). The API returns tRPC `NOT_FOUND` ("This feature is not switched on").

**Gaps found that the plan must close (not in the brief)**

1. **Better-auth organization endpoints can bypass any in-app "cannot be removed or demoted"
   rule.** The only auth guard in the repo covers password paths (`auth.ts:80-107`); the org
   plugin's own HTTP endpoints (remove member, update member role, leave) are mounted by
   `BetterAuthModule` (`app.module.ts:59`) and are NOT blocked. UNVERIFIED which exact paths and
   which `organizationHooks` exist in 1.7.18 (package not installed). Plan: extend the
   `passwordEndpointGuard` pattern with a member-mutation guard, and add org hooks if present.
2. **The developer identity is an email in an env var, which a client could imitate.** Password
   users are created by an owner/admin (`workspace.service.ts:271-354`), and an SSO provider the
   client owner configures could assert any email (`apps/api/src/sso`). Plan: pin the developer
   to a user ID the first time the env email signs in (2.3).
3. Always-mounted CRM API and CRM background jobs (above).

### 2. Build plan

#### 2.1 Decisions (override me in review)

| # | Decision | Why |
|---|---|---|
| P1 | The module set becomes: starting set from `client.config.ts`, overridden by rows in a new table. No row means "use the config". `ENABLED_MODULES` stays as a hard test override that beats the DB (dev servers keep working unchanged). | Config stays the starting set (owner's wording); no seed step; a fresh deploy behaves exactly as today. |
| P2 | The developer sees every module regardless of the client's switches, and has a "Preview as client" toggle on the Features page (a cookie, UI only; the API does not restrict the developer). | Owner: "for testing, I should be able to see everything" AND "choose what the person gets access to". Needs a way to see what the client sees. |
| P3 | Developer power is a new `isDeveloper(user)` check, NOT a new member role. The developer keeps the stored role `owner`. | A new role string would fail every `role === "owner"` / `isWorkspaceAdmin` check across ~15 call sites (Q2). Owner role plus a developer flag changes nothing there. |
| P4 | Switching is blocked when it would break `requires` (cannot turn OFF a module another ON module requires; cannot turn ON a module whose requirement is OFF). Reuse `assertModuleSet` (`define-client.ts:117-145`). | One rule, one place. |
| P5 | Module permission keys (`can`) are left alone. `can` already returns false when a module is OFF. | Out of scope; it is how bookkeeping will be gated. |

#### 2.2 Data model (Tier 2 proposal, NO SQL run)

New Prisma model in `packages/db/prisma/schema/base.prisma` (core, not per module):

```prisma
// One row per module the developer has explicitly switched. No row = the
// client's starting set (clients/<id>/client.config.ts) decides.
model ModuleSwitch {
  moduleId    String   @id   // a key of ALL_MODULES
  enabled     Boolean
  changedById String?        // plain user id, no FK (survives user deletion, like AuditEvent)
  changedAt   DateTime @default(now()) @updatedAt

  @@map("moduleSwitch")
}
```

Plus one nullable column on the existing `AppSetting` (`base.prisma:973`):
`developerUserId String?` (the pin from 2.3). One migration for both, e.g.
`add_module_switch_and_developer_pin`. Additive, no backfill, no data change, safe to roll out
before any code reads it. Tier 2 gate: manager approves before any `db:migrate`.

Snapshot (new file `packages/modules/src/state.ts`, server only):
- `getModuleState()` sync: the effective `ModuleId[]` for this process.
- `refreshModuleState(loader)` async: loader reads `moduleSwitch` rows, merges onto the config
  set, runs `assertModuleSet`, replaces the snapshot, stamps `loadedAt`.
- `ensureModuleState()` async: refresh only if `loadedAt` is older than the TTL (default 5 s,
  optional env `MODULE_STATE_TTL_MS`). `enabledModules()` in `runtime.ts:32-34` returns the
  snapshot's modules. A failed refresh keeps the last good snapshot and logs; it never throws
  (CLAUDE.md: a missing thing removes a capability, it does not crash).
- The write path calls `refreshModuleState` immediately in the API instance that handled it, so
  the developer sees the change on the next click; other processes catch up within the TTL.

Each process wires its own loader: API (`db` from DatabaseModule), web (through a tRPC
`modules.state` query using the existing server client, `apps/app/lib/trpc/server.ts`, so the web
keeps its "talk to the API" shape), agent (direct `db`, as in `capabilities.ts:3,22`).

#### 2.3 Developer identity and protection

- Env var: `DEVELOPER_EMAIL` (one address, case-insensitive). Optional: unset means there is no
  developer and the product behaves exactly as today. Add to `.env.example` (note: "the one
  account that can switch modules; nobody in the app can remove or demote it"),
  `apps/api/src/config/env.validation.ts` (`@IsOptional @IsEmail`), `turbo.json` passthrough
  (both lists, next to `CLIENT_ID` at :38 and :52), and the Render `envVars` in
  `render.yaml.template` and `clients/*/render.yaml` (`sync: false`, owner fills it in).
- `isDeveloper(user)` = env email equals `user.email` (lowercased) AND the pin allows it: if
  `AppSetting.developerUserId` is null, the first matching sign-in writes it (audited
  `DEVELOPER_PINNED`); afterwards `user.id` must equal the pin. Changing the env email revokes
  developer status. This closes gap 2: a lookalike created after the developer's first sign-in
  can never claim it. Residual risk: whoever signs in with that email FIRST. Mitigation in the
  runbook: the developer is the first person on a new deploy (they create the deploy), which is
  how the owner bootstrap already works.
- `addMember` refuses `DEVELOPER_EMAIL` with "That address is reserved" (`workspace.service.ts`).
- Protection from delete/demote, enforced in the SERVICE (UI only hides):
  1. `setMemberRole` (`workspace.service.ts:186-265`): target is the developer -> Forbidden.
  2. `resetMemberPassword` (:360-433): target is the developer and actor is not the developer ->
     Forbidden. This is the most important rule: without it "cannot be demoted" is meaningless,
     because a client admin could reset the password and sign in as the developer.
  3. The last-owner guard (:215-227) stays; the developer counts as an owner.
  4. Better-auth org endpoints: add a `memberMutationGuard` plugin beside
     `passwordEndpointGuard` (`auth.ts:80-107`) that rejects remove-member, update-member-role
     and leave-organization for the developer's member row, and add `organizationHooks`
     (`beforeRemoveMember`, `beforeUpdateMemberRole`) if 1.7.18 has them. UNVERIFIED: confirm the
     exact path and hook names after `bun install`, and test through the real HTTP route.
  5. No account-deletion route exists today (grep: no `deleteUser`/`removeMember` in app code);
     add a test that fails if one appears without a developer check.
- The Members table shows the developer row with a "Developer" badge and no role or remove
  controls. A client owner sees a locked row (hiding it would be dishonest and needs special
  casing; the row is already in the member list).

#### 2.4 Guard points (service enforces, UI only hides)

1. **API central gate** in `AuthMiddleware.use` (`auth.middleware.ts:26-54`, already runs on every
   authed procedure): resolve `opts.path` (e.g. `companies.list`) to a module via a new
   pure-data `routers: string[]` on each module's `meta.ts` (crm: companies, contacts, deals,
   fields, activities, enrichment, ...; bookkeeping: `bookkeeping`). If that module is OFF and the
   caller is not the developer, throw `TRPCError NOT_FOUND`. One edit covers ~30 routers and the
   REST mirror (`restMeta` routes; verify in the opposite-case test that they go through the same
   middleware). Unlisted routers are core and always allowed. A unit test enumerates every
   `@Router` alias and fails if it is neither core nor claimed by exactly one module.
2. **Service assert** `ModuleGate.assert(id, user)` in module-owned services' public methods, as
   defence in depth (CLAUDE.md: enforced in middleware AND service). Bookkeeping gets it from day
   one in its new posting services. For CRM it is a follow-up inside the Phase 4 move (CRM services
   are many and entangled, `registry.ts:11-15`); flagged as an accepted gap.
3. **Web**: `requireModule` async (Q1 table) at every module layout; nav, settings sidebar,
   overview widgets and header enrichment all read the refreshed snapshot.
4. **Search** (`search.service.ts:28`): snapshot only.
5. **Agent**: gate in `execute` of every CRM tool via a shared `requireModuleOn("crm")` helper
   (like `enabled(...)` in `capabilities.ts:78-82`); a test lists the tools and fails if a CRM
   tool lacks it.
6. **Features API itself**: `modules.state` (any signed-in user gets the ON set, for the UI) and
   `modules.set` (developer only, checked in the SERVICE by `isDeveloper`, never by role).

#### 2.5 The Features page

- Where: Settings sidebar item "Features", URL `/{slug}/settings/features` (`url-structure`:
  lowercase noun, no id). Added to `CORE_SETTINGS_ITEMS` (`settings/settings-items.ts:40-48`) but
  FILTERED OUT of the sidebar unless the viewer is the developer (the layout already awaits
  `connection()`; pass `isDeveloper` into `enabledSettingsNav`). The page itself calls
  `notFound()` for anyone else, and `modules.set` refuses anyone else.
- Who sees it: only the developer. A client owner or admin does NOT see the item, gets a 404 on
  the URL, and FORBIDDEN from the API. They see nothing about switching. If a module is off, its
  nav item is absent and its URL shows the 404 page with the line "This part of the product is
  not switched on for your workspace."
- Layout: `PageShell` (same as Members, `members/page.tsx:20-46`), title "Features",
  description "Choose what this workspace can use. Data is never deleted when you switch
  something off." One row per module in `ALL_MODULES` order:
  - Name (`label`), one-line description (new pure-data `description` on `defineModule`;
    append-only hotspot), a switch, and a status chip: "On (starting set)", "On (switched on)",
    "Off (starting set)", "Off (switched off)".
  - "Needs: CRM" chips from `requires`. A switch that would break a requirement is disabled with
    a tooltip saying why ("Books needs CRM. Switch Books off first.").
  - A data hint when OFF and rows exist ("128 companies kept"), from cheap counts per module
    (new optional `describeData` on `ModuleServer`, server only, never blocks the page).
  - "Last changed by X, 5 minutes ago" from the latest `AuditEvent` for that module.
  - Switching OFF opens a confirm dialog: "People in this workspace lose access to {Module}
    immediately. Nothing is deleted. You can switch it back on at any time." Switching ON needs no
    dialog; it toasts "Books is on" and, for a module with a seed, shows "Setting up..." while the
    seed runs.
  - Top of page: "Preview as client" toggle (P2), with a persistent banner in the app header
    while active so the developer never forgets they are previewing.
- States: loading skeleton rows; empty (no modules registered, cannot happen) shows "No features
  to switch"; error: inline banner with Retry, previous switch positions kept; a switch in flight
  is disabled with a spinner; a failed write rolls the switch back and toasts the API message; a
  conflict (someone else changed it) refetches and says so.
- Build with `ui-conventions` and `docs/design.md`; no em or en dashes in copy.

#### 2.6 Audit events (module `core`)

`MODULE_SWITCHED` (entityType `module`, entityId = module id, before/after `{enabled}`, summary
"Books switched on by X") and `DEVELOPER_PINNED` (entityType `user`). Both via `writeAudit` in the
same transaction as the write, so the switch and its audit commit together or not at all. Blocked
attempts are logged, not audited (noise).

#### 2.7 Tests (include the opposite case)

- `packages/modules/test/state.spec.ts`: config set with no rows; a row overrides; `requires`
  enforced both directions; a failed refresh keeps the last good snapshot; TTL respected;
  `ENABLED_MODULES` beats rows.
- `apps/api/test/module-switch.integration.spec.ts` (real DB, like
  `owner-account.integration.spec.ts`): developer can switch; **a non-developer OWNER cannot call
  `modules.set` (FORBIDDEN) and cannot reach the Features data**; an admin cannot; switching OFF
  makes the module's procedures return NOT_FOUND for a member but still work for the developer; ON
  again restores them with data intact (create a record, switch off, switch on, record still
  there); the audit row is written; a failed audit rolls the switch back.
- Developer protection: an owner cannot demote, reset the password of, or remove the developer
  (at service level AND through the real better-auth org HTTP routes); `addMember` with the
  developer email is refused; a second user with the developer email never gets developer status
  after the pin; changing the env email revokes it.
- Router-coverage test (2.4 #1) and agent-tool-coverage test (2.4 #5).
- Web: extend `apps/app/test/modules-nav.spec.ts` so the Features item is hidden for
  non-developers. Live browser pass (manager): switch CRM off, the nav item is gone within one
  refresh, a deep link shows the 404 with the explanation, switch on, data still there.

#### 2.8 Files I would touch (my clash boundary) and hotspots

New files: `packages/modules/src/state.ts`, `packages/modules/src/developer.ts`,
`apps/api/src/modules/modules.{module,router,service,contracts}.ts` (Features API),
`apps/api/src/modules/module-gate.ts`,
`apps/app/app/(app)/[slug]/settings/features/{page,features-list,confirm-off-dialog}.tsx`, the
tests above, a `docs/updates/` entry.

Edited files: `packages/modules/src/runtime.ts` (HOTSPOT: `enabledModules` source changes),
`packages/modules/src/define-module.ts` (+`description`, +`routers`; HOTSPOT, append-only),
`packages/modules/crm/meta.ts` and `bookkeeping/meta.ts` (add `description` and `routers`; Agent 3
works on bookkeeping, so COORDINATE: I only add those two fields),
`apps/api/src/trpc/middlewares/auth.middleware.ts`, `apps/api/src/app.module.ts` (register
ModulesModule), `apps/api/src/workspace/workspace.service.ts` (developer rules),
`packages/auth/src/auth.ts` (member-mutation guard), `packages/auth/src/organization.ts`,
`apps/app/lib/modules.ts` and the 5 `requireModule` call sites,
`apps/app/app/(app)/[slug]/layout.tsx`, `.../settings/layout.tsx`,
`.../settings/settings-items.ts` (HOTSPOT: nav, append-only), `.../settings/members/*` (badge),
`apps/agent/agent/lib/*` and the CRM tools (`requireModuleOn`).

Shared hotspots I need, each flagged for the manager:
1. **`packages/db/prisma/schema/base.prisma` + a new migration** (one agent at a time; Tier 2;
   Agent 3's bookkeeping screens may also want schema changes, so serialise).
2. **`.env.example` + `apps/api/src/config/env.validation.ts` + `turbo.json`** (`DEVELOPER_EMAIL`,
   optional `MODULE_STATE_TTL_MS`), mirrored, append-only.
3. **`render.yaml.template`, `clients/*/render.yaml`** (add `DEVELOPER_EMAIL`, `sync: false`): one owner.
4. **`packages/modules` registry / `define-module.ts` / nav / `settings-items.ts`**: append-only.
5. **`docs/DECISIONS.md`** (manager only): D1 and D3 in `docs/plan/template-modules.md` need the
   amendment "module switches are runtime state; the CRM API is still always mounted".

Suggested build order, each step green on its own: (1) migration + `state.ts` + tests; (2) the
snapshot in `runtime.ts` and the web/agent loaders (no behaviour change while no rows exist); (3)
Features API + developer identity + protection; (4) API gate + router-coverage test; (5) Features
page; (6) agent gating; (7) live browser pass.

### 3. Open product questions (each already self-answered)

| # | Question | My answer | Reason |
|---|---|---|---|
| Q-A | Does the developer see switched-off modules? | Yes always, plus a "Preview as client" toggle | Owner asked to see everything; the toggle is the only way to check what a client gets. |
| Q-B | How many developers? | One, via `DEVELOPER_EMAIL` | The owner described one account named by an env var. A comma list is a later, backwards compatible change. |
| Q-C | Should the client owner know a developer account exists? | Yes, a locked "Developer" row in Members | The row already exists in the member list; hiding it needs special-casing and is dishonest. |
| Q-D | Do background jobs (mailbox sync, scheduler) pause when CRM is OFF? | No, leave them running | No data loss, nothing visible; pausing needs the CRM moved behind its module first (Phase 4). |
| Q-E | Does switching ON run the module seed? | Yes, once, in the same transaction | Bookkeeping's seed is idempotent and must exist before any posting. |
| Q-F | Does switching OFF hide existing data from reports and exports? | Yes, every read path is gated the same way | A module that is off must not leak through a side door. |
| Q-G | Can the developer be created by the owner bootstrap? | Yes, the developer is the first person on a new deploy | Matches the existing bootstrap (`account.service.ts`) and is what makes the pin safe. |

Truly open (needs the owner), none of which blocks building: should the agent hide CRM tool NAMES
from the model when CRM is off (needs an eve restart, not runtime), or is "tools answer 'switched
off'" acceptable? I recommend acceptable for v1.

STATUS: DONE. Awaiting manager review. I have stopped.
