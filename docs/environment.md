# Environment

Setup, DB commands, Google Cloud, Render deploys and the "never point a laptop at a client database" hazard: `docs/setup.md`.

## One `.env`, at the repo root

`.env.example` **is the documentation** — every variable the repo reads, with a note,
and nothing that is not read. `packages/env` walks up to the workspace root and reads
`.env`, then `.env.local` on top.

- **Real environment variables always win** — the loader never overwrites
  `process.env`, so Render, Docker and CI take precedence.
- **Never add a per-package `.env`.** Four once existed with duplicate
  `DATABASE_URL`/`BETTER_AUTH_SECRET`; when they drifted the API minted a cookie the
  app could not verify and the browser bounced between `/sign-in` and `/` forever.
- **The root marker is a `package.json` declaring `workspaces`** — stopping at the
  first `turbo.json` resolves the API's root to `apps/api`.

## A new variable has three homes, not two

`.env.example` and — if the API reads it — `env.validation.ts` are the two people
remember. The third is **`globalPassThroughEnv` in the root `turbo.json`**, and it is
the one that bites: Turborepo hides an undeclared variable from every task it runs, so
a deployment that sets the variable perfectly still hands the code `undefined`, and
nothing anywhere says so. That is how `MICROSOFT_CLIENT_ID` shipped with the sign-in
button quietly missing. **`passThroughEnv`, never `env`** — a secret in `env` is a
cache key, which means a cache miss on every rotation and the secret in the cache
metadata. The root file's comment has the whole account.

## Required

`DATABASE_URL`, `BETTER_AUTH_SECRET`. Everything else has a localhost default or is
genuinely optional. `ALLOWED_SIGN_IN` becomes required only when Google or Microsoft
is configured (see below).

**`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`** are the sign-in button *and* the
Gmail/Calendar sync — optional, so an SSO-only install needn't create a Google project,
but **set together or not at all** (`packages/auth/src/env.ts` throws on one).

**`MICROSOFT_CLIENT_ID` + `MICROSOFT_CLIENT_SECRET`** are the same bargain for Entra
ID: the other sign-in button *and* the Outlook mail sync, one app registration, the
same pair rule. **`MICROSOFT_TENANT_ID`** defaults to `common` and is the only one of
the three that is genuinely optional on its own — set it to your tenant's GUID to
refuse other tenants at Microsoft instead of at `ALLOWED_SIGN_IN`. There is **no
Microsoft equivalent of `hd`**: `tenantId` is the whole of it.

**Neither pair is required.** Email and password sign-in is always on: the first
person to open a new deploy creates the owner account on the sign-in page, and the
owner or an admin adds everyone else (name, email, role, a temporary password they
pass on) under Settings, Members. Whoever is given a temporary password must choose
their own at first sign-in. There is no self-signup after the first owner, and no
email is sent by this template yet, so a forgotten password is reset by an owner or
admin from Settings, Members.

**`ALLOWED_SIGN_IN`** — comma-separated whole domains or single addresses (bare
addresses exist for a solo self-hoster, where `gmail.com` would be an open door). It
gates **only people who arrive by themselves** through Google, Microsoft or SSO. A
member an owner or admin adds, and the first owner on an empty database, are allowed
by that act and never need an entry. **Optional** when no Google, Microsoft or SSO is
set up. **Required, and an empty list fails closed,** when `GOOGLE_*` or `MICROSOFT_*`
is set (the API refuses to boot without it). One list, read by the sign-in guard *and*
the sync's "which side is external" decision. Parsed on demand.
`packages/auth/src/workspace.ts`.

**Rate limits behind Render.** better-auth reads the client address from
`cf-connecting-ip` (Cloudflare overwrites it, so it cannot be forged), then
`x-forwarded-for`; the API's own limiters use the same header. Without this every
person would share Render's proxy address and one bucket.

## Where things are

- **`API_URL`** (`:3001`) mints session cookies and serves `/api/auth/*`;
  `next.config.ts` republishes it as `NEXT_PUBLIC_API_URL`, so one variable does both
  sides. `BETTER_AUTH_URL` is a legacy fallback.
- **Editing a file under `packages/` does not restart the API. Restart it by hand.**
  `bun --watch src/main.ts` refuses to watch outside its project directory and
  says so once at boot: `File ... is not in the project directory and will not be
  watched`. So a change to `packages/auth` or `packages/db` leaves the API
  serving the old module until someone kills it. This cost an hour once: the
  Slack OAuth scope list was correct in source and stale in the process, and
  every reconnect kept asking Slack for the old scopes.
  Running the API from the repo root fixes the watch and breaks Nest, which
  resolves its tsconfig paths from the current directory and then cannot build
  its dependency graph. There is no fix in the dev script today.
- **`APP_URL`** (`:3000`) is also the trusted-origin and `callbackURL` allow-list.
- **Every OAuth `redirect_uri` is built from `API_URL`, never `APP_URL`.** Better
  Auth serves `/api/auth/*` at `baseURL`, and `baseURL` is `apiUrl`. A redirect
  built from `APP_URL` points at the web app, where `/api/auth/callback` does not
  exist, and the provider rejects it with "redirect_uri did not match". This is
  invisible until someone sets `APP_URL` to a tunnel or a LAN host, at which
  point the redirect silently becomes that host. `ssoCallbackBase()` is the
  pattern; `slackRedirectUri` in `auth.ts` once was not.
- **`AUTH_COOKIE_DOMAIN`** only for API and app on different subdomains of one parent.
- **`AGENT_URL`** is the agent's deployment, server-side only, and **must include the
  scheme** — validated at boot, or it throws when a task is queued instead.
- **`AUTH_COOKIE_PREFIX` is `crm`** (`@app/auth/cookies`), set on **both**
  `advanced.cookiePrefix` in `auth.ts` and `getSessionCookie(request, { cookiePrefix })`
  in `proxy.ts` — one alone redirects every signed-in request. Better Auth's default
  collides with any neighbour on a shared parent domain, silently: sign-in completes,
  the row is written, every reader resolves `null`. **Changing it signs everybody out.**

## `IS_MARKETING` — landing page flag, off by default

`"true"` serves `app/(landing)` at `/`; anything else sends a signed-out visitor to
`/sign-in`, because the page markets *this* product.

- **Only the literal `true`** (same shape as `PRISMA_LOG_QUERIES`).
- **It decides one thing**: what a stranger at `/` sees.
- **`isMarketing()` (`apps/app/lib/env.ts`) reads per request**, so a config change
  needs no rebuild. Declared in `apps/app/turbo.json` `passThroughEnv`.

## Typed, validated env

`apps/api/src/config/env.validation.ts` runs via `ConfigModule.forRoot({ validate })`,
and lists every variable the API reads and nothing else.

- **Validation runs while `AppModule` is evaluated** — a test must set variables before
  importing it (see the dynamic `import()` in `test/auth.e2e.spec.ts`).
- **The schema is the API's, not the repo's** — `@app/auth` and the agent read their own.

## Builder chat encryption

`CHAT_EVENT_ENCRYPTION_KEY` encrypts new builder chat events before database storage.
Generate 32 bytes with `openssl rand -base64 32`.
The API and agent must use the same value.
Without it, builder chat stores the sanitized public event as plaintext.
Removing it hides encrypted replay data without stopping the agent or API.

## Optional: what the agent can do

Every outside source is optional and the agent runs with none. A missing key removes a
place to look; **never an error, never throws**. `agent/lib/capabilities.ts` is the
single place that knows what is set.

| Variable | What it adds |
| --- | --- |
| `PERPLEXITY_API_KEY` | Open-web research with citations; finds a LinkedIn slug |
| `GITHUB_TOKEN` | Raises the GitHub rate limit from 60/hour |
| `BLOB_READ_WRITE_TOKEN` | Mirrors logos and photos into Blob |
| `AI_GATEWAY_API_KEY` | The model. Reached through the Vercel AI Gateway. Needed on every deploy |
| `AGENT_BRIDGE_SECRET` | The rep-facing Agent panel — see `agent.md` |

`BLOB_READ_WRITE_TOKEN` is also in `env.validation.ts` and `apps/api/turbo.json`
because the API and the seed write pictures too. The Next.js app is deliberately
excluded — recognising our URL for the image optimizer needs no token.

### The Context key is asked for, not configured

**`CONTEXT_DEV_API_KEY` is not a variable here and must not become one.** The key lives
in `AppSetting`, is asked for at `/onboarding/research`, and changes on Settings →
General — an admin who cannot redeploy cannot set a variable.

- **It buys two places to look, not one.** Company brand data by domain, and a person
  read back from a LinkedIn URL already on their record. Both capabilities in
  `agent/lib/capabilities.ts` turn on and off with this one key.
- **An install that had the variable is asked again**: no migration, no fallback, and
  **the gate cannot be dismissed**.
- **Nothing is lost while waiting.** A keyless `brand` task settles `SKIPPED` *before*
  anything marks the row `RUNNING`, and `settle` only overwrites `RUNNING` — so the
  company stays `PENDING`, which the sweep re-queues
  (`test/keyless-brand.integration.spec.ts`).
- **Saving the key runs the company sweep immediately** (fire-and-forget).
- **`readContextDevKey` (`@app/db/settings`) is the only reader**, read live with no
  cache. An unreadable database is a capability that is off, not an exception.
- **The key is never read back** — only whether one is set, and its last four.
- **The agent checks it, not the API** (a vendor client in the API is a bug):
  `settings.setResearchKey` calls `POST /internal/crm/verify-key` and writes unless the
  answer is *invalid*. **`401` is the only answer meaning the key is wrong**, and **a
  check that cannot be made is not a failed check** — `unknown` saves anyway and logs it
  unverified.

## Mailbox sync

Always on, on whichever social provider is configured, so there is no extra redirect
URI beyond the sign-in one. Scopes are requested at sign-in and gated by
`requireMailboxAccess()`, because granular consent lets a user untick one and still
sign in.

**An SSO rep is not gated** — `needsMailboxGrant` (`@app/auth`) walls only an account
whose sign-in rows are *all* mailbox providers. It cannot be "has the scopes": an SSO
rep has no Google or Microsoft account to grant on, and `revoke()` keeps the `account`
row, so trying the optional feature and revoking would lock them out. They connect from
Settings → Connections, posting the same `linkSocial` call.

**One granted mailbox is enough.** A rep with both providers linked who granted Google
is not asked for Outlook; `mailboxGrantsNeeded` names the ones still outstanding and
`/grant-access` offers exactly those buttons.

**Microsoft's granted scopes come back fully qualified** —
`https://graph.microsoft.com/Mail.Read`, not `Mail.Read`. `parseScopes` is the one
canonicaliser and strips that prefix, so the comparison is against the bare permission
everywhere.

**Sync is forward-only** — Gmail records the current `historyId` on its first pass and
imports nothing, Calendar reads from `now`, and Outlook records `now` as its cursor.

**`CRON_SECRET`** (min 16 chars) guards `POST /internal/sync/mailboxes` and
`/internal/sync/rates`; both **fail closed when unset**. `/internal/sync/google` is
kept as an alias of the first, so an existing deployment's cron does not break on
deploy. **The jobs run inside the API process** (`apps/api/src/scheduler`), not as host
cron entries, so no plan or cron service is involved: mailboxes every 5 minutes (UTC
slots), exchange rates 06:00, telemetry rollup 07:00, tracking retention 04:00 and archive
prune 05:00, UTC. The scheduler ticks once a minute, and each job takes a Postgres
advisory lock on a dedicated connection, so two API instances (or the overlap during a
deploy) never run the same job twice. `SchedulerRun` keeps each job's last success: a job
missed during downtime runs once when the API is back, and a failure does not advance the
timestamp, so it retries on the next tick (the error is in `SchedulerRun.lastError` and the
API log). The `/internal/...` routes stay as the manual trigger. `SCHEDULER_DISABLED=1`
stops the scheduler in one process. The API must run on a plan that never sleeps.

Deliberate absences: **no `GOOGLE_SYNC_ENABLED`** (a switch that can disable a mandatory
feature is only ever wrong), **no `GOOGLE_WORKSPACE_DOMAIN`** (`ALLOWED_SIGN_IN` already
says who is internal — two sources is how a colleague becomes a lead), **no
`GMAIL_BACKFILL_DAYS`**, **no `OUTLOOK_BACKFILL_DAYS`**, **no rate provider variable**.

## Telemetry is off until you give it your own PostHog project

Nothing is sent unless **both** `TELEMETRY_POSTHOG_KEY` and `TELEMETRY_POSTHOG_HOST` are
set (the host must be a web address). While either is unset no client is constructed, so
there is no queue waiting to flush later and nothing throws. `CRM_TELEMETRY_DISABLED="1"`
or `DO_NOT_TRACK=1` switches it off even then. The Render Blueprint sets neither variable.

- **Server side only**, `posthog-node` in the API and the agent. **`posthog-js`
  appears once, on the landing page**, and nowhere a record can be reached: autocapture
  would lift names and amounts out of somebody else's database. That one import is gated
  on `window.location.hostname`, not on `IS_MARKETING`. `docs/telemetry.md`.
- **The destination is the owner's.** The template ships no key and no host. A `phc_`
  key is write-only (it can send events and read nothing back), so it is configuration,
  not a secret.
- **The install ID is a row, not a file** (`install`, one row, UUID written by the
  migration), because a container filesystem is ephemeral and a file would count
  containers.
- Declared in `env.validation.ts` as optional, like everything else here. Every event and
  the never-sent list are in **`docs/telemetry.md`**.

## Render variables

The Blueprint (`clients/<id>/render.yaml`) wires these; do not type them by hand.

- **`CLIENT_ID`** names the folder under `clients/` this deploy serves. It is in the
  `<id>-shared` group and is also a Docker build argument for the web app.
- **`AGENT_URL`** is `http://<id>-agent:10000`, scheme included, set in the shared group.
  It is also the one switch for "is there an agent on this deploy?" (`agentServiceEnabled()` in
  `apps/api/src/agent/agent-shell.ts`): set means yes; unset on Render means no (the free practice
  deploy), and nothing is queued, enrichment and research are refused with a plain message, and
  the web app hides the Enrichment chip, Agent tabs and the research settings. Unset off Render
  (local dev) still means the agent on its default localhost port. No separate variable.
- **`SCHEDULER_DISABLED`** stops the in-process scheduler (see Mailbox sync).
- **`AGENT_SHELL`** forces Chat, the agent builder and the deployed team agents on (`1`)
  or off (`0`). The Blueprint sets `1` in the shared group, so client deploys have the
  shell on: the agent can run code on the agent server and the sandbox has no network
  isolation (owner decision, `docs/DECISIONS.md` 2026-11-05). Unset, they are off
  whenever `RENDER` is set (Render sets it itself) and on elsewhere. The api and the
  agent both read it, so keep it in the shared group. `agent/lib/shell.ts`,
  `api/src/agent/agent-shell.ts`.
- **`PORT`** is set by Render for web services (10000); the agent reads `AGENT_PORT`,
  then `PORT`.

## Not env vars

- **Cache TTL** — `DEFAULT_TTL_MS` (60s) in `cache.module.ts`; `CACHE_TTL_MS` overrides.
- **Redis** — optional; without `REDIS_URL` the cache is per-instance in-memory, which
  is wrong for multi-instance.
- **Sign-in method** — Google and Microsoft are in code; an IdP is a row (SSO, in `api.md`).
