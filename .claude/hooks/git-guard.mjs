// PreToolUse hook (Bash). Makes Claude ask the user before it commits, pushes,
// or creates/changes branches. Read-only git commands (status, diff, log,
// branch --show-current, checkout of an existing branch, ...) pass untouched.
//
// Why: an unrequested `git checkout -b` and an auto-push once moved work onto
// a stray branch. Anything that writes history or touches the remote now needs
// an explicit yes.
let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;

let command = "";
try {
  command = JSON.parse(input)?.tool_input?.command ?? "";
} catch {
  process.exit(0); // unreadable input: don't interfere
}

// `git` may be preceded by a chain (cd x && git ...) or have global flags
// (git -C path commit); match each shape on the whole command string.
const G = String.raw`\bgit(?:\s+-[-\w=./\\:]+(?:\s+(?:"[^"]*"|'[^']*'|[^\s"'-][^\s]*))?)*\s+`;
const rules = [
  { re: new RegExp(G + String.raw`commit\b`), what: "git commit" },
  { re: new RegExp(G + String.raw`push\b`), what: "git push" },
  { re: new RegExp(G + String.raw`(?:checkout|switch)\b[^;&|\n]*\s-[bBcC]\b`), what: "creating a branch" },
  // `git branch <name>` (create), or delete/rename/copy flags. Listing flags
  // (-a, -r, -v, --list, --show-current) are left alone.
  { re: new RegExp(G + String.raw`branch\s+(?:-[dDmMcC]\b|[^-\s;&|])`), what: "creating or changing a branch" },
];

const hit = rules.find((r) => r.re.test(command));
if (!hit) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: `Approval needed for ${hit.what}. Commits, pushes and new branches are only done when you say so.`,
    },
  }),
);
