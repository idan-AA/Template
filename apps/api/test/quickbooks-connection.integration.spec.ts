import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { createHash } from "node:crypto";
import { createMcpSecretBox } from "@app/auth/mcp-crypto";
import { db } from "@app/db";
import { WORKSPACE_ID } from "@app/db/workspace";
import { resetModules, useModules } from "@app/modules/testing";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import {
	QuickbooksCallbackError,
	QuickbooksConnectionService,
} from "../src/quickbooks/connection.service";
import { SECRET_PURPOSE } from "../src/quickbooks/quickbooks.constants";
import { QuickbooksAccess } from "../src/quickbooks/quickbooks-access";

/**
 * Connect, keep the token fresh, disconnect. Intuit is a fake `fetch`; the database
 * is real. Covers the parts that go wrong quietly: a replayed state, a rotated
 * refresh token that is not stored, two refreshes at once, and a dead token.
 */

const RUN = `qb-${Date.now().toString(36)}`;
const person = (name: string) => ({
	id: `${RUN}-${name}`,
	email: `${RUN}-${name}@quickbooks.test`,
	name,
});

const OWNER = person("owner");
const MEMBER = person("member");
const STRANGER = person("stranger");
const ALL = [OWNER, MEMBER, STRANGER];

const KEY = Buffer.alloc(32, 7).toString("base64");
const REALM = "9130000000000001";
const OTHER_REALM = "9130000000000002";

const service = new QuickbooksConnectionService(db, new QuickbooksAccess(db));

type Call = { url: string; body: string };

let calls: Call[] = [];
let tokenAnswers: Array<
	{ ok: true; access: string; refresh: string } | { ok: false; error: string }
> = [];
const realFetch = globalThis.fetch;
const savedEnv = { ...process.env };

function fakeFetch(): typeof fetch {
	return (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		calls.push({ url, body: String(init?.body ?? "") });

		if (url.includes("/tokens/bearer")) {
			const next = tokenAnswers.shift();

			if (!next) return json(500, { error: "unexpected" });
			if (!next.ok) return json(400, { error: next.error });

			return json(200, {
				access_token: next.access,
				refresh_token: next.refresh,
				expires_in: 3600,
			});
		}

		if (url.includes("/companyinfo/")) {
			return json(200, {
				CompanyInfo: { CompanyName: "Sandbox Company", Country: "US" },
			});
		}

		if (url.includes("/preferences")) {
			return json(200, {
				Preferences: { CurrencyPrefs: { HomeCurrency: { value: "USD" } } },
			});
		}

		if (url.includes("/revoke")) return json(200, {});

		return json(404, {});
	}) as typeof fetch;
}

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

const tokenCalls = () => calls.filter((call) => call.url.includes("/tokens/bearer"));

/** Starts a connect as `userId` and returns the raw state the address carries. */
async function startAs(userId: string): Promise<string> {
	const { url } = await service.startConnect(userId);
	const state = new URL(url).searchParams.get("state");
	if (!state) throw new Error("no state in the consent address");
	return state;
}

async function connectAs(userId: string, realmId = REALM) {
	tokenAnswers.push({ ok: true, access: "access-1", refresh: "refresh-1" });
	const state = await startAs(userId);
	await service.completeConnect({ userId, state, code: "the-code", realmId });
}

beforeAll(async () => {
	const at = new Date();

	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: at },
		update: {},
	});

	for (const who of ALL) {
		await db.user.create({
			data: {
				id: who.id,
				name: who.name,
				email: who.email,
				emailVerified: true,
				updatedAt: at,
			},
		});
	}

	await db.member.createMany({
		data: [
			{ who: OWNER, role: "owner" },
			{ who: MEMBER, role: "member" },
		].map(({ who, role }) => ({
			id: `${who.id}-m`,
			organizationId: WORKSPACE_ID,
			userId: who.id,
			role,
			createdAt: at,
		})),
	});
});

beforeEach(async () => {
	useModules(["crm", "quickbooks"]);
	process.env.QUICKBOOKS_CLIENT_ID = "client-id";
	process.env.QUICKBOOKS_CLIENT_SECRET = "client-secret";
	process.env.QUICKBOOKS_ENVIRONMENT = "sandbox";
	process.env.MCP_ENCRYPTION_KEY = KEY;
	calls = [];
	tokenAnswers = [];
	globalThis.fetch = fakeFetch();

	await db.quickbooksConnection.deleteMany();
	await db.quickbooksOauthState.deleteMany();
});

afterEach(() => {
	globalThis.fetch = realFetch;
	resetModules();
});

afterAll(async () => {
	process.env = savedEnv;
	await db.quickbooksConnection.deleteMany();
	await db.quickbooksOauthState.deleteMany();
	await db.user.deleteMany({ where: { id: { in: ALL.map((who) => who.id) } } });
});

describe("who may connect", () => {
	it("lets a member read the status but not connect", async () => {
		const status = await service.status(MEMBER.id);

		expect(status.canConnect).toBe(false);
		expect(status.redirectUri).toBeNull();

		await expect(service.startConnect(MEMBER.id)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
	});

	it("refuses someone who is not in the workspace", async () => {
		await expect(service.status(STRANGER.id)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
	});

	it("says plainly when the deploy has no Intuit keys", async () => {
		delete process.env.QUICKBOOKS_CLIENT_ID;

		expect((await service.status(OWNER.id)).configured).toBe(false);
		await expect(service.startConnect(OWNER.id)).rejects.toBeInstanceOf(
			ConflictException,
		);
	});
});

describe("connecting", () => {
	it("stores only the hash of the state, and the tokens encrypted", async () => {
		const state = await startAs(OWNER.id);

		const stored = await db.quickbooksOauthState.findUniqueOrThrow({
			where: { stateHash: createHash("sha256").update(state).digest("hex") },
		});
		expect(stored.stateHash).not.toBe(state);

		tokenAnswers.push({ ok: true, access: "access-1", refresh: "refresh-1" });
		await service.completeConnect({
			userId: OWNER.id,
			state,
			code: "the-code",
			realmId: REALM,
		});

		const row = await db.quickbooksConnection.findUniqueOrThrow({
			where: { id: "quickbooks" },
		});

		expect(row.status).toBe("CONNECTED");
		expect(row.companyName).toBe("Sandbox Company");
		expect(row.homeCurrency).toBe("USD");
		expect(row.encryptedAccessToken).not.toContain("access-1");
		expect(row.encryptedRefreshToken).not.toContain("refresh-1");

		const box = createMcpSecretBox(KEY);
		expect(
			box?.decrypt(row.encryptedRefreshToken ?? "", SECRET_PURPOSE.refresh),
		).toBe("refresh-1");

		// A token for one purpose cannot be read as the other.
		expect(() =>
			box?.decrypt(row.encryptedRefreshToken ?? "", SECRET_PURPOSE.access),
		).toThrow();

		expect(
			await db.auditEvent.findFirst({
				where: { action: "QUICKBOOKS_CONNECTED", actorId: OWNER.id },
			}),
		).not.toBeNull();
	});

	it("refuses a state used twice, one from another person, and an expired one", async () => {
		tokenAnswers.push({ ok: true, access: "a", refresh: "r" });
		const used = await startAs(OWNER.id);
		await service.completeConnect({
			userId: OWNER.id,
			state: used,
			code: "c",
			realmId: REALM,
		});

		await expect(
			service.completeConnect({
				userId: OWNER.id,
				state: used,
				code: "c",
				realmId: REALM,
			}),
		).rejects.toMatchObject({ reason: "invalid" });

		await db.quickbooksConnection.deleteMany();

		const mine = await startAs(OWNER.id);
		await expect(
			service.completeConnect({
				userId: MEMBER.id,
				state: mine,
				code: "c",
				realmId: REALM,
			}),
		).rejects.toBeInstanceOf(QuickbooksCallbackError);

		const old = await startAs(OWNER.id);
		await db.quickbooksOauthState.updateMany({
			where: { stateHash: createHash("sha256").update(old).digest("hex") },
			data: { expiresAt: new Date(Date.now() - 1000) },
		});
		await expect(
			service.completeConnect({
				userId: OWNER.id,
				state: old,
				code: "c",
				realmId: REALM,
			}),
		).rejects.toMatchObject({ reason: "expired" });

		await expect(
			service.completeConnect({
				userId: OWNER.id,
				state: "never-issued",
				code: "c",
				realmId: REALM,
			}),
		).rejects.toMatchObject({ reason: "invalid" });
	});

	it("refuses a second connect while connected, and a different company on reconnect", async () => {
		await connectAs(OWNER.id);

		await expect(service.startConnect(OWNER.id)).rejects.toBeInstanceOf(
			ConflictException,
		);

		// Force the dead-token state, then come back as another company.
		await db.quickbooksConnection.update({
			where: { id: "quickbooks" },
			data: { status: "NEEDS_RECONNECT" },
		});

		tokenAnswers.push({ ok: true, access: "a", refresh: "r" });
		const state = await startAs(OWNER.id);
		await expect(
			service.completeConnect({
				userId: OWNER.id,
				state,
				code: "c",
				realmId: OTHER_REALM,
			}),
		).rejects.toMatchObject({ reason: "different-company" });

		// The same company is fine.
		tokenAnswers.push({ ok: true, access: "a2", refresh: "r2" });
		const again = await startAs(OWNER.id);
		await service.completeConnect({
			userId: OWNER.id,
			state: again,
			code: "c",
			realmId: REALM,
		});

		expect(
			(await db.quickbooksConnection.findUniqueOrThrow({ where: { id: "quickbooks" } }))
				.status,
		).toBe("CONNECTED");
	});
});

describe("keeping the token fresh", () => {
	it("reuses a good access token without calling Intuit", async () => {
		await connectAs(OWNER.id);
		calls = [];

		const token = await service.getAccessToken();

		expect(token).toEqual({ accessToken: "access-1", realmId: REALM });
		expect(tokenCalls()).toHaveLength(0);
	});

	it("stores the NEW refresh token when it rotates, before handing out the new access token", async () => {
		await connectAs(OWNER.id);
		await db.quickbooksConnection.update({
			where: { id: "quickbooks" },
			data: { accessTokenExpiresAt: new Date(Date.now() + 60_000) },
		});
		calls = [];
		tokenAnswers.push({ ok: true, access: "access-2", refresh: "refresh-2" });

		const token = await service.getAccessToken();

		expect(token.accessToken).toBe("access-2");
		expect(tokenCalls()).toHaveLength(1);

		// The refresh request used the OLD refresh token.
		expect(tokenCalls().at(-1)?.body).toContain("refresh_token=refresh-1");

		const row = await db.quickbooksConnection.findUniqueOrThrow({
			where: { id: "quickbooks" },
		});
		const box = createMcpSecretBox(KEY);
		expect(
			box?.decrypt(row.encryptedRefreshToken ?? "", SECRET_PURPOSE.refresh),
		).toBe("refresh-2");
	});

	it("spends a refresh token once when two callers ask at the same time", async () => {
		await connectAs(OWNER.id);
		await db.quickbooksConnection.update({
			where: { id: "quickbooks" },
			data: { accessTokenExpiresAt: new Date(Date.now() + 1000) },
		});
		calls = [];
		tokenAnswers.push({ ok: true, access: "access-2", refresh: "refresh-2" });

		const [a, b] = await Promise.all([
			service.getAccessToken(),
			service.getAccessToken(),
		]);

		expect(a.accessToken).toBe("access-2");
		expect(b.accessToken).toBe("access-2");
		expect(tokenCalls()).toHaveLength(1);
	});

	it("marks the connection as needing a reconnect when Intuit refuses the refresh token", async () => {
		await connectAs(OWNER.id);
		await db.quickbooksConnection.update({
			where: { id: "quickbooks" },
			data: { accessTokenExpiresAt: new Date(Date.now() - 1000) },
		});
		tokenAnswers.push({ ok: false, error: "invalid_grant" });

		await expect(service.getAccessToken()).rejects.toBeInstanceOf(
			ConflictException,
		);

		const row = await db.quickbooksConnection.findUniqueOrThrow({
			where: { id: "quickbooks" },
		});

		expect(row.status).toBe("NEEDS_RECONNECT");
		expect(row.encryptedRefreshToken).toBeNull();
		expect(row.encryptedAccessToken).toBeNull();
		expect(row.lastError).toBe("QuickBooks needs to be connected again.");

		// It does not keep calling Intuit once it knows.
		calls = [];
		await expect(service.getAccessToken()).rejects.toBeInstanceOf(
			ConflictException,
		);
		expect(tokenCalls()).toHaveLength(0);

		expect(
			await db.auditEvent.findFirst({
				where: { action: "QUICKBOOKS_DISCONNECTED_BY_PROVIDER" },
			}),
		).not.toBeNull();
	});

	it("keeps the connection when Intuit is only unreachable", async () => {
		await connectAs(OWNER.id);
		await db.quickbooksConnection.update({
			where: { id: "quickbooks" },
			data: { accessTokenExpiresAt: new Date(Date.now() - 1000) },
		});
		globalThis.fetch = (async () => {
			throw new Error("network down");
		}) as typeof fetch;

		await expect(service.getAccessToken()).rejects.toThrow();

		expect(
			(await db.quickbooksConnection.findUniqueOrThrow({ where: { id: "quickbooks" } }))
				.status,
		).toBe("CONNECTED");
	});
});

describe("disconnecting", () => {
	it("tells Intuit, drops the tokens, keeps the row, and allows a different company next", async () => {
		await connectAs(OWNER.id);
		calls = [];

		const result = await service.disconnect(OWNER.id);

		expect(result.revokedAtIntuit).toBe(true);
		expect(calls.some((call) => call.url.includes("/revoke"))).toBe(true);

		const row = await db.quickbooksConnection.findUniqueOrThrow({
			where: { id: "quickbooks" },
		});
		expect(row.status).toBe("DISCONNECTED");
		expect(row.encryptedRefreshToken).toBeNull();
		expect(row.encryptedAccessToken).toBeNull();

		await connectAs(OWNER.id, OTHER_REALM);
		expect(
			(await db.quickbooksConnection.findUniqueOrThrow({ where: { id: "quickbooks" } }))
				.realmId,
		).toBe(OTHER_REALM);
	});

	it("still disconnects here when Intuit cannot be told, and says so", async () => {
		await connectAs(OWNER.id);
		globalThis.fetch = (async () => {
			throw new Error("network down");
		}) as typeof fetch;

		const result = await service.disconnect(OWNER.id);

		expect(result.revokedAtIntuit).toBe(false);
		expect(
			(await db.quickbooksConnection.findUniqueOrThrow({ where: { id: "quickbooks" } }))
				.status,
		).toBe("DISCONNECTED");
	});

	it("does not let a member disconnect", async () => {
		await connectAs(OWNER.id);

		await expect(service.disconnect(MEMBER.id)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
	});
});
