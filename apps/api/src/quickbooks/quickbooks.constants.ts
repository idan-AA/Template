/**
 * Everything about Intuit's side that the connector depends on, in one place so
 * the round that verifies it against Intuit's current docs (docs/plan/quickbooks-
 * connector.md, R0) edits one file. Values marked UNCONFIRMED came from memory or
 * search results, not from a page read during planning.
 */

/** UNCONFIRMED: the authorization (consent) page. */
export const INTUIT_AUTHORIZE_URL = "https://appcenter.intuit.com/connect/oauth2";

/** UNCONFIRMED: exchanges a code for tokens, and a refresh token for new ones. */
export const INTUIT_TOKEN_URL =
	"https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

/** UNCONFIRMED: revokes a refresh token (and so the whole connection). */
export const INTUIT_REVOKE_URL =
	"https://developer.api.intuit.com/v2/oauth2/tokens/revoke";

/** UNCONFIRMED: the accounting API hosts. Sandbox keys only work on the sandbox host. */
export const INTUIT_API_HOST = {
	sandbox: "https://sandbox-quickbooks.api.intuit.com",
	production: "https://quickbooks.api.intuit.com",
} as const;

export type QuickbooksEnvironment = keyof typeof INTUIT_API_HOST;

export const QUICKBOOKS_SCOPE = "com.intuit.quickbooks.accounting";

/**
 * Sent on every API call. Intuit retired minor versions 1 to 74 on 2025-08-01 and
 * serves 75 behaviour to any lower value (per Intuit's announcement as quoted by
 * third parties). Re-check the minimum in R0 and raise this deliberately.
 */
export const INTUIT_MINOR_VERSION = 75;

/** A connect attempt must finish within this long, or its state is refused. */
export const OAUTH_STATE_TTL_MS = 10 * 60_000;

/** Refresh the access token when it has less than this left (it lasts about an hour). */
export const REFRESH_WINDOW_MS = 5 * 60_000;

/** Every call to Intuit gives up after this long (Intuit itself times out at 120 s). */
export const INTUIT_TIMEOUT_MS = 30_000;

/** The row id of the single connection. */
export const CONNECTION_ID = "quickbooks";

/** Purposes bound into each encrypted value, so one cannot be swapped for another. */
export const SECRET_PURPOSE = {
	access: "quickbooks:access-token",
	refresh: "quickbooks:refresh-token",
} as const;

export type ConnectionStatus = "CONNECTED" | "NEEDS_RECONNECT" | "DISCONNECTED";
