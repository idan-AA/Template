import {
	INTUIT_API_HOST,
	INTUIT_AUTHORIZE_URL,
	INTUIT_MINOR_VERSION,
	INTUIT_REVOKE_URL,
	INTUIT_TIMEOUT_MS,
	INTUIT_TOKEN_URL,
	QUICKBOOKS_SCOPE,
	type QuickbooksEnvironment,
} from "./quickbooks.constants";

/**
 * The only file that talks to Intuit over the network. It returns plain data and
 * throws `IntuitError`, whose `kind` tells the caller what to do:
 *   - "invalid-grant": the refresh token or code is no longer good. The person must
 *     connect again. Never retry.
 *   - "unauthorized": the access token was refused (HTTP 401).
 *   - "throttled": HTTP 429. Wait about a minute.
 *   - "unavailable": a network failure, a timeout or a 5xx. Safe to try again later.
 *   - "rejected": any other refusal; the message is safe to show.
 * Tokens and secrets never appear in an error message or a log line.
 */

export type IntuitErrorKind =
	| "invalid-grant"
	| "unauthorized"
	| "throttled"
	| "unavailable"
	| "rejected";

export class IntuitError extends Error {
	constructor(
		readonly kind: IntuitErrorKind,
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "IntuitError";
	}
}

export type QuickbooksCredentials = {
	clientId: string;
	clientSecret: string;
	environment: QuickbooksEnvironment;
};

export type IntuitTokens = {
	accessToken: string;
	refreshToken: string;
	/** Seconds until the access token stops working (about 3600). */
	expiresInSeconds: number;
};

function basicAuth({ clientId, clientSecret }: QuickbooksCredentials): string {
	return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function send(url: string, init: RequestInit): Promise<Response> {
	try {
		return await fetch(url, {
			...init,
			signal: AbortSignal.timeout(INTUIT_TIMEOUT_MS),
		});
	} catch {
		throw new IntuitError("unavailable", "QuickBooks could not be reached.");
	}
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
	try {
		const body: unknown = await response.json();
		return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
	} catch {
		return {};
	}
}

function failure(response: Response, body: Record<string, unknown>): IntuitError {
	if (response.status === 429) {
		return new IntuitError(
			"throttled",
			"QuickBooks asked us to slow down. Try again in a minute.",
			429,
		);
	}

	if (response.status >= 500) {
		return new IntuitError(
			"unavailable",
			"QuickBooks is not responding right now.",
			response.status,
		);
	}

	if (response.status === 401) {
		return new IntuitError(
			"unauthorized",
			"QuickBooks refused the connection.",
			401,
		);
	}

	if (body.error === "invalid_grant") {
		return new IntuitError(
			"invalid-grant",
			"The QuickBooks connection has expired or was removed.",
			response.status,
		);
	}

	return new IntuitError(
		"rejected",
		"QuickBooks did not accept the request.",
		response.status,
	);
}

/** The consent page address. `state` is the raw single-use value we keep only a hash of. */
export function authorizeUrl(
	credentials: QuickbooksCredentials,
	redirectUri: string,
	state: string,
): string {
	const url = new URL(INTUIT_AUTHORIZE_URL);
	url.search = new URLSearchParams({
		client_id: credentials.clientId,
		scope: QUICKBOOKS_SCOPE,
		redirect_uri: redirectUri,
		response_type: "code",
		state,
	}).toString();

	return url.toString();
}

async function tokenRequest(
	credentials: QuickbooksCredentials,
	form: Record<string, string>,
): Promise<IntuitTokens> {
	const response = await send(INTUIT_TOKEN_URL, {
		method: "POST",
		headers: {
			accept: "application/json",
			authorization: basicAuth(credentials),
			"content-type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams(form).toString(),
	});

	const body = await readJson(response);

	if (!response.ok) throw failure(response, body);

	const accessToken = body.access_token;
	const refreshToken = body.refresh_token;
	const expiresIn = body.expires_in;

	if (
		typeof accessToken !== "string" ||
		typeof refreshToken !== "string" ||
		typeof expiresIn !== "number"
	) {
		throw new IntuitError(
			"rejected",
			"QuickBooks sent an answer we could not read.",
			response.status,
		);
	}

	return { accessToken, refreshToken, expiresInSeconds: expiresIn };
}

export function exchangeCode(
	credentials: QuickbooksCredentials,
	code: string,
	redirectUri: string,
): Promise<IntuitTokens> {
	return tokenRequest(credentials, {
		grant_type: "authorization_code",
		code,
		redirect_uri: redirectUri,
	});
}

/** Intuit rotates the refresh token: the caller MUST store the new one from the answer. */
export function refreshTokens(
	credentials: QuickbooksCredentials,
	refreshToken: string,
): Promise<IntuitTokens> {
	return tokenRequest(credentials, {
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	});
}

/** True when Intuit accepted the revoke. A failure is reported, never thrown, so disconnect always completes here. */
export async function revokeToken(
	credentials: QuickbooksCredentials,
	token: string,
): Promise<boolean> {
	try {
		const response = await send(INTUIT_REVOKE_URL, {
			method: "POST",
			headers: {
				accept: "application/json",
				authorization: basicAuth(credentials),
				"content-type": "application/json",
			},
			body: JSON.stringify({ token }),
		});

		return response.ok;
	} catch {
		return false;
	}
}

export type CompanyDetails = {
	companyName: string | null;
	country: string | null;
	homeCurrency: string | null;
};

/** GET one path under /v3/company/{realm}/ and return the parsed body. */
async function apiGet(
	environment: QuickbooksEnvironment,
	realmId: string,
	accessToken: string,
	path: string,
): Promise<Record<string, unknown>> {
	const url = new URL(
		`/v3/company/${encodeURIComponent(realmId)}/${path}`,
		INTUIT_API_HOST[environment],
	);
	url.searchParams.set("minorversion", String(INTUIT_MINOR_VERSION));

	const response = await send(url.toString(), {
		method: "GET",
		headers: { accept: "application/json", authorization: `Bearer ${accessToken}` },
	});

	const body = await readJson(response);

	if (!response.ok) throw failure(response, body);

	return body;
}

function text(value: unknown): string | null {
	return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/**
 * The company's name, country and own currency. The name call decides whether the
 * connection works; the currency call is best effort (null when it fails), because
 * a connection should not be refused over a nicety.
 */
export async function readCompany(
	environment: QuickbooksEnvironment,
	realmId: string,
	accessToken: string,
): Promise<CompanyDetails> {
	const info = await apiGet(
		environment,
		realmId,
		accessToken,
		`companyinfo/${encodeURIComponent(realmId)}`,
	);

	const company = (info.CompanyInfo ?? {}) as Record<string, unknown>;

	let homeCurrency: string | null = null;

	try {
		const preferences = await apiGet(
			environment,
			realmId,
			accessToken,
			"preferences",
		);
		const prefs = (preferences.Preferences ?? {}) as Record<string, unknown>;
		const currencyPrefs = (prefs.CurrencyPrefs ?? {}) as Record<string, unknown>;
		const home = (currencyPrefs.HomeCurrency ?? {}) as Record<string, unknown>;
		homeCurrency = text(home.value);
	} catch (error) {
		if (error instanceof IntuitError && error.kind === "unauthorized") throw error;
	}

	return {
		companyName: text(company.CompanyName) ?? text(company.LegalName),
		country: text(company.Country),
		homeCurrency,
	};
}
