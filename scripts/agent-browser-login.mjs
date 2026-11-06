#!/usr/bin/env node
// Signs the AGENTS' browser in to a deployed site, without the agent ever seeing the password.
//
//   node scripts/agent-browser-login.mjs [siteUrl]
//
// - Reads PRACTICE_QA_EMAIL and PRACTICE_QA_PASSWORD from the repo-root .env (agents are not
//   allowed to read .env; this script reads it and never prints a value).
// - Makes sure the shared "agent Chrome" is running: a separate Chrome with its own profile
//   (never the owner's) and remote debugging on 127.0.0.1:9333, which the chrome-devtools MCP
//   attaches to (--browserUrl http://127.0.0.1:9333).
// - Signs in through the app's own sign-in endpoint and puts the session cookies into that
//   Chrome. Prints only "signed in" or a reason it could not.
// Use a dedicated QA member, never the owner's own login.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = (process.argv[2] || "https://practice-app-af4x.onrender.com").replace(/\/+$/, "");
const PORT = 9333;
const DEBUG = `http://127.0.0.1:${PORT}`;
const PROFILE = join(process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local"), "claude-agent-chrome");
const CHROME_CANDIDATES = [
	join(process.env["ProgramFiles"] || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
	join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
	join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
];

const fail = (msg) => { console.error(`agent-browser-login: ${msg}`); process.exit(1); };

// 1. Credentials from .env, never printed.
const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
if (!existsSync(envPath)) fail("no .env at the repo root");
const env = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
	const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
	if (!m) continue;
	let v = m[2];
	if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
	env[m[1]] = v;
}
const email = env.PRACTICE_QA_EMAIL;
const password = env.PRACTICE_QA_PASSWORD;
if (!email || !password) fail("PRACTICE_QA_EMAIL and PRACTICE_QA_PASSWORD must both be set in .env");

// 2. The agent Chrome: start it if it is not answering.
const version = async () => {
	try { const r = await fetch(`${DEBUG}/json/version`); return r.ok ? await r.json() : null; } catch { return null; }
};
let info = await version();
if (!info) {
	const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
	if (!chrome) fail("Chrome not found");
	mkdirSync(PROFILE, { recursive: true });
	spawn(chrome, [
		`--remote-debugging-port=${PORT}`, "--remote-debugging-address=127.0.0.1",
		`--user-data-dir=${PROFILE}`, "--no-first-run", "--no-default-browser-check",
		"--new-window", "about:blank",
	], { detached: true, stdio: "ignore" }).unref();
	for (let i = 0; i < 50 && !info; i++) { await new Promise((r) => setTimeout(r, 200)); info = await version(); }
	if (!info) fail(`agent Chrome did not start on port ${PORT}`);
}

// 3. Sign in through the app (it proxies /api/* to the API, same origin).
const res = await fetch(`${SITE}/api/auth/sign-in/email`, {
	method: "POST",
	headers: { "content-type": "application/json", origin: SITE },
	body: JSON.stringify({ email, password }),
	redirect: "manual",
});
const setCookies = res.headers.getSetCookie?.() ?? [];
if (!res.ok || !setCookies.length) {
	fail(`sign-in refused (HTTP ${res.status}). Check the QA member exists on ${SITE} and the .env values are right.`);
}

const host = new URL(SITE).hostname;
const cookies = setCookies.map((sc) => {
	const [pair, ...attrs] = sc.split(";").map((s) => s.trim());
	const eq = pair.indexOf("=");
	const c = { name: pair.slice(0, eq), value: pair.slice(eq + 1), domain: host, path: "/", secure: false, httpOnly: false };
	for (const a of attrs) {
		const [k, ...rest] = a.split("=");
		const key = k.toLowerCase(); const val = rest.join("=");
		if (key === "path") c.path = val || "/";
		else if (key === "domain" && val) c.domain = val;
		else if (key === "secure") c.secure = true;
		else if (key === "httponly") c.httpOnly = true;
		else if (key === "samesite") c.sameSite = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
		else if (key === "max-age" && Number(val)) c.expires = Math.floor(Date.now() / 1000) + Number(val);
		else if (key === "expires" && !c.expires) { const t = Date.parse(val); if (!Number.isNaN(t)) c.expires = Math.floor(t / 1000); }
	}
	return c;
});

// 4. Put the session into the agent Chrome over the DevTools protocol.
await new Promise((resolve, reject) => {
	const ws = new WebSocket(info.webSocketDebuggerUrl);
	const timer = setTimeout(() => { ws.close(); reject(new Error("DevTools timeout")); }, 10000);
	ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: "Storage.setCookies", params: { cookies } }));
	ws.onmessage = (ev) => {
		const msg = JSON.parse(String(ev.data));
		if (msg.id !== 1) return;
		clearTimeout(timer); ws.close();
		msg.error ? reject(new Error(msg.error.message)) : resolve();
	};
	ws.onerror = () => { clearTimeout(timer); reject(new Error("could not reach the agent Chrome")); };
}).catch((e) => fail(e.message));

// 5. Prove the session works.
const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
const check = await fetch(`${SITE}/api/auth/get-session`, { headers: { cookie: cookieHeader, origin: SITE } });
const session = check.ok ? await check.json().catch(() => null) : null;
if (!session?.user) fail("signed in, but the session did not verify");
console.log(`signed in to ${SITE} in the agent Chrome (DevTools ${DEBUG}). Open it with the chrome-devtools tools; use new_page, never another agent's tab.`);
