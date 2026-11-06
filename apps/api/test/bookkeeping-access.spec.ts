import { afterEach, describe, expect, it } from "bun:test";
import { bookkeeping } from "@app/modules/bookkeeping/meta";
import { resetModules, useModules } from "@app/modules/testing";
import { ForbiddenException } from "@nestjs/common";
import type { MiddlewareOptions } from "nestjs-trpc";

if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL =
		"postgresql://postgres:postgres@localhost:5432/crm?schema=public";
}

const { BOOKKEEPING_KEYS, BookkeepingAccess, BookkeepingAccessMiddleware } =
	await import("../src/bookkeeping/bookkeeping-access");

afterEach(resetModules);

const ROLES = ["owner", "admin", "bookkeeper", "accountant", "member"] as const;

/** A member table with one row per user id; a user with no row is not in the workspace. */
function accessFor(roles: Record<string, string>) {
	const db = {
		member: {
			findUnique: async ({
				where,
			}: {
				where: { organizationId_userId: { userId: string } };
			}) => {
				const role = roles[where.organizationId_userId.userId];

				return role ? { role } : null;
			},
		},
		user: { findUnique: async () => null },
	};

	return new BookkeepingAccess(db as never);
}

describe("BookkeepingAccess", () => {
	it("grants each key to exactly the roles the module declares", async () => {
		useModules(["bookkeeping"]);

		for (const role of ROLES) {
			const access = accessFor({ u: role });

			for (const key of BOOKKEEPING_KEYS) {
				const expected = bookkeeping.permissions[key]?.includes(role) ?? false;

				expect(await access.has("u", key), `${key} for ${role}`).toBe(expected);
			}
		}
	});

	it("declares every key the module declares, and no other", () => {
		expect([...BOOKKEEPING_KEYS].sort()).toEqual(
			Object.keys(bookkeeping.permissions).sort(),
		);
	});

	it("refuses with 403 where the role lacks the key, and lets the rest through", async () => {
		useModules(["bookkeeping"]);

		await expect(
			accessFor({ u: "member" }).assert("u", "bookkeeping.post"),
		).rejects.toBeInstanceOf(ForbiddenException);
		await expect(
			accessFor({ u: "accountant" }).assert("u", "bookkeeping.reopen"),
		).rejects.toBeInstanceOf(ForbiddenException);
		await expect(
			accessFor({ u: "owner" }).assert("u", "bookkeeping.reopen"),
		).resolves.toBeUndefined();
		await expect(
			accessFor({ u: "bookkeeper" }).assert("u", "bookkeeping.reports"),
		).resolves.toBeUndefined();
	});

	it("gives nothing to a person with no membership or a role it does not know", async () => {
		useModules(["bookkeeping"]);

		for (const key of BOOKKEEPING_KEYS) {
			expect(await accessFor({}).has("nobody", key)).toBe(false);
			expect(await accessFor({ u: "janitor" }).has("u", key)).toBe(false);
		}
	});

	it("gives nothing to anyone when the module is off", async () => {
		useModules(["crm"]);

		for (const role of ROLES) {
			for (const key of BOOKKEEPING_KEYS) {
				expect(await accessFor({ u: role }).has("u", key)).toBe(false);
			}
		}
	});

	it("assertAny passes when one of the keys is held", async () => {
		useModules(["bookkeeping"]);
		const bookkeeper = accessFor({ u: "bookkeeper" });

		await expect(
			bookkeeper.assertAny("u", ["bookkeeping.settings", "bookkeeping.reports"]),
		).resolves.toBeUndefined();
		await expect(
			bookkeeper.assertAny("u", ["bookkeeping.settings", "bookkeeping.lock"]),
		).rejects.toBeInstanceOf(ForbiddenException);
	});

	it("lists the granted keys for the UI", async () => {
		useModules(["bookkeeping"]);

		const { role, keys } = await accessFor({ u: "member" }).grantedKeys("u");

		expect(role).toBe("member");
		expect(keys).toEqual(["bookkeeping.read", "bookkeeping.write"]);
	});
});

describe("BookkeepingAccessMiddleware", () => {
	const run = async (roles: Record<string, string>, userId?: string) => {
		const middleware = new BookkeepingAccessMiddleware(accessFor(roles));
		let reached = false;
		const opts = {
			ctx: userId ? { user: { id: userId } } : {},
			next: async () => {
				reached = true;

				return { ok: true };
			},
		} as unknown as MiddlewareOptions;

		await middleware.use(opts);

		return reached;
	};

	it("lets a person with a bookkeeping role through", async () => {
		useModules(["bookkeeping"]);

		expect(await run({ u: "member" }, "u")).toBe(true);
	});

	it("refuses a person with no role, and a request with no user", async () => {
		useModules(["bookkeeping"]);

		await expect(run({}, "nobody")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
		await expect(run({ u: "owner" })).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("refuses everyone when the module is off", async () => {
		useModules(["crm"]);

		await expect(run({ u: "owner" }, "u")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});
});
