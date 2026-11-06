import { afterEach, describe, expect, it } from "bun:test";
import {
	authorizeUrl,
	IntuitError,
	readCompany,
	refreshTokens,
	revokeToken,
} from "../src/quickbooks/intuit.client";

const credentials = {
	clientId: "the-client",
	clientSecret: "the-secret",
	environment: "sandbox" as const,
};

const realFetch = globalThis.fetch;

function answer(status: number, body: unknown) {
	globalThis.fetch = (async () =>
		new Response(JSON.stringify(body), {
			status,
			headers: { "content-type": "application/json" },
		})) as typeof fetch;
}

afterEach(() => {
	globalThis.fetch = realFetch;
});

describe("the consent address", () => {
	it("carries the client, the scope, the redirect and the state, and no secret", () => {
		const url = new URL(
			authorizeUrl(credentials, "https://api.example.test/api/quickbooks/callback", "s-1"),
		);

		expect(url.searchParams.get("client_id")).toBe("the-client");
		expect(url.searchParams.get("scope")).toBe("com.intuit.quickbooks.accounting");
		expect(url.searchParams.get("response_type")).toBe("code");
		expect(url.searchParams.get("state")).toBe("s-1");
		expect(url.searchParams.get("redirect_uri")).toBe(
			"https://api.example.test/api/quickbooks/callback",
		);
		expect(url.toString()).not.toContain("the-secret");
	});
});

describe("what Intuit's answers mean", () => {
	async function kindOf(run: () => Promise<unknown>) {
		try {
			await run();
		} catch (error) {
			return error instanceof IntuitError ? error.kind : "other";
		}
		return "none";
	}

	it("reads a token answer", async () => {
		answer(200, { access_token: "a", refresh_token: "r", expires_in: 3600 });

		expect(await refreshTokens(credentials, "old")).toEqual({
			accessToken: "a",
			refreshToken: "r",
			expiresInSeconds: 3600,
		});
	});

	it("calls a refused refresh token invalid-grant, so the person is asked to connect again", async () => {
		answer(400, { error: "invalid_grant" });
		expect(await kindOf(() => refreshTokens(credentials, "old"))).toBe("invalid-grant");
	});

	it("tells throttling, outages and a refused access token apart", async () => {
		answer(429, {});
		expect(await kindOf(() => readCompany("sandbox", "123", "t"))).toBe("throttled");

		answer(503, {});
		expect(await kindOf(() => readCompany("sandbox", "123", "t"))).toBe("unavailable");

		answer(401, {});
		expect(await kindOf(() => readCompany("sandbox", "123", "t"))).toBe("unauthorized");

		globalThis.fetch = (async () => {
			throw new Error("offline");
		}) as typeof fetch;
		expect(await kindOf(() => readCompany("sandbox", "123", "t"))).toBe("unavailable");
	});

	it("rejects a token answer it cannot read, without echoing it", async () => {
		answer(200, { nope: true });

		const error = await refreshTokens(credentials, "old").catch((e) => e);

		expect(error).toBeInstanceOf(IntuitError);
		expect((error as IntuitError).message).not.toContain("nope");
	});

	it("never puts a token in an error message", async () => {
		answer(400, { error: "invalid_grant", error_description: "refresh-secret-123" });

		const error = await refreshTokens(credentials, "refresh-secret-123").catch((e) => e);

		expect((error as IntuitError).message).not.toContain("refresh-secret-123");
	});

	it("reports a failed revoke instead of throwing", async () => {
		answer(500, {});
		expect(await revokeToken(credentials, "t")).toBe(false);

		globalThis.fetch = (async () => {
			throw new Error("offline");
		}) as typeof fetch;
		expect(await revokeToken(credentials, "t")).toBe(false);
	});
});

describe("reading the company", () => {
	it("returns the name, country and currency, and still works when currency cannot be read", async () => {
		let call = 0;
		globalThis.fetch = (async () => {
			call += 1;

			return call === 1
				? new Response(
						JSON.stringify({
							CompanyInfo: { CompanyName: "  Acme  ", Country: "US" },
						}),
						{ status: 200 },
					)
				: new Response("{}", { status: 500 });
		}) as typeof fetch;

		expect(await readCompany("sandbox", "123", "t")).toEqual({
			companyName: "Acme",
			country: "US",
			homeCurrency: null,
		});
	});
});
