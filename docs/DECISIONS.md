# Decisions

Newest first. Owner's words where possible.

## 2026-11-04

- **This is the owner's template.** "I can basically copy and paste this and use
  this for any business... bookkeeping, boom deploy bookkeeping... a hair salon,
  boom, hair salon." One codebase, one deploy and one database per client,
  modules switched on per client.
- **Build off the crm code** (trycompai/crm v1.16.0, MIT), and "take all of the
  things that are good in the other two repositories and transfer them over".
  relaticle is AGPL-3.0: ideas and designs only, no code. next-shadcn-dashboard-starter
  is MIT: code may be reused.
- **AGENTS.md removed; the repo is the owner's now.** The toolkit CLAUDE.md
  replaces it. Useful crm rules were carried into CLAUDE.md Part 1.
- **Licence:** MIT only asks that the original copyright notice stays in the
  copy. Keep `LICENSE` (add the owner's copyright line above the crm one). It is
  never shown to clients and costs nothing.
- **Hosting: Render.** Convert from Vercel.
- **Git:** the owner sets up git and the remote. The toolkit `.claude` folder
  (hooks, commands, skills, settings) lives in this repo so sessions started here
  load the hooks.
