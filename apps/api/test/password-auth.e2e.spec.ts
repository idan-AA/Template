import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { createPasswordUser } from "@app/auth/credentials";
import { enrolInWorkspace } from "@app/auth/organization";
import { db } from "@app/db";
import { WORKSPACE_ID } from "@app/db/workspace";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

const fallback = (key: string, value: string) => {
	if (!process.env[key]) process.env[key] = value;
};

fallback("BETTER_AUTH_SECRET", "test-secret-at-least-32-characters-long");
fallback("API_URL", "http://localhost:3001");
fallback("ALLOWED_SIGN_IN", "example.com");
fallback("GOOGLE_CLIENT_ID", "test-google-client-id");
fallback("GOOGLE_CLIENT_SECRET", "test-google-client-secret");

/**
 * Real HTTP against the real app and the real database: the sign-in page's
 * calls, the settings page's calls. Each test uses its own forwarded address so
 * better-auth's per-address rate limit never makes one test fail another.
 */

const RUN = Date.now().toString(36);
const ORIGIN = "http://localhost:3000";
const ADMIN_EMAIL = `admin-${RUN}@pw.test`;
const ADMIN_PASSWORD = "correct horse battery staple";
const MEMBER_EMAIL = `bookkeeper-${RUN}@pw.test`;
const FIRST_PASSWORD = "first-temporary-password";
const OWN_PASSWORD = "a-password-only-they-know";

let app: INestApplication;
let server: ReturnType<INestApplication["getHttpServer"]>;
let adminId = "";
let nextAddress = 10;

const address = () => `10.77.0.${nextAddress++}`;

async function signIn(email: string, password: string, from = address()) {
	return request(server)
		.post("/api/auth/sign-in/email")
		.set("Origin", ORIGIN)
		.set("X-Forwarded-For", from)
		.send({ email, password });
}

function cookieOf(response: request.Response): string {
	const cookies = response.headers["set-cookie"] as unknown as
		| string[]
		| undefined;
	const session = cookies?.find((entry) => entry.includes("session_token"));
	if (!session) throw new Error("no session cookie came back");
	return session.split(";")[0] as string;
}

async function trpcPost(
	cookie: string,
	procedure: string,
	body: Record<string, string | number | boolean | undefined>,
) {
	return request(server)
		.post(`/api/trpc/${procedure}`)
		.set("Origin", ORIGIN)
		.set("Cookie", cookie)
		.send(body);
}

async function trpcGet(cookie: string, procedure: string) {
	return request(server)
		.get(`/api/trpc/${procedure}`)
		.set("Origin", ORIGIN)
		.set("Cookie", cookie);
}

const message = (response: request.Response): string =>
	response.body?.error?.message ?? response.body?.message ?? "";

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");

	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleRef.createNestApplication({ bodyParser: false });
	await app.init();
	server = app.getHttpServer();

	const admin = await db.$transaction(async (tx) => {
		const created = await createPasswordUser(tx, {
			name: "Pat Admin",
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
			passwordChangeRequired: false,
		});
		await enrolInWorkspace(tx, created.id, "admin");
		await tx.member.update({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: created.id,
				},
			},
			data: { role: "admin" },
		});
		return created;
	});

	adminId = admin.id;
}, 90_000);

afterAll(async () => {
	await db.user.deleteMany({
		where: { email: { endsWith: `-${RUN}@pw.test` } },
	});
	await app?.close();
});

describe("signing in with email and password", () => {
	it("signs the right person in", async () => {
		const response = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);

		expect(response.status).toBe(200);
		expect(cookieOf(response)).toContain("session_token");
	});

	it("answers a wrong password and an unknown email with the same words", async () => {
		const wrongPassword = await signIn(ADMIN_EMAIL, "not the password at all");
		const unknownEmail = await signIn(
			`nobody-${RUN}@pw.test`,
			"not the password at all",
		);

		expect(wrongPassword.status).toBe(unknownEmail.status);
		expect(wrongPassword.status).toBe(401);
		expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
		expect(wrongPassword.body.code).toBe(unknownEmail.body.code);
	});

	it("does not let anyone sign themselves up", async () => {
		const response = await request(server)
			.post("/api/auth/sign-up/email")
			.set("Origin", ORIGIN)
			.set("X-Forwarded-For", address())
			.send({
				name: "Intruder",
				email: `intruder-${RUN}@pw.test`,
				password: "a perfectly good password",
			});

		expect(response.status).toBeGreaterThanOrEqual(400);
		expect(
			await db.user.count({
				where: { email: `intruder-${RUN}@pw.test` },
			}),
		).toBe(0);
	});

	it("closes better-auth's own password change, so ours is the only way", async () => {
		const admin = cookieOf(await signIn(ADMIN_EMAIL, ADMIN_PASSWORD));

		const response = await request(server)
			.post("/api/auth/change-password")
			.set("Origin", ORIGIN)
			.set("Cookie", admin)
			.set("X-Forwarded-For", address())
			.send({
				currentPassword: ADMIN_PASSWORD,
				newPassword: "something-else-entirely",
			});

		expect(response.status).toBe(403);
		expect(response.body.message).toContain("Settings");
	});
});

describe("adding a member and the first sign-in", () => {
	it("an admin adds a bookkeeper, who must choose a password before anything else", async () => {
		const admin = cookieOf(await signIn(ADMIN_EMAIL, ADMIN_PASSWORD));

		const added = await trpcPost(admin, "workspace.addMember", {
			name: "Bea Bookkeeper",
			email: MEMBER_EMAIL,
			role: "member",
			password: FIRST_PASSWORD,
		});

		expect(added.status).toBe(200);
		expect(added.body.result.data.email).toBe(MEMBER_EMAIL);
		expect(added.body.result.data.role).toBe("member");

		const member = cookieOf(await signIn(MEMBER_EMAIL, FIRST_PASSWORD));

		const state = await trpcGet(member, "account.state");
		expect(state.status).toBe(200);
		expect(state.body.result.data).toEqual({
			passwordChangeRequired: true,
			hasPassword: true,
		});

		for (const procedure of [
			"workspace.get",
			"users.me",
			"currency.settings",
		]) {
			const blocked = await trpcGet(member, procedure);
			expect(blocked.status, procedure).toBe(403);
			expect(message(blocked)).toBe(
				"Choose a new password before you do anything else.",
			);
		}

		// The temporary password cannot be kept as the "new" one.
		const reused = await trpcPost(member, "account.changePassword", {
			newPassword: FIRST_PASSWORD,
		});
		expect(reused.status).toBe(400);
		expect(message(reused)).toBe("Choose a password you have not been using.");

		// A forced change asks for no current password: it was typed to sign in.
		const changed = await trpcPost(member, "account.changePassword", {
			newPassword: OWN_PASSWORD,
		});
		expect(changed.status).toBe(200);

		const free = await trpcGet(member, "workspace.get");
		expect(free.status).toBe(200);
		expect(free.body.result.data.viewerRole).toBe("member");

		expect((await signIn(MEMBER_EMAIL, FIRST_PASSWORD)).status).toBe(401);
		expect((await signIn(MEMBER_EMAIL, OWN_PASSWORD)).status).toBe(200);
	});

	it("refuses a second account for the same email, in plain words", async () => {
		const admin = cookieOf(await signIn(ADMIN_EMAIL, ADMIN_PASSWORD));

		const again = await trpcPost(admin, "workspace.addMember", {
			name: "Someone Else",
			email: MEMBER_EMAIL.toUpperCase(),
			role: "member",
			password: FIRST_PASSWORD,
		});

		expect(again.status).toBe(409);
		expect(message(again)).toBe(
			"Someone with that email address already has an account here.",
		);
	});

	it("keeps a short password out, with a sentence that says what to do", async () => {
		const admin = cookieOf(await signIn(ADMIN_EMAIL, ADMIN_PASSWORD));

		const short = await trpcPost(admin, "workspace.addMember", {
			name: "Short Password",
			email: `short-${RUN}@pw.test`,
			role: "member",
			password: "123456789",
		});

		expect(short.status).toBe(400);
		expect(message(short)).toContain("at least 10 characters");
		expect(
			await db.user.count({ where: { email: `short-${RUN}@pw.test` } }),
		).toBe(0);
	});

	it("will not take a wrong current password, and says so once", async () => {
		const member = cookieOf(await signIn(MEMBER_EMAIL, OWN_PASSWORD));

		const wrong = await trpcPost(member, "account.changePassword", {
			currentPassword: "not my password",
			newPassword: "a-brand-new-password",
		});

		expect(wrong.status).toBe(400);
		expect(message(wrong)).toBe("That is not your current password.");

		// Outside a forced change the current password is always required.
		const missing = await trpcPost(member, "account.changePassword", {
			newPassword: "a-brand-new-password",
		});
		expect(missing.status).toBe(400);
		expect(message(missing)).toBe("That is not your current password.");
	});
});

describe("resetting a password", () => {
	it("an admin resets it, the member is signed out everywhere and must choose again", async () => {
		const memberBefore = cookieOf(await signIn(MEMBER_EMAIL, OWN_PASSWORD));
		const admin = cookieOf(await signIn(ADMIN_EMAIL, ADMIN_PASSWORD));

		const memberRow = await db.member.findFirstOrThrow({
			where: { organizationId: WORKSPACE_ID, user: { email: MEMBER_EMAIL } },
			select: { id: true, userId: true },
		});

		const reset = await trpcPost(admin, "workspace.resetMemberPassword", {
			memberId: memberRow.id,
			password: "temporary-from-the-admin",
		});
		expect(reset.status).toBe(200);

		expect(
			await db.session.count({ where: { userId: memberRow.userId } }),
		).toBe(0);

		// The old password no longer works; the temporary one does, and forces a change.
		expect((await signIn(MEMBER_EMAIL, OWN_PASSWORD)).status).toBe(401);
		const again = cookieOf(
			await signIn(MEMBER_EMAIL, "temporary-from-the-admin"),
		);
		const state = await trpcGet(again, "account.state");
		expect(state.body.result.data.passwordChangeRequired).toBe(true);

		// A cookie minted before the reset is stopped too, even while its cache lives.
		const stale = await trpcGet(memberBefore, "workspace.get");
		expect([401, 403]).toContain(stale.status);
	});

	it("is refused for someone who is not an owner or admin", async () => {
		const memberCookie = cookieOf(
			await signIn(MEMBER_EMAIL, "temporary-from-the-admin"),
		);
		// They must change it first, so use their own new password.
		await trpcPost(memberCookie, "account.changePassword", {
			currentPassword: "temporary-from-the-admin",
			newPassword: OWN_PASSWORD,
		});
		const member = cookieOf(await signIn(MEMBER_EMAIL, OWN_PASSWORD));

		const adminRow = await db.member.findFirstOrThrow({
			where: { organizationId: WORKSPACE_ID, userId: adminId },
			select: { id: true },
		});

		const refused = await trpcPost(member, "workspace.resetMemberPassword", {
			memberId: adminRow.id,
			password: "i-would-like-to-be-the-admin",
		});
		const refusedAdd = await trpcPost(member, "workspace.addMember", {
			name: "Not Allowed",
			email: `notallowed-${RUN}@pw.test`,
			role: "member",
			password: "a perfectly good password",
		});

		expect(refused.status).toBe(403);
		expect(refusedAdd.status).toBe(403);
		expect(
			await db.user.count({ where: { email: `notallowed-${RUN}@pw.test` } }),
		).toBe(0);
	});
});

describe("the audit trail of account actions", () => {
	it("records who did what, and never a password or a hash", async () => {
		const memberRow = await db.member.findFirstOrThrow({
			where: { organizationId: WORKSPACE_ID, user: { email: MEMBER_EMAIL } },
			select: { id: true, userId: true },
		});

		const events = await db.auditEvent.findMany({
			where: {
				OR: [
					{ entityId: memberRow.id },
					{ entityId: memberRow.userId },
					{ actorId: adminId },
				],
			},
			orderBy: { at: "asc" },
		});

		const actions = events.map((event) => event.action);
		expect(actions).toContain("MEMBER_CREATED");
		expect(actions).toContain("PASSWORD_CHANGED");
		expect(actions).toContain("PASSWORD_RESET_BY_ADMIN");

		const everything = JSON.stringify(events);
		for (const secret of [
			ADMIN_PASSWORD,
			FIRST_PASSWORD,
			OWN_PASSWORD,
			"temporary-from-the-admin",
		]) {
			expect(everything).not.toContain(secret);
		}

		const hashes = await db.account.findMany({
			where: {
				userId: { in: [memberRow.userId, adminId] },
				password: { not: null },
			},
			select: { password: true },
		});
		for (const { password } of hashes) {
			expect(everything).not.toContain(password as string);
		}

		const created = events.find((event) => event.action === "MEMBER_CREATED");
		expect(created?.actorId).toBe(adminId);
		expect(created?.module).toBe("core");
	});
});

describe("throttling guesses (runs last: it uses up one address)", () => {
	it("stops a run of wrong passwords from one address, and the right password gets in again after", async () => {
		const attacker = "10.99.0.1";
		const statuses: number[] = [];

		for (let attempt = 0; attempt < 20; attempt++) {
			const response = await signIn(
				ADMIN_EMAIL,
				`wrong guess ${attempt}`,
				attacker,
			);
			statuses.push(response.status);
		}

		const refused = statuses.filter((status) => status === 429).length;
		const rejected = statuses.filter((status) => status === 401).length;

		console.log(
			`20 wrong passwords from one address: ${rejected} answered 401, ${refused} answered 429`,
		);

		expect(rejected).toBeLessThanOrEqual(10);
		expect(refused).toBeGreaterThanOrEqual(10);

		// Someone else on another address is not affected.
		expect((await signIn(ADMIN_EMAIL, ADMIN_PASSWORD)).status).toBe(200);
	});
});
