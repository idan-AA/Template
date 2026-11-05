import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { join } from "node:path";
import { passwordProblem } from "@app/auth/password-policy";
import { type Db, db, type PrismaClient } from "@app/db";
import { connectTo } from "@app/db/connect";
import { WORKSPACE_ID } from "@app/db/workspace";
import { AccountService } from "../src/account/account.service";
import { AttemptLimiter } from "../src/account/attempt-limiter";
import { validateEnv } from "../src/config/env.validation";

/**
 * The first-run owner account. "An empty database" is a database of its own
 * (created, migrated from zero, and dropped here), so this file never locks or
 * empties the `user` table of the shared test database other specs are using.
 */

const SCRATCH = `owner_${Date.now().toString(36)}_${process.pid}_test`;

const DB_PACKAGE = join(
	import.meta.dirname,
	"..",
	"..",
	"..",
	"packages",
	"db",
);

function urlFor(database: string): string {
	const url = process.env.TEST_DATABASE_URL;
	if (!url) throw new Error("TEST_DATABASE_URL is not set");

	const parsed = new URL(url);
	parsed.pathname = `/${database}`;
	return parsed.toString();
}

async function adminExec(sql: string): Promise<void> {
	const admin = connectTo(urlFor("postgres"));
	try {
		await admin.$executeRawUnsafe(sql);
	} finally {
		await admin.$disconnect();
	}
}

let scratch: PrismaClient;

beforeAll(async () => {
	await adminExec(`CREATE DATABASE "${SCRATCH}"`);

	const result = Bun.spawnSync(
		[process.execPath, "x", "--bun", "prisma", "migrate", "deploy"],
		{
			cwd: DB_PACKAGE,
			env: { ...process.env, DATABASE_URL: urlFor(SCRATCH) },
			stdout: "pipe",
			stderr: "pipe",
		},
	);

	if (result.exitCode !== 0) {
		throw new Error(`migrate deploy failed: ${result.stderr.toString()}`);
	}

	scratch = connectTo(urlFor(SCRATCH));
}, 180_000);

afterAll(async () => {
	await scratch?.$disconnect();
	await adminExec(`DROP DATABASE IF EXISTS "${SCRATCH}" WITH (FORCE)`);
});

/** The scratch database with nobody in it, handed to the body with a service on it. */
async function onAnEmptyDatabase(
	body: (service: AccountService, client: PrismaClient) => Promise<void>,
): Promise<void> {
	await scratch.$executeRaw`DELETE FROM "user"`;
	await scratch.$executeRaw`DELETE FROM "organization"`;

	await body(new AccountService(scratch as unknown as Db), scratch);
}

const OWNER = {
	name: "Olive Owner",
	email: "Olive@Owner.test",
	password: "a long enough passphrase",
};

describe("creating the owner on an empty database", () => {
	it("says an owner is needed only while nobody has an account", async () => {
		await onAnEmptyDatabase(async (service, client) => {
			expect(await service.bootstrapStatus()).toEqual({ needsOwner: true });

			await service.createOwner(OWNER, "10.1.1.1");

			expect(await client.user.count()).toBe(1);
		});
	});

	it("creates the owner, signs nobody else up, and writes the audit row without the password", async () => {
		await onAnEmptyDatabase(async (service, client) => {
			await service.createOwner(OWNER, "10.1.1.2");

			const user = await client.user.findUniqueOrThrow({
				where: { email: "olive@owner.test" },
			});
			expect(user.passwordChangeRequired).toBe(false);

			const member = await client.member.findFirstOrThrow({
				where: { organizationId: WORKSPACE_ID, userId: user.id },
			});
			expect(member.role).toBe("owner");

			const credential = await client.account.findFirstOrThrow({
				where: { userId: user.id, providerId: "credential" },
			});
			expect(credential.password).toBeTruthy();
			expect(credential.password).not.toContain(OWNER.password);

			const audit = await client.auditEvent.findMany({
				where: { entityId: user.id },
			});
			expect(audit.map((row) => row.action)).toEqual(["OWNER_ACCOUNT_CREATED"]);
			expect(JSON.stringify(audit)).not.toContain(OWNER.password);
		});
	});

	it("refuses a second owner, in a sentence, once the first exists", async () => {
		await onAnEmptyDatabase(async (service, client) => {
			await service.createOwner(OWNER, "10.1.1.3");

			await expect(
				service.createOwner(
					{ ...OWNER, email: "second@owner.test" },
					"10.1.1.4",
				),
			).rejects.toThrow(
				"This workspace already has an owner. Sign in instead.",
			);

			expect(await client.user.count()).toBe(1);
			expect(await service.bootstrapStatus()).toEqual({ needsOwner: false });
		});
	});

	it("refuses a short password before it touches the database", async () => {
		await onAnEmptyDatabase(async (service, client) => {
			await expect(
				service.createOwner({ ...OWNER, password: "too short" }, "10.1.1.5"),
			).rejects.toThrow("at least 10 characters");

			expect(await client.user.count()).toBe(0);
		});
	});

	it("refuses when accounts exist already, on the real database too", async () => {
		const service = new AccountService(db);
		const users = await db.user.count();

		if (users === 0) return;

		await expect(service.createOwner(OWNER, "10.1.1.6")).rejects.toThrow(
			"already has an owner",
		);
		expect(await db.user.count()).toBe(users);
	});
});

describe("the password rule", () => {
	it("is ten to 128 characters and nothing else", () => {
		expect(passwordProblem("123456789")).toContain("at least 10");
		expect(passwordProblem("1234567890")).toBeNull();
		expect(passwordProblem("all lowercase and no digits at all")).toBeNull();
		expect(passwordProblem("x".repeat(128))).toBeNull();
		expect(passwordProblem("x".repeat(129))).toContain("at most 128");
	});
});

describe("the attempt limiter", () => {
	it("allows its quota, then answers 429 until the window passes", () => {
		const limiter = new AttemptLimiter(3, 1_000, "Slow down.");
		const start = 1_000_000;

		for (let attempt = 0; attempt < 3; attempt++) limiter.hit("a", start);

		expect(() => limiter.hit("a", start + 10)).toThrow("Slow down.");
		expect(() => limiter.hit("b", start + 10)).not.toThrow();
		expect(() => limiter.hit("a", start + 1_001)).not.toThrow();
	});
});

describe("ALLOWED_SIGN_IN", () => {
	const base = {
		DATABASE_URL: "postgresql://x/y",
		BETTER_AUTH_SECRET: "x".repeat(40),
	};

	it("is not needed when no social sign-in is set up", () => {
		expect(() => validateEnv(base)).not.toThrow();
		expect(() => validateEnv({ ...base, ALLOWED_SIGN_IN: "" })).not.toThrow();
	});

	it("is needed, and refuses to boot without it, once Google is set up", () => {
		expect(() =>
			validateEnv({
				...base,
				GOOGLE_CLIENT_ID: "id",
				GOOGLE_CLIENT_SECRET: "secret",
			}),
		).toThrow("ALLOWED_SIGN_IN is required while Google or Microsoft");
	});

	it("is needed once Microsoft is set up", () => {
		expect(() =>
			validateEnv({
				...base,
				MICROSOFT_CLIENT_ID: "id",
				MICROSOFT_CLIENT_SECRET: "secret",
			}),
		).toThrow("ALLOWED_SIGN_IN is required while Google or Microsoft");
	});

	it("boots with Google when it is set", () => {
		expect(() =>
			validateEnv({
				...base,
				ALLOWED_SIGN_IN: "acme.com",
				GOOGLE_CLIENT_ID: "id",
				GOOGLE_CLIENT_SECRET: "secret",
			}),
		).not.toThrow();
	});

	it("treats empty Google settings as not set up", () => {
		expect(() =>
			validateEnv({ ...base, GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "" }),
		).not.toThrow();
	});
});
