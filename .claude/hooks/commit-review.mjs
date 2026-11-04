// PreToolUse hook (Bash). Before any Claude session runs `git commit`, a fresh
// Opus reviewer adversarially reviews ONLY the staged changes.
//   - serious, confirmed problem  -> commit is denied, reasons go back to the session
//   - pass                        -> the owner gets the usual approve/deny prompt, with the review summary
//   - reviewer failed to run      -> the owner is asked, told the review did not run
// Commits the owner makes by hand never pass through Claude hooks, so they are never reviewed.
// Every review is logged to ~/.claude/plans/commit-reviews/ for the manager session.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

if (process.env.AIRTIGHT_COMMIT_REVIEWER === "1") process.exit(0); // the reviewer itself

let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;

let command = "", cwd = process.cwd();
try {
  const j = JSON.parse(input);
  command = j?.tool_input?.command ?? "";
  cwd = j?.cwd || cwd;
} catch { process.exit(0); }

// Match only real git invocations: drop here-document bodies and the contents of
// quoted strings first, so text that merely MENTIONS "git commit" (notes, echo,
// grep patterns, PowerShell here-strings) doesn't trigger a review.
const raw = command;
command = command
  .replace(/<<-?\s*['"]?(\w+)['"]?[^\n]*\n[\s\S]*?\n\s*\1\s*(?=\n|$)/g, "")
  .replace(/@'[\s\S]*?'@|@"[\s\S]*?"@/g, "")
  .replace(/"(?:[^"\\]|\\.)*"/g, '""')
  .replace(/'[^']*'/g, "''");

const G = String.raw`\bgit(?:\s+-[-\w=./\\:]+(?:\s+(?:"[^"]*"|'[^']*'|[^\s"'-][^\s]*))?)*\s+`;
if (!new RegExp(G + String.raw`commit\b`).test(command)) process.exit(0);

const out = (decision, reason) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse", permissionDecision: decision, permissionDecisionReason: reason } }));
  process.exit(0);
};

// The reviewer must see exactly what will be committed, so staging has to happen first.
const chainedAdd = new RegExp(G + String.raw`add\b`).test(command);
const commitAll = new RegExp(G + String.raw`commit\b[^;&|\n]*\s(?:-[a-zA-Z]*a[a-zA-Z]*\b|--all\b)`).test(command);
if (chainedAdd || commitAll) {
  out("deny", "Commit review: stage your files first in a separate command (git add <explicit paths>), then run git commit on its own, naming your files and without -a/--all:  git commit -m \"feat: x\" -- app/a.ts app/b.ts");
}

const git = (...args) => spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const top = git("rev-parse", "--show-toplevel");
if (top.status !== 0) process.exit(0); // not a repo; let git report it
const repo = top.stdout.trim();
const g = (...a) => spawnSync("git", a, { cwd: repo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).stdout || "";

// All sessions share ONE working tree and ONE git index, so a plain `git commit`
// takes whatever ANY session has staged. Require the committing session to name
// its files after `--`; git then commits only those paths (--only semantics) and
// the reviewer reviews exactly those.
// Drop -m/--message/-F values first (a multi-line or quoted message can contain
// newlines, "--" or ";"), then look for the "-- paths" list after `commit`.
const rawNoMsg = raw
  .replace(/\s(?:-m|--message)(?:=|\s+)(?:"(?:[^"\\]|\\.)*"|'[^']*'|\S+)/g, " ")
  .replace(/\s(?:-F|--file)(?:=|\s+)(?:"[^"]*"|'[^']*'|\S+)/g, " ")
  .replace(/\$\(cat\s+<<-?\s*['"]?(\w+)['"]?[\s\S]*?\n\s*\1\s*\)/g, "''");
const tail = rawNoMsg.match(/\bcommit\b[^;&|]*?\s--\s+([^;&|\n]+)/);
const paths = tail ? (tail[1].match(/"[^"]*"|'[^']*'|\S+/g) || []).map((p) => p.replace(/^["']|["']$/g, "")) : [];
if (!paths.length) {
  out("deny", 'Commit review: name the files you are committing, e.g.  git commit -m "feat: x" -- app/a.ts app/b.ts   (stage new files first with git add <path> in a separate command). All sessions share one git index, so a plain git commit would also commit other sessions\' staged files.');
}
const files = g("diff", "HEAD", "--name-status", "--", ...paths);
if (!files.trim()) process.exit(0); // nothing to commit for those paths; git will say so
const stat = g("diff", "HEAD", "--stat", "--", ...paths);
let diff = g("diff", "HEAD", "--no-color", "-U5", "--", ...paths);
const hash = createHash("sha256").update(files + diff).digest("hex").slice(0, 16);

const logDir = join(homedir(), ".claude", "plans", "commit-reviews");
mkdirSync(logDir, { recursive: true });
const passMarker = join(logDir, `pass-${hash}`);
if (existsSync(passMarker)) out("ask", `Opus commit review already PASSED for these exact staged changes (log: ${readFileSync(passMarker, "utf8").trim()}). Approve the commit?`);

const MAX = 350_000;
const truncated = diff.length > MAX;
if (truncated) diff = diff.slice(0, MAX) + "\n\n[DIFF TRUNCATED: read the remaining staged files from the working tree with your tools]";

const msgMatch = raw.match(/\s-m\s+(?:"([^"]*)"|'([^']*)')/);
const commitMsg = msgMatch ? (msgMatch[1] ?? msgMatch[2]) : "(message not given inline)";
let ledger = "";
try { ledger = readFileSync(join(homedir(), ".claude", "plans", "DASHBOARD-LEDGER.md"), "utf8"); } catch {}

const prompt = `You are an ADVERSARIAL code reviewer for the Dashboard Template (a reusable per-client business dashboard). A Claude build session is about to commit the staged changes below. Treat main as deploying to Render. Assume the author over-reported and missed things. You did not write this code and owe it nothing.

Your job: find REAL defects in the staged changes. Use Read/Grep/Glob on the repo to check callers, schemas and surrounding code; do not guess. Never read .env files.

BLOCK only for serious, confirmed problems:
1. A real bug that will break behavior, lose or corrupt data, or crash (with a concrete failure scenario).
2. A security hole: auth/permission bypass, injection, secrets or credentials in the diff, unsafe exposure of data.
3. Files staged that clearly belong to ANOTHER session's area in the ledger, or unrelated changes swept into a commit whose message describes something else (this has happened: other sessions' work got committed under wrong messages).
4. A destructive or irreversible DB change (dropping/renaming columns or tables with data, hard deletes the codebase forbids) with no safe path.

Everything else (style, naming, small improvements, uncertain suspicions) is MINOR: report it but do not block. Do not block on taste.

Commit message: ${commitMsg}

Agent ledger (who owns which files):
${ledger || "(ledger unavailable)"}

Staged files:
${files}
${stat}
Staged diff${truncated ? " (truncated)" : ""}:
${diff}

Finish with ONE final line of compact JSON and nothing after it:
{"verdict":"PASS"|"BLOCK","blocking":[{"file":"...","problem":"...","scenario":"..."}],"minor":[{"file":"...","note":"..."}]}`;

const started = new Date();
const r = spawnSync("claude", [
  "-p", "--model", "opus", "--output-format", "json",
  "--tools", "Read,Grep,Glob", "--no-session-persistence", "--strict-mcp-config",
], { cwd: repo, input: prompt, encoding: "utf8", timeout: 1_100_000, maxBuffer: 64 * 1024 * 1024,
     env: { ...process.env, AIRTIGHT_COMMIT_REVIEWER: "1" } });

const stamp = started.toISOString().replace(/[:.]/g, "-");
const logFile = join(logDir, `${stamp}-${hash}.md`);
let text = "";
try { text = JSON.parse(r.stdout || "{}").result || ""; } catch { text = r.stdout || ""; }

let verdict = null;
const lines = text.trim().split(/\r?\n/).reverse();
for (const l of lines) { const s = l.trim(); if (s.startsWith("{") && s.includes('"verdict"')) { try { verdict = JSON.parse(s); break; } catch {} } }

writeFileSync(logFile, `# Commit review ${started.toISOString()}\nRepo: ${repo}\nCommand: ${raw}\nCommit message: ${commitMsg}\nVerdict: ${verdict?.verdict ?? "REVIEW FAILED"}\n\n## Staged files\n${files}\n## Reviewer output\n${text || "(none)"}\n\n## stderr\n${(r.stderr || "").slice(0, 4000)}\n${r.error ? "spawn error: " + r.error.message : ""}\n`);

if (!verdict) out("ask", `Opus commit review DID NOT RUN or gave no verdict (${r.error?.message || "exit " + r.status}). Log: ${logFile}. Approve the commit anyway?`);

const minor = (verdict.minor || []).length;
if (verdict.verdict === "BLOCK" && (verdict.blocking || []).length) {
  const reasons = verdict.blocking.map((b, i) => `${i + 1}. ${b.file}: ${b.problem}${b.scenario ? " (scenario: " + b.scenario + ")" : ""}`).join("\n");
  out("deny", `Commit BLOCKED by the adversarial Opus review. Fix these, re-stage, and commit again (do not bypass this hook):\n${reasons}\n${minor ? minor + " minor note(s) also logged." : ""}\nFull review: ${logFile}`);
}
writeFileSync(passMarker, logFile);
out("ask", `Opus commit review PASSED${minor ? ` with ${minor} minor note(s)` : ""}. Log: ${logFile}. Approve the commit?`);
