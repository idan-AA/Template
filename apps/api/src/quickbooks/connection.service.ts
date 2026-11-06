import { createHash, randomBytes } from "node:crypto";
import { appUrl } from "@app/auth/env";
import { createMcpSecretBox, type McpSecretBox } from "@app/auth/mcp-crypto";
import type { Db, Prisma } from "@app/db";
import { writeAudit } from "@app/db/audit";
import { WORKSPACE_ID } from "@app/db/workspace";
import {
	ConflictException,
	Injectable,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { getRequestContext } from "../logging/request-context";
import {
	authorizeUrl,
	exchangeCode,
	IntuitError,
	type QuickbooksCredentials,
	readCompany,
	refreshTokens,
	revokeToken,
} from "./intuit.client";
import {
	CONNECTION_ID,
	type ConnectionStatus,
	OAUTH_STATE_TTL_MS,
	REFRESH_WINDOW_MS,
	SECRET_PURPOSE,
} from "./quickbooks.constants";
import type { QuickbooksStatus } from "./quickbooks.contracts";
import { QuickbooksAccess } from "./quickbooks-access";

/** Why a connect attempt did not finish. The code goes in the redirect; the settings page words it. */
export type CallbackFailure =
	| "denied"
	| "invalid"
	| "expired"
	| "different-company"
	| "not-configured"
	| "failed";

export class QuickbooksCallbackError extends Error {
	constructor(readonly reason: CallbackFailure) {
		super(`QuickBooks connect failed: ${reason}`);
		this.name = "QuickbooksCallbackError";
	}
}

const REALM_ID = /^[A-Za-z0-9-]{3,64}$/;

const NEEDS_RECONNECT_MESSAGE = "QuickBooks needs to be connected again.";

type TokenOutcome =
	| { kind: "ok"; accessToken: string; realmId: string }
	| { kind: "not-connected" }
	| { kind: "needs-reconnect" }
	| { kind: "unavailable"; message: string };

function sha256(value: string): string {
	return createHash("sha256").update(value).digest("hex");
}

/**
 * The one QuickBooks connection of this deploy: connect, keep the token fresh,
 * disconnect. Nothing here returns or logs a token.
 */
@Injectable()
export class QuickbooksConnectionService {
	private readonly logger = new Logger(QuickbooksConnectionService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly access: QuickbooksAccess,
	) {}

	/** The Intuit keys from the environment, or null when this deploy has none. */
	credentials(): QuickbooksCredentials | null {
		const clientId = process.env.QUICKBOOKS_CLIENT_ID?.trim();
		const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET?.trim();

		if (!clientId || !clientSecret) return null;

		return {
			clientId,
			clientSecret,
			environment:
				process.env.QUICKBOOKS_ENVIRONMENT === "production"
					? "production"
					: "sandbox",
		};
	}

	/**
	 * The address to register as a redirect URI in the Intuit app. It is on the APP
	 * host on purpose: the web app proxies every /api/* path to the API, forwarding
	 * the session cookie and passing redirects through, so the browser arrives with
	 * its cookie whatever the cookie domain is. Registered exactly as
	 * <APP_URL>/api/quickbooks/callback.
	 */
	redirectUri(): string {
		return new URL("/api/quickbooks/callback", appUrl).toString();
	}

	private box(): McpSecretBox | undefined {
		return createMcpSecretBox();
	}

	private configured(): { credentials: QuickbooksCredentials; box: McpSecretBox } | null {
		const credentials = this.credentials();
		const box = this.box();

		return credentials && box ? { credentials, box } : null;
	}

	async status(userId: string): Promise<QuickbooksStatus> {
		await this.access.assert(userId, "quickbooks.read");

		return this.snapshot(userId);
	}

	private async snapshot(userId: string): Promise<QuickbooksStatus> {
		const [canConnect, row] = await Promise.all([
			this.access.has(userId, "quickbooks.connect"),
			this.db.quickbooksConnection.findUnique({ where: { id: CONNECTION_ID } }),
		]);

		const credentials = this.credentials();
		const person = row?.connectedById
			? await this.db.user.findUnique({
					where: { id: row.connectedById },
					select: { name: true },
				})
			: null;

		return {
			configured: this.configured() !== null,
			environment: credentials?.environment ?? "sandbox",
			canConnect,
			redirectUri: canConnect ? this.redirectUri() : null,
			connection: row
				? {
						status: row.status as ConnectionStatus,
						companyName: row.companyName,
						realmId: row.realmId,
						homeCurrency: row.homeCurrency,
						country: row.country,
						connectedAt: row.connectedAt?.toISOString() ?? null,
						connectedBy: person?.name ?? null,
						lastCheckedAt: row.lastCheckedAt?.toISOString() ?? null,
						lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
						lastError: row.lastError,
					}
				: null,
		};
	}

	/** Step 1 of connecting: remember a single-use state for this person, and give back Intuit's consent page. */
	async startConnect(userId: string): Promise<{ url: string }> {
		await this.access.assert(userId, "quickbooks.connect");

		const ready = this.configured();

		if (!ready) {
			throw new ConflictException(
				"QuickBooks is not set up on this deploy yet. Ask your developer to add the QuickBooks keys.",
			);
		}

		const existing = await this.db.quickbooksConnection.findUnique({
			where: { id: CONNECTION_ID },
			select: { status: true },
		});

		if (existing?.status === "CONNECTED") {
			throw new ConflictException(
				"QuickBooks is already connected. Disconnect it first to connect a different company.",
			);
		}

		const raw = randomBytes(32).toString("base64url");

		await this.db.quickbooksOauthState.deleteMany({
			where: { expiresAt: { lt: new Date() } },
		});

		await this.db.quickbooksOauthState.create({
			data: {
				stateHash: sha256(raw),
				userId,
				environment: ready.credentials.environment,
				expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
			},
		});

		return { url: authorizeUrl(ready.credentials, this.redirectUri(), raw) };
	}

	/**
	 * Step 2: Intuit sent the browser back with a code. The state must be one we
	 * issued, to this same person, unused and not expired. A reconnect must be to the
	 * same company unless the person disconnected first.
	 */
	async completeConnect(input: {
		userId: string;
		state: string;
		code: string;
		realmId: string;
	}): Promise<void> {
		const ready = this.configured();

		if (!ready) throw new QuickbooksCallbackError("not-configured");

		if (!REALM_ID.test(input.realmId)) throw new QuickbooksCallbackError("invalid");

		const stateHash = sha256(input.state);
		const state = await this.db.quickbooksOauthState.findUnique({
			where: { stateHash },
		});

		if (!state || state.userId !== input.userId || state.usedAt) {
			throw new QuickbooksCallbackError("invalid");
		}

		if (state.expiresAt.getTime() < Date.now()) {
			throw new QuickbooksCallbackError("expired");
		}

		// Claim it. Two requests with the same state cannot both pass this line.
		const claimed = await this.db.quickbooksOauthState.updateMany({
			where: { stateHash, usedAt: null },
			data: { usedAt: new Date() },
		});

		if (claimed.count !== 1) throw new QuickbooksCallbackError("invalid");

		if (state.environment !== ready.credentials.environment) {
			throw new QuickbooksCallbackError("invalid");
		}

		await this.access.assert(input.userId, "quickbooks.connect");

		const existing = await this.db.quickbooksConnection.findUnique({
			where: { id: CONNECTION_ID },
			select: { realmId: true, status: true },
		});

		if (
			existing &&
			existing.status !== "DISCONNECTED" &&
			existing.realmId !== input.realmId
		) {
			throw new QuickbooksCallbackError("different-company");
		}

		let tokens: Awaited<ReturnType<typeof exchangeCode>>;
		let details: Awaited<ReturnType<typeof readCompany>>;

		try {
			tokens = await exchangeCode(ready.credentials, input.code, this.redirectUri());
			details = await readCompany(
				ready.credentials.environment,
				input.realmId,
				tokens.accessToken,
			);
		} catch (error) {
			this.logger.warn({
				message: "QuickBooks connect failed",
				kind: error instanceof IntuitError ? error.kind : "unknown",
				status: error instanceof IntuitError ? error.status : undefined,
			});
			throw new QuickbooksCallbackError("failed");
		}

		const now = new Date();
		const stored = {
			realmId: input.realmId,
			environment: ready.credentials.environment,
			companyName: details.companyName,
			homeCurrency: details.homeCurrency,
			country: details.country,
			status: "CONNECTED",
			encryptedAccessToken: ready.box.encrypt(
				tokens.accessToken,
				SECRET_PURPOSE.access,
			),
			encryptedRefreshToken: ready.box.encrypt(
				tokens.refreshToken,
				SECRET_PURPOSE.refresh,
			),
			accessTokenExpiresAt: new Date(now.getTime() + tokens.expiresInSeconds * 1000),
			refreshTokenIssuedAt: now,
			connectedById: input.userId,
			connectedAt: now,
			lastCheckedAt: now,
			lastError: null,
		};

		const actor = await this.actorFor(input.userId);

		await this.db.$transaction(async (tx) => {
			await tx.quickbooksConnection.upsert({
				where: { id: CONNECTION_ID },
				create: { id: CONNECTION_ID, ...stored },
				update: stored,
			});

			await writeAudit(tx, {
				module: "quickbooks",
				actorType: "USER",
				actorId: input.userId,
				actorLabel: actor,
				action: "QUICKBOOKS_CONNECTED",
				entityType: "quickbooksConnection",
				entityId: CONNECTION_ID,
				summary: `QuickBooks connected${details.companyName ? ` (${details.companyName})` : ""}`,
				before: existing ? { status: existing.status } : null,
				after: { status: "CONNECTED", environment: stored.environment },
				requestId: getRequestContext()?.requestId ?? null,
			});
		});
	}

	/** Proves the connection works now: refreshes the token if needed and reads the company. */
	async check(userId: string): Promise<QuickbooksStatus> {
		await this.access.assert(userId, "quickbooks.connect");

		const ready = this.configured();

		if (!ready) {
			throw new ConflictException(
				"QuickBooks is not set up on this deploy yet. Ask your developer to add the QuickBooks keys.",
			);
		}

		const { accessToken, realmId } = await this.getAccessToken();

		try {
			const details = await readCompany(
				ready.credentials.environment,
				realmId,
				accessToken,
			);

			await this.db.quickbooksConnection.update({
				where: { id: CONNECTION_ID },
				data: {
					companyName: details.companyName,
					homeCurrency: details.homeCurrency,
					country: details.country,
					lastCheckedAt: new Date(),
					lastError: null,
				},
			});
		} catch (error) {
			if (error instanceof IntuitError && error.kind === "unauthorized") {
				await this.markNeedsReconnect();
				throw new ConflictException(NEEDS_RECONNECT_MESSAGE);
			}

			if (error instanceof IntuitError) {
				throw new ServiceUnavailableException(error.message);
			}

			throw error;
		}

		return this.snapshot(userId);
	}

	/**
	 * A working access token for the connected company, refreshed when it has under
	 * five minutes left. Intuit ROTATES the refresh token on use, so the new one is
	 * written before anyone uses the new access token, and the refresh runs under a
	 * row lock: two callers can never both spend the same refresh token. Used by the
	 * check button now and by the sync and invoice code in later rounds.
	 */
	async getAccessToken(): Promise<{ accessToken: string; realmId: string }> {
		const ready = this.configured();

		if (!ready) {
			throw new ConflictException(
				"QuickBooks is not set up on this deploy yet. Ask your developer to add the QuickBooks keys.",
			);
		}

		const { credentials, box } = ready;

		const outcome = await this.db.$transaction(
			async (tx): Promise<TokenOutcome> => {
				await tx.$queryRaw`SELECT "id" FROM "quickbooksConnection" WHERE "id" = ${CONNECTION_ID} FOR UPDATE`;

				const row = await tx.quickbooksConnection.findUnique({
					where: { id: CONNECTION_ID },
				});

				if (!row || row.status === "DISCONNECTED") {
					return { kind: "not-connected" };
				}

				if (
					row.status === "NEEDS_RECONNECT" ||
					row.environment !== credentials.environment ||
					!row.encryptedRefreshToken
				) {
					return { kind: "needs-reconnect" };
				}

				let refreshToken: string;
				let current: string | null = null;

				try {
					refreshToken = box.decrypt(
						row.encryptedRefreshToken,
						SECRET_PURPOSE.refresh,
					);

					if (
						row.encryptedAccessToken &&
						row.accessTokenExpiresAt &&
						row.accessTokenExpiresAt.getTime() - Date.now() > REFRESH_WINDOW_MS
					) {
						current = box.decrypt(
							row.encryptedAccessToken,
							SECRET_PURPOSE.access,
						);
					}
				} catch {
					// The encryption key changed or the value is damaged: nothing here can be used.
					await this.markNeedsReconnectIn(tx);
					return { kind: "needs-reconnect" };
				}

				if (current) {
					return { kind: "ok", accessToken: current, realmId: row.realmId };
				}

				try {
					const tokens = await refreshTokens(credentials, refreshToken);
					const now = new Date();

					await tx.quickbooksConnection.update({
						where: { id: CONNECTION_ID },
						data: {
							encryptedAccessToken: box.encrypt(
								tokens.accessToken,
								SECRET_PURPOSE.access,
							),
							encryptedRefreshToken: box.encrypt(
								tokens.refreshToken,
								SECRET_PURPOSE.refresh,
							),
							accessTokenExpiresAt: new Date(
								now.getTime() + tokens.expiresInSeconds * 1000,
							),
							refreshTokenIssuedAt: now,
							lastError: null,
						},
					});

					return { kind: "ok", accessToken: tokens.accessToken, realmId: row.realmId };
				} catch (error) {
					if (error instanceof IntuitError && error.kind === "invalid-grant") {
						await this.markNeedsReconnectIn(tx);
						return { kind: "needs-reconnect" };
					}

					this.logger.warn({
						message: "QuickBooks token refresh failed",
						kind: error instanceof IntuitError ? error.kind : "unknown",
					});

					return {
						kind: "unavailable",
						message:
							error instanceof IntuitError
								? error.message
								: "QuickBooks could not be reached.",
					};
				}
			},
			{ maxWait: 10_000, timeout: 45_000 },
		);

		switch (outcome.kind) {
			case "ok":
				return { accessToken: outcome.accessToken, realmId: outcome.realmId };
			case "not-connected":
				throw new ConflictException("QuickBooks is not connected.");
			case "needs-reconnect":
				throw new ConflictException(NEEDS_RECONNECT_MESSAGE);
			case "unavailable":
				throw new ServiceUnavailableException(outcome.message);
		}
	}

	/** Disconnects: tells Intuit to forget us (best effort), then drops our tokens. The row stays so a reconnect to the same company is recognised. */
	async disconnect(userId: string): Promise<{ revokedAtIntuit: boolean }> {
		await this.access.assert(userId, "quickbooks.connect");

		const row = await this.db.quickbooksConnection.findUnique({
			where: { id: CONNECTION_ID },
		});

		if (!row || row.status === "DISCONNECTED") return { revokedAtIntuit: true };

		let revokedAtIntuit = !row.encryptedRefreshToken;
		const ready = this.configured();

		if (ready && row.encryptedRefreshToken) {
			try {
				revokedAtIntuit = await revokeToken(
					ready.credentials,
					ready.box.decrypt(row.encryptedRefreshToken, SECRET_PURPOSE.refresh),
				);
			} catch {
				revokedAtIntuit = false;
			}
		}

		const actor = await this.actorFor(userId);

		await this.db.$transaction(async (tx) => {
			await tx.quickbooksConnection.update({
				where: { id: CONNECTION_ID },
				data: {
					status: "DISCONNECTED",
					encryptedAccessToken: null,
					encryptedRefreshToken: null,
					accessTokenExpiresAt: null,
					lastError: null,
				},
			});

			await writeAudit(tx, {
				module: "quickbooks",
				actorType: "USER",
				actorId: userId,
				actorLabel: actor,
				action: "QUICKBOOKS_DISCONNECTED",
				entityType: "quickbooksConnection",
				entityId: CONNECTION_ID,
				summary: "QuickBooks disconnected",
				before: { status: row.status },
				after: { status: "DISCONNECTED", revokedAtIntuit },
				requestId: getRequestContext()?.requestId ?? null,
			});
		});

		return { revokedAtIntuit };
	}

	/** Where the browser goes after Intuit sends it to the callback: the settings page, with a status. */
	async settingsRedirect(status: "connected" | "error", reason?: CallbackFailure): Promise<string> {
		const workspace = await this.db.organization.findUnique({
			where: { id: WORKSPACE_ID },
			select: { slug: true },
		});

		const url = new URL(
			workspace ? `/${workspace.slug}/settings/quickbooks` : "/",
			appUrl,
		);
		url.searchParams.set("status", status);
		if (reason) url.searchParams.set("reason", reason);

		return url.toString();
	}

	private async markNeedsReconnect(): Promise<void> {
		await this.db.$transaction((tx) => this.markNeedsReconnectIn(tx));
	}

	/** Moves a CONNECTED connection to NEEDS_RECONNECT and drops its dead tokens. A no-op in any other state. */
	private async markNeedsReconnectIn(
		tx: Prisma.TransactionClient,
	): Promise<void> {
		const row = await tx.quickbooksConnection.findUnique({
			where: { id: CONNECTION_ID },
			select: { status: true },
		});

		if (!row || row.status !== "CONNECTED") return;

		await tx.quickbooksConnection.update({
			where: { id: CONNECTION_ID },
			data: {
				status: "NEEDS_RECONNECT",
				encryptedAccessToken: null,
				encryptedRefreshToken: null,
				accessTokenExpiresAt: null,
				lastError: NEEDS_RECONNECT_MESSAGE,
			},
		});

		await writeAudit(tx, {
			module: "quickbooks",
			actorType: "SYSTEM",
			action: "QUICKBOOKS_DISCONNECTED_BY_PROVIDER",
			entityType: "quickbooksConnection",
			entityId: CONNECTION_ID,
			summary: "QuickBooks stopped accepting the connection",
			before: { status: row.status },
			after: { status: "NEEDS_RECONNECT" },
			requestId: getRequestContext()?.requestId ?? null,
		});
	}

	private async actorFor(userId: string): Promise<string | null> {
		const user = await this.db.user.findUnique({
			where: { id: userId },
			select: { name: true, email: true },
		});

		if (!user) return null;

		return user.name ? `${user.name} <${user.email}>` : user.email;
	}
}
