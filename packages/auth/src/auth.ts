import { db } from "@app/db";
import { schemas } from "@app/validation";
import { apiKey } from "@better-auth/api-key";
import { sso } from "@better-auth/sso";
import {
	type BetterAuthOptions,
	type BetterAuthPlugin,
	betterAuth,
} from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { organization } from "better-auth/plugins/organization";
import { API_KEY_EXPIRATION, API_KEY_HEADER, API_KEY_PREFIX } from "./api-keys";
import { AUTH_COOKIE_PREFIX } from "./cookies";
import { env } from "./env";
import { ensureWorkspaceMembership } from "./organization";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./password-policy";
import {
	GOOGLE_PROVIDER_ID,
	MICROSOFT_PROVIDER_ID,
	MICROSOFT_SYNC_SCOPES,
	SLACK_PROVIDER_ID,
	SYNC_SCOPES,
} from "./scopes";
import { notifySignedIn } from "./signed-in";
import { slackConnectGuard } from "./slack-connect";
import { rememberSlackInstall, replaceSlackConnection } from "./slack-grant";
import { SLACK_REQUESTED_SCOPES, SLACK_USER_SCOPES } from "./slack-scopes";
import { queueSlackInventorySync } from "./slack-sync";
import {
	hasSignInAllowList,
	isWorkspaceEmail,
	primaryWorkspaceDomain,
} from "./workspace";

const socialProviders: NonNullable<BetterAuthOptions["socialProviders"]> = {};
const slackOAuth = env.slack;
const slackRedirectUri = new URL(
	"/api/auth/callback/slack",
	env.apiUrl,
).toString();

if (env.google) {
	const google: NonNullable<typeof socialProviders.google> = {
		...env.google,

		scope: [...SYNC_SCOPES],

		accessType: "offline",
	};

	const hostedDomain = primaryWorkspaceDomain();
	if (hostedDomain) google.hd = hostedDomain;

	socialProviders.google = google;
}

if (env.microsoft) {
	socialProviders.microsoft = {
		clientId: env.microsoft.clientId,
		clientSecret: env.microsoft.clientSecret,
		tenantId: env.microsoft.tenantId,

		scope: [...MICROSOFT_SYNC_SCOPES],

		prompt: "select_account",

		disableProfilePhoto: true,

		mapProfileToUser: (profile) => ({
			email: profile.email ?? profile.preferred_username ?? profile.upn,
		}),
	};
}

/**
 * Our own endpoints do the work of these better-auth ones (so each is audited
 * and the forced-change flag stays true): close the originals.
 */
const BLOCKED_PASSWORD_PATHS = [
	"/sign-up/email",
	"/change-password",
	"/set-password",
	"/reset-password",
	"/request-password-reset",
	"/forget-password",
] as const;

const passwordEndpointGuard = {
	id: "password-endpoint-guard",
	hooks: {
		before: [
			{
				matcher: (ctx: { path?: string }) =>
					BLOCKED_PASSWORD_PATHS.some(
						(path) => ctx.path === path || ctx.path?.startsWith(`${path}/`),
					),
				handler: createAuthMiddleware(async (ctx) => {
					throw new APIError("FORBIDDEN", {
						message: ctx.path?.startsWith("/sign-up")
							? "Sign-up is closed. An owner or admin adds people under Settings, Members."
							: "Passwords are changed from Settings, Account, or by an owner or admin from Settings, Members.",
					});
				}),
			},
		],
	},
} satisfies BetterAuthPlugin;

export const auth = betterAuth({
	appName: "CRM",
	baseURL: env.apiUrl,

	database: prismaAdapter(db, {
		provider: "postgresql",
	}),

	// Email and password is always on, so a deploy works with no Google, no
	// Microsoft and no SSO. Nobody can create an account through better-auth
	// itself: `disableSignUp` closes /sign-up/email, and accounts are born only in
	// `credentials.ts` (the first owner on an empty database, or an owner/admin
	// adding a member). Reset and change go through our own endpoints too, see
	// `passwordEndpointGuard`, so every password change is audited and clears the
	// "must change it" flag.
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		minPasswordLength: PASSWORD_MIN_LENGTH,
		maxPasswordLength: PASSWORD_MAX_LENGTH,
		autoSignIn: false,
	},

	socialProviders,

	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: [GOOGLE_PROVIDER_ID, MICROSOFT_PROVIDER_ID],
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		// Off on purpose: with the cache on, a session revoked by a password change
		// or an admin reset kept working on other devices for up to 5 minutes.
		cookieCache: {
			enabled: false,
		},
	},

	// Every route is limited (100 per 10 s per address by default). A custom
	// rule REPLACES the default for its path, it does not add to it, so
	// /sign-in/email is limited to the 10 a minute below and nothing else.
	rateLimit: {
		enabled: true,
		storage: "database",
		customRules: {
			"/sign-in/email": { window: 60, max: 10 },
		},
	},

	advanced: {
		cookiePrefix: AUTH_COOKIE_PREFIX,

		// Behind Render every request arrives from Render's proxy. Cloudflare sits in
		// front and overwrites cf-connecting-ip, so it cannot be forged by a caller;
		// x-forwarded-for is the fallback (its leftmost entry can be forged).
		ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"] },

		useSecureCookies: env.isProduction,
		...(env.cookieDomain && {
			crossSubDomainCookies: {
				enabled: true,
				domain: env.cookieDomain,
			},
		}),
	},

	trustedOrigins: [...env.trustedOrigins],
	hooks: {
		before: slackConnectGuard,
	},

	plugins: [
		passwordEndpointGuard,
		...(slackOAuth
			? [
					genericOAuth({
						config: [
							{
								providerId: SLACK_PROVIDER_ID,
								authorizationUrl: "https://slack.com/oauth/v2/authorize",
								tokenUrl: "https://slack.com/api/oauth.v2.access",
								clientId: slackOAuth.clientId,
								clientSecret: slackOAuth.clientSecret,
								disableSignUp: true,
								redirectURI: slackRedirectUri,
								// Slack's v2 OAuth does not take a PKCE code_verifier, and the token
								// exchange below is hand-written; 1.7 turned PKCE on by default.
								pkce: false,
								scopes: [...SLACK_REQUESTED_SCOPES],
								authorizationUrlParams: {
									user_scope: SLACK_USER_SCOPES.join(","),
								},
								getToken: async ({ code }) => {
									const response = await fetch(
										"https://slack.com/api/oauth.v2.access",
										{
											method: "POST",
											headers: {
												"content-type": "application/x-www-form-urlencoded",
											},
											body: new URLSearchParams({
												client_id: slackOAuth.clientId,
												client_secret: slackOAuth.clientSecret,
												code,
												redirect_uri: slackRedirectUri,
											}),
										},
									);
									const grant = schemas.slack.oauthAccess.parse(
										await response.json(),
									);
									if (!response.ok || !grant.ok || !grant.access_token) {
										throw new APIError("BAD_REQUEST", {
											message: `Slack authorization failed (${grant.error ?? "rejected"}).`,
										});
									}
									await rememberSlackInstall(grant);

									return {
										accessToken: grant.access_token,
										tokenType: grant.token_type,
										scopes: (grant.scope ?? "")
											.split(",")
											.map((scope) => scope.trim())
											.filter(Boolean),
										raw: grant,
									};
								},
								getUserInfo: async (tokens) => {
									try {
										const granted = schemas.slack.oauthAccess.parse(tokens.raw);
										const userId = granted.authed_user?.id;
										if (!tokens.accessToken || !userId) return null;
										const userResponse = await fetch(
											`https://slack.com/api/users.info?user=${encodeURIComponent(userId)}`,
											{
												headers: {
													Authorization: `Bearer ${tokens.accessToken}`,
												},
											},
										);
										const profile = schemas.slack.userInfo.parse(
											await userResponse.json(),
										);
										if (!userResponse.ok || !profile.ok) return null;
										const details = profile.user.profile;
										const email = details.email;
										if (!email) return null;
										return {
											id: userId,
											name: details.real_name ?? profile.user.name ?? email,
											email,
											emailVerified: true,
											image: details.image_512,
										};
									} catch {
										return null;
									}
								},
							},
						],
					}),
				]
			: []),
		organization({
			allowUserToCreateOrganization: false,
			disableOrganizationDeletion: true,
			creatorRole: "owner",

			schema: {
				organization: {
					additionalFields: {
						website: {
							type: "string",
							required: false,
						},
					},
				},
			},
		}),

		sso({
			organizationProvisioning: { disabled: true },
		}),

		apiKey({
			apiKeyHeaders: API_KEY_HEADER,
			defaultPrefix: API_KEY_PREFIX,
			enableSessionForAPIKeys: true,
			requireName: true,
			defaultKeyLength: 32,
			maximumNameLength: 64,
			rateLimit: { enabled: false },
			keyExpiration: {
				maxExpiresIn: API_KEY_EXPIRATION.maxDays,
				minExpiresIn: API_KEY_EXPIRATION.minDays,
			},
		}),
	],

	databaseHooks: {
		account: {
			create: {
				after: replaceSlackAccount,
			},
			update: {
				after: replaceSlackAccount,
			},
		},

		user: {
			create: {
				// Runs only for people who arrive by themselves through Google,
				// Microsoft or SSO. Accounts an owner or admin creates, and the first
				// owner, are inserted directly (credentials.ts) and are allowed by
				// that act, so this list never decides about them.
				before: async (user) => {
					if (!hasSignInAllowList()) {
						throw new APIError("FORBIDDEN", {
							message:
								"This workspace does not take new people from Google, Microsoft or SSO yet. Ask an owner or admin to add you, or set ALLOWED_SIGN_IN.",
						});
					}

					if (!isWorkspaceEmail(user.email)) {
						const domain = primaryWorkspaceDomain();
						throw new APIError("FORBIDDEN", {
							message: domain
								? `This CRM is private. Sign in with your @${domain} account.`
								: "This CRM is private. That address is not on the allow-list.",
						});
					}

					return { data: user };
				},
			},
		},

		session: {
			create: {
				before: async (session) => {
					const workspaceId = await ensureWorkspaceMembership(session.userId);

					return {
						data: { ...session, activeOrganizationId: workspaceId ?? null },
					};
				},

				after: async (session) => {
					const user = await db.user.findUnique({
						where: { id: session.userId },
						select: { id: true, email: true },
					});

					if (user) await notifySignedIn(user);
				},
			},
		},
	},
});

export type Auth = typeof auth;

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];

async function replaceSlackAccount(account: {
	id: string;
	accountId: string;
	providerId: string;
}): Promise<void> {
	if (account.providerId !== SLACK_PROVIDER_ID) return;
	await replaceSlackConnection(account);
	await queueSlackInventorySync();
}
