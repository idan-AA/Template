// PreToolUse hook (Bash/PowerShell). Before any Claude session runs `git push`, a fresh
// Opus reviewer adversarially reviews and statically tests EVERY commit about to be
// pushed (upstream..HEAD), the way the commit review does for staged changes.
//   - serious, confirmed problem  -> push is denied, reasons go back to the session
//   - pass                        -> push goes ahead, with the review summary shown
//   - reviewer failed to run      -> the owner is asked, told the review did not run
// "Test" here means static: owner rule 2026-11-06 is that nothing runs locally (no bun,
// no dev server), and there is no GitHub Actions. The Render build is the only compiler,
// so this reviewer must catch by reading what a type check, lint or test would catch.
// Every review is logged to ~/.claude/plans/push-reviews/ for the manager session.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

if (process.env.AIRTIGHT_PUSH_REVIEWER === "1") process.exit(0); // the reviewer itself

let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;

let command = "", cwd = process.cwd();
try {
  const j = JSON.parse(input);
  command = j?.tool_input?.command ?? "";
  cwd = j?.cwd || cwd;
} catch { process.exit(0); }

// Match only real git invocations: drop here-document bodies and quoted strings first,
// so text that merely MENTIONS "git push" (notes, echo, grep patterns) does not trigger.
const raw = command;
command = command
  .replace(/<<-?\s*['"]?(\w+)['"]?[^\n]*\n[\s\S]*?\n\s*\1\s*(?=\n|$)/g, "")
  .replace(/@'[\s\S]*?'@|@"[\s\S]*?"@/g, "")
  .replace(/"(?:[^"\\]|\\.)*"/g, '""')
  .replace(/'[^']*'/g, "''");

const G = String.raw`\bgit(?:\s+-[-\w=./\\:]+(?:\s+(?:"[^"]*"|'[^']*'|[^\s"'-][^\s]*))?)*\s+`;
if (!new RegExp(G + String.raw`push\b`).test(command)) process.exit(0);
if (/\bpush\b[^;&|\n]*\s(?:--dry-run|-n)\b/.test(command)) process.exit(0);
if (/\bpush\b[^;&|\n]*\s--delete\b/.test(command)) process.exit(0);

const out = (decision, reason) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse", permissionDecision: decision, permissionDecisionReason: reason } }));
  process.exit(0);
};

const top = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" });
if (top.status !== 0) process.exit(0); // not a repo; let git report it
const repo = top.stdout.trim();
const g = (...a) => spawnSync("git", a, { cwd: repo, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });

// What will be pushed: everything on HEAD that the remote-tracking branch does not have.
const branch = g("rev-parse", "--abbrev-ref", "HEAD").stdout.trim();
// PUSH_REVIEW_BASE: manual run only (review commits that are already pushed).
let base = process.env.PUSH_REVIEW_BASE
  ? g("rev-parse", "--verify", "--quiet", process.env.PUSH_REVIEW_BASE).stdout.trim()
  : g("rev-parse", "--verify", "--quiet", "@{u}").stdout.trim();
if (!base) base = g("rev-parse", "--verify", "--quiet", `origin/${branch}`).stdout.trim();
if (!base) base = g("rev-parse", "--verify", "--quiet", "origin/main").stdout.trim();
if (!base) out("ask", "Push review could not find the remote branch to compare with, so it did not run. Approve the push anyway?");

const head = g("rev-parse", "HEAD").stdout.trim();
const commits = g("log", "--oneline", `${base}..HEAD`).stdout.trim();
if (!commits) process.exit(0); // nothing new to push

const logDir = join(homedir(), ".claude", "plans", "push-reviews");
mkdirSync(logDir, { recursive: true });
const passMarker = join(logDir, `pass-${base.slice(0, 12)}-${head.slice(0, 12)}`);
if (existsSync(passMarker)) out("allow", `Push review already PASSED for exactly these commits (log: ${readFileSync(passMarker, "utf8").trim()}).`);

const files = g("diff", "--name-status", `${base}...HEAD`).stdout;
const stat = g("diff", "--stat", `${base}...HEAD`).stdout;
let diff = g("diff", "--no-color", "-U5", `${base}...HEAD`).stdout;
const MAX = 350_000;
const truncated = diff.length > MAX;
if (truncated) diff = diff.slice(0, MAX) + "\n\n[DIFF TRUNCATED: read the remaining changed files from the working tree with your tools; every file in the list above must still be checked]";

let ledger = "";
try { ledger = readFileSync(join(homedir(), ".claude", "plans", "DASHBOARD-LEDGER.md"), "utf8"); } catch {}

const prompt = `You are an ADVERSARIAL pre-push reviewer AND tester for the Dashboard Template (a reusable per-client business dashboard: Bun monorepo, Next.js app in apps/app, NestJS + nestjs-trpc API in apps/api, Prisma in packages/db, modules in packages/modules). A Claude session is about to push the commits below to ${branch}. A push to main is what the owner deploys to Render.

IMPORTANT CONTEXT: nothing is ever compiled, linted or tested on this machine (owner rule), and there is no GitHub Actions. The Render build (web: next build, which type-checks; API: bun build, which does NOT type-check) is the only compiler. So YOU are the type check, the lint and the test run. Assume the author never compiled anything and over-reported. You did not write this code and owe it nothing.

Use Read/Grep/Glob on the repo; do not guess. Never read .env files. Check, for every changed file:
0. COMPILER SETTINGS FIRST: for each workspace a changed file belongs to, read its tsconfig and every tsconfig it extends (target, lib, strict, noUncheckedIndexedAccess, jsx). Then check the changed code's SYNTAX against that target: e.g. BigInt literals like 0n need target ES2020 or later (apps/app targets ES2017: a 0n there FAILS next build with TS2737; this exact miss already broke one deploy). Do the same for other target-gated syntax.
1. TYPES AND IMPORTS: every import resolves (file exists, the named export exists, package is a dependency of that workspace), every function is called with the right arguments, every property accessed exists on its type, async/await is consistent, no implicit any where the tsconfig is strict. Check callers of anything whose signature changed.
2. tRPC: every trpc.<router>.<procedure> the web calls exists as a @Router alias + @Query/@Mutation in apps/api with matching input/output contracts. apps/api/src/generated/server.ts must NOT be hand-edited (the build regenerates it).
3. Next.js App Router: page.tsx/layout.tsx export only allowed names (default, metadata, generateMetadata, dynamic and other route segment config); "use client" files do not import server-only code; server-only code does not run in client components.
4. Prisma: schema changes have a matching migration (and vice versa); migrations are additive or have a safe path; the column/table names in raw SQL match @@map/@map.
5. Tests: tests the change should break are updated; new tests actually exercise the code; mentally run the changed tests and report any that would fail.
6. Runtime: a real bug that breaks behavior, loses or corrupts data, or crashes, with a concrete scenario. Money must never become a JS number.
7. Security: auth or permission bypass (permissions are enforced in middleware AND service; UI only hides), injection, secrets in the diff, unsafe data exposure.
8. Build blockers: merge-conflict markers, a dependency added to a package.json without bun.lock (the build installs with --frozen-lockfile), syntax errors.

BLOCK only for serious, confirmed problems in the categories above, especially anything that would FAIL THE RENDER BUILD or a test. Style, naming, formatting and small improvements are MINOR: report, do not block.

Agent ledger (who owns which files):
${ledger || "(ledger unavailable)"}

Commits to push (${base.slice(0, 7)}..${head.slice(0, 7)}):
${commits}

Changed files:
${files}
${stat}
Diff${truncated ? " (truncated)" : ""}:
${diff}

Finish with ONE final line of compact JSON and nothing after it:
{"verdict":"PASS"|"BLOCK","blocking":[{"file":"...","problem":"...","scenario":"..."}],"minor":[{"file":"...","note":"..."}]}`;

const started = new Date();
const r = spawnSync("claude", [
  "-p", "--model", "opus", "--output-format", "json",
  "--tools", "Read,Grep,Glob", "--no-session-persistence", "--strict-mcp-config",
], { cwd: repo, input: prompt, encoding: "utf8", timeout: 1_700_000, maxBuffer: 128 * 1024 * 1024,
     env: { ...process.env, AIRTIGHT_PUSH_REVIEWER: "1", AIRTIGHT_COMMIT_REVIEWER: "1" } });

const stamp = started.toISOString().replace(/[:.]/g, "-");
const logFile = join(logDir, `${stamp}-${head.slice(0, 12)}.md`);
let text = "";
try { text = JSON.parse(r.stdout || "{}").result || ""; } catch { text = r.stdout || ""; }

let verdict = null;
for (const l of text.trim().split(/\r?\n/).reverse()) {
  const s = l.trim();
  if (s.startsWith("{") && s.includes('"verdict"')) { try { verdict = JSON.parse(s); break; } catch {} }
}

writeFileSync(logFile, `# Push review ${started.toISOString()}\nRepo: ${repo}\nBranch: ${branch}\nRange: ${base}..${head}\nCommand: ${raw}\nVerdict: ${verdict?.verdict ?? "REVIEW FAILED"}\n\n## Commits\n${commits}\n\n## Changed files\n${files}\n## Reviewer output\n${text || "(none)"}\n\n## stderr\n${(r.stderr || "").slice(0, 4000)}\n${r.error ? "spawn error: " + r.error.message : ""}\n`);

if (!verdict) out("ask", `Opus push review DID NOT RUN or gave no verdict (${r.error?.message || "exit " + r.status}). Log: ${logFile}. Approve the push anyway?`);

const minor = (verdict.minor || []).length;
if (verdict.verdict === "BLOCK" && (verdict.blocking || []).length) {
  const reasons = verdict.blocking.map((b, i) => `${i + 1}. ${b.file}: ${b.problem}${b.scenario ? " (scenario: " + b.scenario + ")" : ""}`).join("\n");
  out("deny", `Push BLOCKED by the adversarial Opus review. Fix these in a new commit and push again (do not bypass this hook):\n${reasons}\n${minor ? minor + " minor note(s) also logged." : ""}\nFull review: ${logFile}`);
}
writeFileSync(passMarker, logFile);
out("allow", `Opus push review PASSED${minor ? ` with ${minor} minor note(s)` : ""}. Log: ${logFile}.`);
