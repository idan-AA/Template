# Render migration plan (Vercel to Render)

Owner: Dashboard Session 1. Status: PLAN ONLY, awaiting Dashboard Manager review. No code written.
Agent-facing document. Status words: TODO / DOING / DONE / BLOCKED.

Fence (mine): render.yaml, vercel.json, .vercelignore, Dockerfiles, start/build scripts in package.json files,
apps/api/src/config/env.validation.ts, .env.example deploy vars, docs/setup.md, docs/environment.md, .github/workflows.
Session 2 owns the module system and rebranding. Anything outside the fence below is marked **(outside fence)**
and goes to the manager before I touch it.
Added to my fence by the manager 2026-11-04: apps/app/app/api/health/route.ts (new), apps/agent/agent/channels/eve.ts (auth list),
apps/agent/agent/sandbox/*, subagents/*/sandbox/*, apps/agent/agent/lib/sandbox-network.ts, the hint in
packages/db/scripts/require-local-db.ts, the `.vercel` lines in .gitignore files, and the in-process scheduler in apps/api (D10).
UI copy that says "Vercel" stays with Session 2. Those rows marked "(outside fence)" below are now mine except UI copy and db blob code.
HOLD: no repo edits and no local builds in the tree until the manager says the @crm to @app rename is committed.
Status 2026-11-04: plan APPROVED by the manager; changes (one repo + CLIENT_ID, in-process crons, telemetry, owner's account) are folded in.
Package names written as `@crm/*` in this file become `@app/*` after the rename (R14).

Sources read: CLAUDE.md, docs/DECISIONS.md, DASHBOARD-LEDGER.md, docs/setup.md, docs/environment.md,
docs/api.md, docs/agent.md, apps/api/vercel.json, .vercelignore, apps/api/scripts/build-func.mjs, apps/api/api/index.ts,
apps/api/src/main.ts, agent channels/schedules/sandbox, all package.json and turbo.json files, .env.example (names only),
eve self-hosting docs (crm/apps/agent/node_modules/eve/docs). `.env` was never read.

---

## 0. Decisions I am committing to (Self-Answer Test applied)

| # | Decision | Why |
|---|---|---|
| D1 | Two Render **web services** (`app`, `api`), one **private service** (`agent`), one **Postgres**. Nothing else (crons are in the API, D10). | The three code bases are already three separate processes talking over URLs (`API_URL`, `AGENT_URL`). Mirroring that is the smallest change. |
| D2 | The agent is a **private service, not a background worker**. | It serves HTTP (`/eve/v1/*`, `/internal/crm/*`, workflow callbacks) that the app calls with `AGENT_URL`. A Render background worker has no network address. It also runs its own per-minute schedule, so it must stay up. |
| D3 | **Docker runtime** for `api` and `agent`, native Node runtime is not used. | Bun-only repo, `bun@1.4.0` pinned, Prisma engines, nestjs-trpc binary (`postinstall` chmod). Docker removes "does Render's native runtime have this Bun" as a question. UNVERIFIED which is better, see risk R1. |
| D4 | Migrations run as `preDeployCommand: bun run db:deploy`, then the existing schema drift check. | Replaces the `VERCEL_ENV === "production"` gate in build-func.mjs. Render runs pre-deploy once per deploy, before traffic moves. |
| D5 | Delete `apps/api/api/index.ts`, `build-func.mjs`, `vercel.json`, `.vercelignore` at the end, after Render is proven. | `main.ts` is already a normal listening server (PORT). The serverless entry is dead code on Render. Cleanup is last so rollback stays possible. |
| D6 | Keep the Vercel **AI Gateway** (a model API, not hosting). Needs `AI_GATEWAY_API_KEY`. | It is the model router the whole agent is written against. Replacing it is a separate project. |
| D7 | Telemetry is **off unless the owner sets his own PostHog key and host env vars** (manager, 2026-11-04: Session 2 removes the hard-coded key). The Blueprint sets neither, so a client deploy sends nothing. | The old key pointed at the crm authors. Exact variable names come from Session 2; table in section 3 uses placeholders `POSTHOG_KEY_VAR` and `POSTHOG_HOST_VAR` until they land. |
| D8 | **One repo serves every client.** Each Render deploy picks its client with env var `CLIENT_ID`; client config lives under `clients/<id>/` (manager, 2026-11-04). | Replaces the earlier "repo per client" idea (old Q5 is closed). A core fix is one push, not N upstream merges. |
| D9 | **Multiple deploys from one repo.** Render docs (infrastructure-as-code) confirm: a Blueprint file can live anywhere (dashboard field "Blueprint Path"); "You can create multiple Blueprints from a single YAML file", each owning an independent resource set; if names clash Render appends a suffix to the new resources; and one resource must never be managed by two Blueprints. **Plan B (chosen by the manager, 2026-11-04):** `scripts/new-client <id>` generates `clients/<id>/render.yaml` from one `render.yaml.template`; service names are prefixed `<id>-`, `CLIENT_ID` is fixed in the file; the Blueprint Path field points at it. Names are deterministic, no Render suffixes, and a client's whole setup lives in its folder. **Plan A (fallback only if the spike finds a real problem with B):** one root `render.yaml`, replicated per client, values typed at the `sync: false` prompts. The Phase 1 spike confirms B. | Matches the manager's rule: new client = add `clients/<id>/`, create services, set `CLIENT_ID`. Plan A needs no generator. |
| D10 | **No cron services.** The five jobs run **in the API process** (`@nestjs/schedule`) behind a Postgres advisory lock. The `/internal/*` routes stay for manual triggering with `CRON_SECRET`. (manager, 2026-11-04) | Each Render cron service has a $1 minimum monthly charge (Render cronjobs docs), times five, times every client. The API is now a long-lived process, so in-process timers are valid. No real reason against, design notes in R8. |
| D11 | Final names (manager, 2026-11-04): telemetry `TELEMETRY_POSTHOG_KEY` and `TELEMETRY_POSTHOG_HOST` (off when unset, commit 70fac77); client `CLIENT_ID`. Layout confirmed by the owner: `clients/<id>/render.yaml` (generated from one template, Plan B) and `clients/<id>/client.config.ts`. Package names become `@app/*` when the rename (518 files, in progress) is committed. | Stop planning against placeholders. |

## 1. Vercel and serverless assumptions in the code

Format: file:line, what it assumes, action. "Fence" says who may edit.

### 1a. Build and deploy plumbing (my fence, all removed or replaced)

| Where | Assumption | Action |
|---|---|---|
| apps/api/vercel.json:3-22 | Five Vercel Cron entries: `/internal/sync/mailboxes` `*/5 * * * *`, `/internal/sync/rates` `0 6 * * *`, `/internal/telemetry/rollup` `0 7 * * *`, `/internal/tracking/retention` `0 4 * * *`, `/internal/archive/prune` `0 5 * * *` | Move the same five schedules (UTC) into an in-process scheduler, D10 and section 2e. Delete file last. |
| apps/api/scripts/build-func.mjs:17-18 | Writes Vercel Build Output API to `.vercel/output/functions/api/index.func` | Delete. Render runs `bun build` then `bun dist/main.js`. |
| apps/api/scripts/build-func.mjs:21-41, 69-156 | Hand-vendors `node_modules` into the function because serverless has no install step | Not needed. A Docker image runs `bun install`. Delete. |
| apps/api/scripts/build-func.mjs:165-173 | `.vc-config.json`: `maxDuration: 60`, `memory: 1769`, `regions: ["iad1"]`, `nodejs22.x` | Gone. No 60 second request limit on Render. Set Render region in render.yaml instead. |
| apps/api/scripts/build-func.mjs:177-181 | `routes` catch-all and a **stale** cron `/internal/sync/google` | Delete (the alias route still exists in sync.controller.ts:59,69; keep the alias, drop only this config). |
| apps/api/scripts/build-func.mjs:186-213 | Migrations gated on `VERCEL_ENV === "production"`; `DIRECT_DATABASE_URL`, `POSTGRES_URL_NON_POOLING`, `DATABASE_URL_UNPOOLED` fallback chain for Neon pooler | Move `prisma migrate deploy` to `preDeployCommand`. Render Postgres has no pooler, so plain `DATABASE_URL` is correct. |
| apps/api/scripts/build-func.mjs:215-251 | Post-deploy `prisma migrate diff --exit-code` drift report | Keep as a small script `apps/api/scripts/check-schema-drift.mjs` run right after migrate in the same pre-deploy command. Reason: docs/setup.md "migrate deploy is not proof the schema is right". |
| apps/api/api/index.ts:1-26 | Serverless handler, cached Nest instance per container | Delete. `src/main.ts` already does `app.listen(process.env.PORT ?? 3001)`, `enableShutdownHooks`. |
| apps/api/package.json:`build`, `start`, `start:prod`, `postinstall` | `build` is `bun build src/main.ts --target=bun --outdir dist --packages=external`; `start:prod` is `bun dist/main.js` | These already fit Render. Use `start:prod`. `--packages=external` means the image must keep `node_modules`; do not prune. |
| .vercelignore:1-33 | Keeps `.env*` out of `vercel deploy` uploads | Replace with `.dockerignore` (same purpose: never copy `.env*` into an image layer). |
| .gitignore:20-21, apps/agent/.gitignore:5, apps/app/.gitignore:36-37 | `.vercel` ignore lines | Harmless. Remove in cleanup (outside fence, trivial, ask). |
| apps/agent/turbo.json:7 | `build` outputs include `.vercel/output/**` | Replace with `.output/**` only. Fence: package build config, mine. |
| turbo.json:87, 94, 95 | `VERCEL_OIDC_TOKEN`, `VERCEL`, `VERCEL_GIT_COMMIT_SHA` in `globalPassThroughEnv` | Remove all three. Add `RENDER_GIT_COMMIT` (Render sets it) only if version.ts needs it, see 1c. |
| turbo.json:62-96 | Each deploy-time variable must be in `globalPassThroughEnv` or Turbo hides it | Any new variable I add (section 3) goes here too. Start commands bypass turbo, but `next build` runs under turbo and reads `API_URL`/`APP_URL`. |
| turbo.json:104 | Build `env: ["API_URL","APP_URL","NEXT_PUBLIC_API_URL"]` | Keep. These are baked into the browser bundle, see risk R3. |

### 1b. Runtime code that assumes Vercel (outside my fence unless stated)

| Where | Assumption | Action |
|---|---|---|
| apps/agent/agent/channels/eve.ts:5,47 | `vercelOidc()` is an accepted authenticator | Harmless off Vercel (never matches). Remove from the list so a future reader does not think OIDC protects it. **(outside fence, agent code)** |
| apps/agent/agent/channels/eve.ts:44-47 | If `AGENT_BRIDGE_SECRET` is unset only `localDev()` remains. `localDev()` accepts loopback only, so on Render the app gets 401/503 | `AGENT_BRIDGE_SECRET` is **required** in every deploy. Same value in `app` and `agent` (envVarGroup). |
| apps/agent/agent/sandbox/sandbox.ts:5, subagents/agent_builder/sandbox/sandbox.ts:5, subagents/agent_runner/sandbox/sandbox.ts:5 | `DefaultSandbox.environment({ vercel: { networkPolicy: "deny-all" } })`. On Vercel it is Vercel Sandbox. Elsewhere eve tries Docker, microsandbox, just-bash in order (eve docs, sandbox/default.mdx) | On Render there is no Docker socket and most likely no KVM for microsandbox, so it falls to **just-bash: no network isolation, no native processes**. docs/agent.md:295-301 promises deny-all egress. See risk R2 and open question Q2. |
| apps/agent/agent/lib/sandbox-network.ts (`denySandboxNetwork`) | Calls `setNetworkPolicy`; just-bash does not expose it | Must verify it does not throw on just-bash (R2). |
| apps/agent/agent/channels/crm.ts:167,173,191,196,203,208 | `waitUntil` from eve handlers to finish work after responding | On a long-lived Node process `waitUntil` just keeps a promise alive. Fine. Verify under `eve start` (R4). |
| apps/agent/agent/schedules/dispatch.ts:12-15 | `defineSchedule({ cron: "* * * * *" })`, work wrapped in `waitUntil`. On Vercel it becomes a Cron Job | docs/self-hosting: `eve build && eve start` starts Nitro's schedule runner. So the agent service must be **always on, one instance**. No separate cron job for it. |
| apps/agent/scripts/start.ts:4-17 | `eve start --port $AGENT_PORT ?? $PORT ?? 2000`. Does **not** pass `--host 0.0.0.0` | Render needs the service to bind `0.0.0.0`. eve docs example uses `eve start --host 0.0.0.0`. Add `--host 0.0.0.0` (or env). Fence: start script, mine. |
| eve workflow state (eve docs, self-hosting "Persist workflow state") | Default local Workflow world writes to `.eve/.workflow-data`. On Vercel it is Vercel Workflow | Needs a **Render persistent disk** mounted at `/app/apps/agent/.eve/.workflow-data`, or `@workflow/world-postgres`. Without either, a redeploy loses in-flight runs. See section 2 and Q3. |
| eve proxy routes (eve docs) | Both `/eve/` and `/.well-known/workflow/` must be reachable | Private service on Render exposes one port, all paths. OK. Never put a path-restricted proxy in front. |
| packages/db/src/blob.ts:24,51 | `@vercel/blob` `put()` guarded by `BLOB_READ_WRITE_TOKEN` | Vercel Blob needs a Vercel account. See Q1. Without the token pictures are not mirrored (already a handled capability, never throws): apps/agent/agent/lib/capabilities.ts:70, portrait.ts:46,104, tools/fetch_contact_photo.ts:25, scripts/backfill-brand-images.ts:15. **(outside fence, package db)** |
| packages/db/src/images.ts:1 | `BLOB_HOST_SUFFIX = ".blob.vercel-storage.com"` decides which URLs are "ours" | Changes with any storage swap. |
| apps/app/next.config.ts:34 | `images.remotePatterns` allows `**.blob.vercel-storage.com` | Changes with any storage swap. **(outside fence, app)** |
| packages/db/package.json:50 | `@vercel/blob` dependency | Remove if storage swapped. |
| apps/api/src/settings/model-catalog.service.ts:6 | `https://ai-gateway.vercel.sh/v1/models` | Keep (D6). Works with the key from any host. |
| apps/app/components/agent-builder/agent-builder-chat.tsx:1572-1576, apps/app/app/(app)/[slug]/settings/agent-model.tsx:114 | User-facing text says "add credits in Vercel" | Copy. Session 2 (rebrand). Report to manager. |
| packages/telemetry/src/client.ts:87 | `is_vercel: Boolean(process.env.VERCEL)` | Telemetry is off (D7). Dead on Render. Session 2 may drop. |
| packages/telemetry/src/version.ts:28 | Commit SHA from `VERCEL_GIT_COMMIT_SHA`, then `GIT_COMMIT_SHA`, then `GITHUB_SHA` | Set `GIT_COMMIT_SHA` from Render's `RENDER_GIT_COMMIT` in the start command, or ignore (telemetry off). |
| apps/api/src/telemetry/rollup.service.ts:153,158 | Reads `BLOB_READ_WRITE_TOKEN`, `AI_GATEWAY_API_KEY` presence for a rollup | No change. |
| packages/db/prisma/migrations/20260805160000_telemetry_install/migration.sql:3 | Comment about Vercel ephemeral filesystem | Comment in an applied migration. **Never edit an applied migration.** Leave. |
| apps/api/src/sync/sync.controller.ts:44-75, archive-retention.controller.ts:54-64, rates.controller.ts:46-56, telemetry.controller.ts:44-52, tracking.controller.ts:157-167 | Cron endpoints accept GET and POST with `Authorization: Bearer $CRON_SECRET`, fail closed if unset | **Work unchanged** for Render cron jobs. Vercel Cron sends GET; we will send POST. |
| apps/api/src/health/health.controller.ts:20-62 | `GET /health` runs `SELECT 1`, returns 503 when the database is down | Use as Render health check path for `api`. |
| docs/agent.md:121-124 | "BackfillService runs detached on a serverless function, the tail is not guaranteed" | True on Vercel, **false on Render** (long-lived process). Doc only. Fix in docs pass. Do not change the design, the cron stays the guarantee. |
| apps/api/src/create-app.ts | Express app, Swagger set up before `app.init()` | No serverless coupling. Bun `--target=bun` bundle keeps `@nestjs/swagger` external, which works because `node_modules` stays in the image. |
| apps/app (Next 16) | `next build` / `next start`; no `output: "standalone"`, no `runtime = "edge"`, no `maxDuration`, no `@vercel/*` imports found | Runs on Render as is. `proxy.ts` is Next 16 middleware (Node runtime). |

Grep evidence: patterns `vercel`, `VERCEL_`, `@vercel/`, `waitUntil`, `maxDuration`, `runtime = "edge"`, `x-vercel`, `OIDC`,
`BLOB_READ` over apps/ and packages/ excluding tests, docs, node_modules. Matches in `mcp-integrations/src/vendors/vercel.ts`,
`ui/.../brand-logos/vercel.tsx`, `app/components/landing/*`, `prisma/seed.ts:84` are the Vercel **product** as a CRM
integration or logo, not hosting. Leave them. (Session 2 may drop the landing page.)

### 1c. Docs that describe Vercel (my fence)

docs/setup.md ("`vercel env pull` writes `.env.local`", "Migrations run on the production deploy", lines ~96-145),
docs/environment.md (Cron paragraph "Crons live in apps/api/vercel.json", "AI_GATEWAY_API_KEY ... OIDC", "Vercel's filesystem is ephemeral",
"Real environment variables always win ... Vercel/Docker/CI"), docs/api.md:140,156-164,252 (not my file, report to manager),
apps/api/README.md:40, apps/app/README.md:32-34, README.md:80,168-179 (outside fence).
`packages/db/scripts/require-local-db.ts:43-47` tells people to run `vercel env pull`: rewrite the hint to name Render (`.env.render`). Fence: db scripts, ask manager.

## 2. The Render shape

### 2a. Topology

```
browser ---> app  (web, Next.js)   PORT 10000, public
browser ---> api  (web, Nest)      PORT 10000, public (OAuth callbacks and cookies live here)
app     ---> api  server side via API_URL (public https URL, same as browser; see R3)
app/api ---> agent (private service) via AGENT_URL = http://<agent-host>:<port>, scheme required
api (in-process scheduler, advisory lock) runs the 5 jobs itself; /internal/... stays for manual runs with CRON_SECRET
app, api, agent ---> postgres via DATABASE_URL (Render internal connection string)
```

One service or two for app and api: **two**. `API_URL` mints session cookies and serves `/api/auth/*`; every OAuth `redirect_uri`
is built from `API_URL` (docs/environment.md "Where things are"). Folding api into app means a rewrite proxy and changes to
better-auth base URL handling: that is auth code, not hosting, so not in this migration. Future option noted in Q4.

### 2b. render.yaml (Blueprint) outline

```yaml
# names are templated per client: prefix with the client slug, e.g. "acme-"
databases:
  - name: <client>-db
    plan: basic-256mb            # pick plan per client; free tier expires, never use for a client
    postgresMajorVersion: "17"   # CI uses postgres:17-alpine
    ipAllowList: []              # internal only; owner connects via a one-off psql/SSH when needed

envVarGroups:
  - name: <client>-shared
    envVars:
      - key: BETTER_AUTH_SECRET
        generateValue: true
      - key: AGENT_BRIDGE_SECRET
        generateValue: true
      - key: CRON_SECRET
        generateValue: true
      - key: MCP_ENCRYPTION_KEY
        generateValue: true       # VERIFY required format (docs say nothing about length)
      - key: CHAT_EVENT_ENCRYPTION_KEY
        generateValue: true       # docs: 32 bytes base64. VERIFY Render's generated value decodes to 32 bytes
      - key: CRM_TELEMETRY_DISABLED
        value: "1"
      - key: NODE_ENV
        value: production

services:
  - type: web
    name: <client>-api
    runtime: docker
    dockerfilePath: ./apps/api/Dockerfile
    dockerContext: .
    healthCheckPath: /health
    preDeployCommand: bun run db:deploy && bun apps/api/scripts/check-schema-drift.mjs
    envVars:
      - fromGroup: <client>-shared
      - key: DATABASE_URL
        fromDatabase: { name: <client>-db, property: connectionString }
      - { key: API_URL,  sync: false }     # public https URL of this service or custom domain
      - { key: APP_URL,  sync: false }
      - { key: AGENT_URL, fromService: { type: pserv, name: <client>-agent, property: hostport } }  # needs "http://" prefix, see note
      - { key: ALLOWED_SIGN_IN, sync: false }
      # sign-in pair, one of the two, set together or not at all
      - { key: GOOGLE_CLIENT_ID, sync: false }
      - { key: GOOGLE_CLIENT_SECRET, sync: false }
      - { key: AI_GATEWAY_API_KEY, sync: false }

  - type: web
    name: <client>-app
    runtime: docker
    dockerfilePath: ./apps/app/Dockerfile
    dockerContext: .
    healthCheckPath: /api/health    # does not exist yet; see R5. Fallback: path of the sign-in page
    envVars:
      - fromGroup: <client>-shared
      - key: DATABASE_URL
        fromDatabase: { name: <client>-db, property: connectionString }
      - { key: API_URL, sync: false }
      - { key: APP_URL, sync: false }
      - { key: AGENT_URL, ... }         # same as api
      - { key: IS_MARKETING, value: "false" }

  - type: pserv
    name: <client>-agent
    runtime: docker
    dockerfilePath: ./apps/agent/Dockerfile
    dockerContext: .
    healthCheckPath: /eve/v1/health
    disk:                              # only if the default local Workflow world is kept (Q3)
      name: eve-workflow
      mountPath: /app/apps/agent/.eve/.workflow-data
      sizeGB: 1
    envVars:
      - fromGroup: <client>-shared
      - key: DATABASE_URL
        fromDatabase: { name: <client>-db, property: connectionString }
      - { key: AI_GATEWAY_API_KEY, sync: false }

```

No `type: cron` services (D10). Field names below were checked against Render's Blueprint spec on 2026-11-04 (blueprint-spec,
deploys, disks, docker pages): `plan` values are `0.1c-256mb` (smallest Postgres, legacy `basic-256mb`) and `0.5c-512mb`
(smallest paid web or private service); `autoDeploy` is deprecated, use `autoDeployTrigger: off|commit|checksPass`;
`buildFilter.paths`; `region` is one of oregon, ohio, virginia, frankfurt, singapore and cannot change later;
`postgresMajorVersion` is a string and cannot change later; `diskSizeGB` is `1` or a multiple of `5`.
Replace `basic-256mb` and `autoDeploy` in the outline above with those names when writing the real file. `fromGroup` syntax
and the exact `disk` layout were not readable in the docs fetch: copy them from a Render example during Phase 1.

Notes on the outline (all UNVERIFIED against live Render until the first deploy, see section 5):
- `AGENT_URL` needs the `http://` scheme (validated at boot, docs/environment.md). `fromService ... property: hostport` returns `host:port` with no scheme. Use `fromService ... property: host` plus a fixed `http://` composed in the start script, or set the whole value with `sync: false`. Decide at build time after a spike.
- Docker contexts are the repo root (workspaces need the lockfile and `packages/*`). Add `buildFilter` paths so a docs-only push does not redeploy.
- `preDeployCommand` runs in the built image of the service it is attached to, so `api`'s image must contain `packages/db` and the Prisma CLI.
- Region: set one region on every service and the database; internal URLs only work inside one region.

### 2c. Build and start commands (Bun only)

| Service | Image build (inside Dockerfile) | Start |
|---|---|---|
| api | `bun install --frozen-lockfile`, `bun run db:generate` (Prisma client), `bun run --filter=api build` (turbo builds `^build` packages first; `trpc:generate` is NOT run: `src/generated/server.ts` is committed, docs/api.md:136-141) | `bun apps/api/dist/main.js` (`start:prod`) |
| app | `bun install --frozen-lockfile`, `db:generate`, `API_URL` and `APP_URL` passed as build args, `bunx turbo run build --filter=app...` | `bun run --cwd apps/app start` (`next start`, binds 0.0.0.0, honors `PORT`) |
| agent | `bun install --frozen-lockfile`, `db:generate`, `bunx turbo run build --filter=agent...` (`eve build`, writes `.output/`) | `bun apps/agent/scripts/start.ts` with `--host 0.0.0.0` added |

Prisma client: generated at build time in every image (`db:generate`). Check `packages/db/package.json` scripts before writing the Dockerfile (TODO).
Never `cd`; Dockerfiles use `WORKDIR /app` and `--cwd`.

### 2d. Health checks and zero downtime

- api: `GET /health` (200 ok, 503 when database down). Exists.
- agent: `GET /eve/v1/health` (eve docs). Exists.
- app: no dedicated route found. Needs a tiny `app/api/health/route.ts` returning 200 without a session redirect. **(outside fence, app; ask manager)**. Until then do not set `healthCheckPath` on app, or Render may mark it unhealthy on the sign-in redirect.
- A service with a persistent disk cannot do zero-downtime deploys and cannot scale past one instance. Acceptable for the agent (single schedule runner by design).

## 3. Environment variables

Names only. Source of truth stays `.env.example` (documentation), `env.validation.ts` (API), and `globalPassThroughEnv` in root `turbo.json`: all three.

### 3a. Full list a new client deploy needs

| Variable | Service(s) | How it is set | Required |
|---|---|---|---|
| DATABASE_URL | app, api, agent | Blueprint `fromDatabase` | yes |
| BETTER_AUTH_SECRET | app, api, agent | Blueprint `generateValue` (group) | yes |
| ALLOWED_SIGN_IN | app, api | wizard prompt | yes (empty list fails closed) |
| API_URL | app (build and run), api, cron | wizard prompt | yes |
| APP_URL | app, api | wizard prompt (trusted-origin allow-list, comma separated) | yes |
| AUTH_COOKIE_DOMAIN | api | wizard prompt, only when app and api are subdomains of one parent | yes on custom domains |
| AGENT_URL | app, api | Blueprint `fromService` (scheme required) | yes |
| AGENT_BRIDGE_SECRET | app, agent | `generateValue` (group) | yes (see 1b) |
| CRON_SECRET | api | `generateValue` (group), min 16 chars | yes for the manual `/internal/*` routes (they fail closed); the in-process scheduler does not need it |
| MCP_ENCRYPTION_KEY | api, agent (check which read it) | `generateValue` | yes if MCP connections used; set always |
| CHAT_EVENT_ENCRYPTION_KEY | api, agent | `generateValue`, same value in both | yes (otherwise chat events stored plaintext) |
| AI_GATEWAY_API_KEY | agent (and api for model catalog) | wizard prompt | yes (no OIDC off Vercel). **This key needs a Vercel account: it is the only Vercel dependency left after migration (D6).** |
| GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET | app, api | wizard prompt | one pair of Google or Microsoft, set together |
| MICROSOFT_CLIENT_ID + MICROSOFT_CLIENT_SECRET (+ MICROSOFT_TENANT_ID) | app, api | wizard prompt | alternative to Google |
| NODE_ENV | all | `production` | yes |
| CLIENT_ID | app, api, agent (and at image build if client config is bundled; pass as Docker build arg) | generated into `clients/<id>/render.yaml` | yes (D8). Must match a folder under `clients/`. |
| TELEMETRY_POSTHOG_KEY, TELEMETRY_POSTHOG_HOST (final names, Session 2 commit 70fac77) | api, agent | not in the Blueprint | no. Unset means telemetry off (D7). The old `CRM_TELEMETRY_DISABLED` is no longer forced. Add both to turbo.json `globalPassThroughEnv` if Session 2 has not. |
| IS_MARKETING | app | `false` | yes (default is off; set explicitly) |
| PORT | all web/pserv | Render sets it (10000) | automatic; api reads `PORT`, agent reads `AGENT_PORT ?? PORT` |

Optional (a missing key removes a capability, never an error): `PERPLEXITY_API_KEY`, `GITHUB_TOKEN`, `BLOB_READ_WRITE_TOKEN` (see Q1),
`REDIS_URL` (needed only if the API ever runs more than one instance; Render Key Value is the equivalent), `CACHE_TTL_MS`,
`SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `PRISMA_LOG_QUERIES`, `AGENT_PORT`, `DO_NOT_TRACK`.
`CONTEXT_DEV_API_KEY` is deliberately NOT a variable (docs/environment.md).

### 3b. Removed or renamed

| Variable | Change |
|---|---|
| VERCEL, VERCEL_ENV, VERCEL_GIT_COMMIT_SHA, VERCEL_OIDC_TOKEN | Remove from code paths and `globalPassThroughEnv` (turbo.json:87,94,95). |
| DIRECT_DATABASE_URL, POSTGRES_URL_NON_POOLING, DATABASE_URL_UNPOOLED | Not needed (no pooler). Remove from `.env.example` line 8 and turbo.json:65. Keep `TEST_DATABASE_URL` (tests). |
| BETTER_AUTH_URL | Legacy fallback of `API_URL`. Do not set. |
| NEXT_PUBLIC_API_URL | Derived from `API_URL` in next.config.ts:24-26. Do not set separately. |
| GIT_COMMIT_SHA | Optional, only if telemetry or version display is wanted. |

### 3c. Files I will edit (when allowed)

`.env.example` (deploy vars and notes), `apps/api/src/config/env.validation.ts` (drop none that are read; add nothing new unless a new var is added),
`turbo.json` `globalPassThroughEnv`, `docs/environment.md`, `docs/setup.md`. Rule from environment.md: a new variable has three homes.

## 4. Deploying a new client (the template promise)

Target: under 15 minutes of hands-on time, no code edits per client.

All first deploys and practice runs are on the **owner's Render account** (Q6, manager 2026-11-04). Handing a client their own
workspace later is a separate step, written when needed.

1. Add `clients/<id>/` (config and brand, Session 2's format) and commit it to the one repo `idan-AA/Template`. No per-client repo (D8).
2. In the owner's Render workspace: New, Blueprint, pick the repo. Plan A: root `render.yaml`, and `CLIENT_ID=<id>` is typed at the prompt. Plan B: set Blueprint Path to `clients/<id>/render.yaml` (generated by `scripts/new-client <id>`, names prefixed `<id>-`). Pick region and plans. `autoDeployTrigger: off` (R13).
3. Fill the prompts (variables marked `sync: false`): `API_URL`, `APP_URL`, `ALLOWED_SIGN_IN`, sign-in pair, `AI_GATEWAY_API_KEY`, `AUTH_COOKIE_DOMAIN` when using custom domains. Secrets, database URL, bridge secret, cron secret, encryption keys are generated or wired by the Blueprint. Build-time reads (`CLIENT_ID`, `API_URL`) must be present before the first build.
4. Apply. Render creates the database, api (runs `db:deploy` pre-deploy, then starts the in-process scheduler), agent, app. Four resources, no cron services.
5. Add custom domains (`app.<client>.com`, `api.<client>.com`), then set `API_URL`, `APP_URL`, `AUTH_COOKIE_DOMAIN`, redeploy `app` (the URL is baked at build, R3).
6. Add the OAuth redirect URI `API_URL/api/auth/callback/<provider>` in Google or Entra.
7. First sign-in as an `ALLOWED_SIGN_IN` user. Run the checklist in `docs/setup.md` "Verify a new client deploy" (to be written): `/health` 200, sign in works, agent tab answers, one `/internal/...` route returns 200 with `CRON_SECRET` and the scheduler log line shows each job registered.
8. Modules for that client are switched on by Session 2's mechanism (env var or settings row). When that exists, add its variable to this table. Keep the deploy independent of it.

A one-click "Deploy to Render" button in the README is possible after step 1 works (needs the repo URL). A `scripts/new-client.md` checklist is the deliverable; automation via the Render API is out of scope until the manual path is proven (Q6).

## 5. Risks and what I cannot verify locally

| ID | Risk | Effect | What would settle it |
|---|---|---|---|
| R1 | Render Docker with `oven/bun` image for Bun 1.4.0: tag availability and `postinstall` `chmod-trpc-binary.mjs` behaviour unknown. The nestjs-trpc generator needs GLIBC 2.39 but only `check-types`/`dev` run it, not the image. | Build fails. | First real build. Pick a Debian bookworm or newer base; check glibc in the image only if codegen is needed. |
| R2 | Agent sandbox falls back to **just-bash** on Render. **Tested 2026-11-04 (scratchpad, `just-bash` via bun, not in the repo tree):** it is a pure-JS shell with a virtual filesystem. `echo`/`ls` work; `curl`, `node` and `python3` are "command not found" or "not available". So by default it cannot reach the network and cannot run native programs. `denySandboxNetwork` (`apps/agent/agent/lib/sandbox-network.ts:1-19`) guards with `"setNetworkPolicy" in sandbox`, so on just-bash it **silently does nothing and does not throw**. | docs/agent.md:295-301 ("deny-all egress on the backend factory") is true only by accident of what just-bash lacks, not by enforcement. Builder/runner features that need a real shell or native tools will not work. | Manager decision Q2: those features are OFF by default on Render behind a capability flag. Still to test: how eve's `JustBashSandbox` wiring enables network, if at all (eve docs say "provides no network isolation", which can mean it is allowed when a network option exists). Check on the first Render agent turn. |
| R3 | `NEXT_PUBLIC_API_URL` is baked into the app bundle at build. The api's public URL must exist before the app builds. `*.onrender.com` names can get a suffix on collision. | Browser calls wrong host; sign-in loops. | Use custom domains or set `API_URL` explicitly after api is created, then redeploy app. Document the order in step 5. |
| R4 | `waitUntil` semantics under `eve start` and schedule runner behavior with idle spin-down. | Dispatch tick never runs. | Run `eve build && eve start` locally; watch the per-minute tick. Never use a plan that sleeps (free tier). |
| R5 | No app health route. | Render cannot probe app; bad deploy goes live. | Add route (outside fence). |
| R6 | Agent workflow state on a disk is single-instance, no zero-downtime; world-postgres package is beta (`5.0.0-beta` line) and must match eve's vendored version. | Redeploy drops in-flight runs; or protocol mismatch. | Spike both; default to disk (Q3). |
| R7 | Cookie sharing across `app` and `api` needs a common parent domain (`AUTH_COOKIE_DOMAIN`). On raw `onrender.com` hosts the two are different registrable sites. | Sign-in completes, session resolves null (documented failure in environment.md). | Require custom domains for real clients; `onrender.com` only for smoke tests. |
| R8 | In-process crons (D10) design points. (a) Instances overlap during every deploy and the API may run more than one, so each job takes a lock. **Do not use a Prisma pooled connection for a session advisory lock** (the lock lives on one pooled connection, and a long Prisma interactive transaction hits its timeout). Use a dedicated `pg` client per job run: `SELECT pg_try_advisory_lock(<fixed int per job>)`, run, `pg_advisory_unlock`, close. If the lock is taken, skip silently. (b) Jobs share the event loop with requests: mailbox sync every 5 minutes must stay bounded (it already has a budget per docs/api.md:187-189). (c) Timers need the process awake: never use a plan that sleeps. (d) **Catch-up (manager, 2026-11-04):** missed jobs are not skipped. The scheduler keeps a last-successful-run timestamp per job in the database. On boot and on every tick, a job runs when `now - lastSuccess` is greater than its period (5 minutes for mailboxes, 24 hours for the daily four), then it also keeps its normal UTC time slot. Failure does not advance the timestamp, so it retries on the next tick. Exchange rates and prunes therefore catch up after downtime. The check and the write happen under the same advisory lock. **This needs a new table** (for example `SchedulerRun { job text primary key, lastSuccessAt timestamptz, lastError text }`): CLAUDE.md database gate tier 2 (ADD): confirm it does not exist in the live schema, read `security-rls-permissions` in full, add a Prisma migration. Table sits in `packages/db` (outside my fence unless the manager says otherwise). (e) The failure must be visible: wrap each run, report errors through the project error reporter, per CLAUDE.md "Errors must be visible". | Double runs, missed runs, silent failures. | Unit test with two concurrent runs and one lock; run the app locally with two processes. Keep `/internal/*` routes as the manual path and the test hook. |
| R9 | Migrations on a client database already holding data from another install: `db:deploy` is unguarded by design. | Wrong database migrated. | `DATABASE_URL` comes from the Blueprint link only; never paste a remote URL into a laptop `.env.local` (setup.md hazard, reworded for Render). |
| R10 | CI (`.github/workflows`) is crm's: `release.yml`, `auto-pr.yml`, `pr-base.yml`, `pr-title.yml` assume crm's release-please and branch rules; none mention Vercel. | Noise or blocked PRs for a template. | Keep `ci.yml` (Postgres 17, `db:deploy`, check-types, lint, test). Review the other four with the manager; remove or adapt. |
| R12 | Render docs (2026-11-04): a second Blueprint from the same file gets suffixed names when they clash, but if a Blueprint names an **existing** service Render applies its config to that service, and one resource must not be managed by two Blueprints. Risk is typing a clashing name in Plan B, or Plan A suffix names surprising the `fromService` wiring. | Second client deploy rewrites the first client's services. | Phase 1 spike with two throwaway replications of one `render.yaml`; check names, wiring, and that client A is untouched. Plan B (generated per-client file with an `<id>-` prefix) removes the clash by construction. Optionally group each client in a Render `projects` entry. |
| R13 | Shared branch plus `CLIENT_ID`: one bad core push can break every auto-deploying client. A migration is forward-only on all of them. | Wide blast radius. | `autoDeploy: false` per client (Q5), deploy clients one at a time, canary client first. |
| R14 | Session 2's rename (`@crm/*` to `@app/*`, 517 files) lands before I write code. Package names in this plan, Dockerfile filters, `turbo.json` and `next.config.ts` `transpilePackages` change. | Stale references. | I re-read the repo after the manager says the rename is committed; treat every `@crm/...` name below as `@app/...`. App names `app`, `api`, `agent` do not change. |
| R11 | CLAUDE.md says `CHANGELOG.md`, `AGENTS.md`-style rules, `.githooks/pre-push` need Postgres from docker compose. | Pre-push hook fails on machines without Docker. | Out of scope; mention to manager. |

I cannot verify locally: any Render behavior (Blueprint field names, `fromService` properties, pre-deploy semantics, cron billing,
disk mount, region networking), the Bun 1.4.0 image, eve `start` under Docker, and the sandbox fallback on Render hardware.
Everything in section 2 is written from knowledge of Render's Blueprint spec and must be checked against Render's docs and a real
deploy of a throwaway client before I mark it DONE. No Render account or CLI access has been confirmed in this session.

## 6. Open questions for the owner (via the manager)

Each has my recommendation; I proceed on the recommendation if not told otherwise.

**Manager answers, 2026-11-04:** Q1 (a) for v1, (b) with bookkeeping receipts later. Q2 (a): if just-bash lacks isolation, shell-using builder/runner features are OFF by default on Render behind a capability flag. Q3 (a) disk first, and spike (b) and report. Q4 later. Q5 changed (one repo). Q6 owner's Render account. The text below is the original question, kept for the record.

- **Q1 Picture storage (Vercel Blob).** (a) Skip storage in v1; pictures stay as external links, capability off. (b) S3-compatible bucket (Cloudflare R2) behind a small provider switch in `@crm/db/blob`. (c) Keep Vercel Blob (client deploy then needs a Vercel account). **Recommend (a) for v1 and (b) as a follow-up**: no vendor lock, one env group. Note: bookkeeping may need receipt file storage; (b) will likely be needed then.
- **Q2 Agent sandbox on Render.** (a) Accept just-bash for v1 and turn off the agent builder/runner features that need a shell. (b) Hosted sandbox provider. (c) Docker-in-Docker, not available on Render. **Recommend (a)**, decided after the R2 test.
- **Q3 Agent workflow state.** (a) Persistent disk (simple, single instance). (b) `@workflow/world-postgres`. **Recommend (a) first**, move to (b) if a deploy drops runs in practice. (b) keeps all state in the client's one database, which fits "one database per client" better; revisit after the spike.
- **Q4 One origin.** Folding api behind the app domain (Next rewrite for `/api/auth/*` and tRPC) would remove R3 and R7. It touches auth base URL. **Recommend later, as its own task** after Render works with two services.
- **Q5 Client repo model.** CLOSED by the manager: one repo, `CLIENT_ID` per deploy (D8). Consequence: a push to the shared branch redeploys every client whose Blueprint auto-deploys. Recommend `autoDeploy: false` per client Blueprint (or a `buildFilter` on `clients/<id>/**` plus core paths is not enough). Owner chooses when a core change reaches a client. Also means a migration reaches all client databases only as each client deploys.
- **Q6 Who owns the Render account.** Owner's workspace (owner pays and bills the client) or the client's own workspace. Not a code question; decides step 2 of section 4. **Owner decision.**

## 7. Work breakdown (live checklist)

Phase 0, review gate
- [ ] TODO Manager reviews this plan and answers Q1 to Q6.

Gate: DO NOT edit repo files until the manager says the @crm to @app rename is committed. Only this file is safe.

Phase 1, spikes (no repo changes, throwaway Render workspace)
- [ ] TODO Two Blueprints from one repo with different file paths and service names (R12).
- [ ] TODO Find out how Session 2 reads `CLIENT_ID` (build time or run time) and what `clients/<id>/` holds; adjust Dockerfile build args.
- [ ] TODO Confirm Render Blueprint syntax in Render docs (`fromService` properties, `preDeployCommand`, `disk`, cron `dockerCommand`).
- [ ] TODO Local: `bun run build`, then `eve build && eve start --host 0.0.0.0`, watch schedule tick, confirm `waitUntil` finishes work (R4).
- [ ] TODO Local: `JustBashSandbox` plus `denySandboxNetwork` (R2).
- [ ] TODO Confirm `oven/bun` tag and glibc (R1).

Phase 2, build artifacts (my fence)
- [x] DONE (built and booted 2026-11-04 from a HEAD snapshot; re-prove after Agent 1 commits) `apps/api/Dockerfile`, `apps/app/Dockerfile`, `apps/agent/Dockerfile`, root `.dockerignore`.
- [x] DONE (follows prisma/schema folder if it exists) `apps/api/scripts/check-schema-drift.mjs` (extract from build-func.mjs:215-251).
- [x] DONE `apps/agent/scripts/start.ts`: pass `--host 0.0.0.0`.
- [x] DONE (tests: scheduler.integration.spec, scheduler.service.spec) In-process scheduler in apps/api (D10, R8): `@nestjs/schedule`, five jobs at the old UTC schedules, a dedicated `pg` client advisory lock helper, error reporting, test with two concurrent runners. Keep `/internal/*` routes and `CRON_SECRET`.
- [x] DONE Catch-up: `SchedulerRun` table + migration (tier 2 gate, R8d), run a job on boot/tick when last success is older than its period; test: stop the API across a daily slot, restart, job runs once; test failure does not advance the timestamp.
- [x] DONE (plan names fixed to 0.1c-256mb and 0.5c-512mb, region added) `scripts/new-client` and `render.yaml.template` (Plan B).
- [x] DONE (connection() so it is not prerendered) `apps/app/app/api/health/route.ts` returning 200 without a session redirect, then set app `healthCheckPath`.
- [x] DONE (gate: dispatch sweep only, see DONE log in HANDOFF file) Agent: drop `vercelOidc()` from `channels/eve.ts`; capability flag that turns the shell-using builder/runner OFF on Render; make `denySandboxNetwork` log when it cannot enforce (R2).
- [ ] DOING (hint DONE, .gitignore lines wait for Phase 5) `require-local-db.ts` hint and `.vercel` lines in .gitignore files.
- [ ] TODO Spike `@workflow/world-postgres` (Q3b) and report to the manager.
- [x] DONE (render.yaml.template) `render.yaml` (section 2b), templated names, region, plans.
- [x] DONE `turbo.json`: drop VERCEL vars; keep every new var in `globalPassThroughEnv`; `apps/agent/turbo.json:7` outputs.
- [x] DONE `.env.example` and `env.validation.ts` for the section 3 list; remove Vercel and pooler variables.

Phase 2 review (manager, 2026-11-04): ACCEPTED. Verified by the manager on a fresh boot of the api image: scheduler starts with 5 jobs and runs all 5 within 20 s, /health 200, 503 with the database down, 200 again after; api/agent/auth test packages green. Manager added a once-per-process log of `SHELL_OFF_REASON` (`apps/agent/agent/lib/shell.ts`) so the Render gate is visible in the agent log. Carried over, in priority order:
- [ ] TODO Builder and team-agent UI must say "not available on this host" (read the gate through the API) instead of letting a user queue work that never starts. Owner of the app surface: the modules builder (Agent 1 area). Until then the agent log carries the reason.
- [ ] TODO R3: prove in a browser that the deployed app calls the right API host (`API_URL` baked at build). Only possible on a real deploy.
- [ ] TODO R4: make the agent's per-minute dispatch tick print one log line, so the "Verify a new client deploy" checklist can see it (today only indirect DB activity).
- [ ] TODO Re-build and re-boot all three images from the committed tree once Agent 1's modules work is committed (the Phase 2 proof was from a HEAD snapshot plus Agent 2's edits).
- [ ] TODO `retireExhausted` (`apps/agent/agent/lib/tasks.ts:71-92`, `tasks.integration.spec.ts:194`) flaked once for Agent 2, passed for the manager and 6 of 6 alone. Unowned. If it fails again: capture EXPLAIN (ANALYZE) first; hypothesis is the IN-subquery with LIMIT and FOR UPDATE SKIP LOCKED being re-evaluated, fix would be a MATERIALIZED CTE.
- [ ] TODO Spike `@workflow/world-postgres` (Q3b).

Phase 3, dry run
- [ ] BLOCKED Access request to the manager before this phase: Render dashboard login in my own browser window, or a Render API key placed in the environment variable `RENDER_API_KEY` (never pasted in chat). Owner's account (Q6).
- [ ] TODO Deploy a throwaway client to the owner's Render account with a throwaway database; delete it afterwards (owner confirms the delete). Check `/health`, sign-in, agent tab, trigger each cron once.
- [ ] TODO Write down what differed from this plan; fix this document.

Phase 4, docs (my fence plus report)
- [x] DONE `docs/setup.md`: replace Vercel sections with Render ones, add "Deploy a new client" and "Verify a new client deploy".
- [x] DONE `docs/environment.md`: crons now Render, `AI_GATEWAY_API_KEY` needed everywhere, remove OIDC and Neon notes.
- [x] DONE (list in HANDOFF-dashboard-agent-2.md DONE) Report to manager the stale Vercel text in docs/api.md, docs/agent.md, READMEs, UI copy (section 1b/1c) for the owners of those files.

Phase 5, cleanup (only after Phase 3 DONE and manager says go)
- [ ] TODO Delete `apps/api/api/index.ts`, `build-func.mjs`, `apps/api/vercel.json`, `.vercelignore`, `.vercel` ignore lines. Drop `@vercel/blob` only if Q1 decides so.
- [ ] TODO Review `.github/workflows` (R10).
- [ ] TODO Add an updates note only if the template ever has end users; none today.

Needs from other owners
- app health route (app code), picture storage swap (db package), agent sandbox and `eve.ts` auth list (agent code), UI copy mentioning Vercel (Session 2).
