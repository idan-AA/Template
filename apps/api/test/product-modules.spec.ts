import { afterEach, describe, expect, it } from "bun:test";
import type { ModuleId } from "@app/modules/registry";
import { resetModules, useModules } from "@app/modules/testing";
import { type INestApplication, Module, type Type } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppRouterHost, Query, Router } from "nestjs-trpc";
import request from "supertest";
import { z } from "zod";

const fallback = (key: string, value: string) => {
	if (!process.env[key]) process.env[key] = value;
};

fallback(
	"DATABASE_URL",
	"postgresql://postgres:postgres@localhost:5432/crm?schema=public",
);
fallback("BETTER_AUTH_SECRET", "test-secret-at-least-32-characters-long");
fallback("API_URL", "http://localhost:3001");
fallback("ALLOWED_SIGN_IN", "example.com");
fallback("GOOGLE_CLIENT_ID", "test-google-client-id");
fallback("GOOGLE_CLIENT_SECRET", "test-google-client-secret");

const BOOT_TIMEOUT_MS = 60_000;

const { TrpcModule } = await import("../src/trpc/trpc.module");
const { ALWAYS_MOUNTED } = await import("../src/app.module");
const { apiModulesFor, enabledApiModules, MODULE_API } = await import(
	"../src/modules/registry"
);

/**
 * Stand-ins for a module's Nest module: one tRPC procedure each. Real modules
 * fill `MODULE_API` the same way; what is under test is that the registry mounts
 * a module's Nest modules when it is on and leaves them out when it is off.
 */
@Router({ alias: "fixtureCrm" })
class FixtureCrmRouter {
	@Query({ output: z.object({ from: z.literal("crm") }) })
	async ping() {
		return { from: "crm" as const };
	}
}

@Module({ imports: [TrpcModule], providers: [FixtureCrmRouter] })
class FixtureCrmModule {}

@Router({ alias: "fixtureBooks" })
class FixtureBooksRouter {
	@Query({ output: z.object({ from: z.literal("bookkeeping") }) })
	async ping() {
		return { from: "bookkeeping" as const };
	}
}

@Module({ imports: [TrpcModule], providers: [FixtureBooksRouter] })
class FixtureBooksModule {}

const FIXTURES: Record<ModuleId, readonly Type[]> = {
	crm: [FixtureCrmModule],
	bookkeeping: [FixtureBooksModule],
};

let app: INestApplication | undefined;

async function boot(ids: readonly ModuleId[]) {
	const moduleRef = await Test.createTestingModule({
		imports: [...ALWAYS_MOUNTED, ...apiModulesFor(ids, FIXTURES)],
	}).compile();

	app = moduleRef.createNestApplication({ bodyParser: false });
	await app.init();

	const { appRouter } = app.get(AppRouterHost);
	const mounted = Object.keys(appRouter._def.procedures).filter((name) =>
		name.startsWith("fixture"),
	);

	return { server: app.getHttpServer(), mounted: mounted.sort() };
}

afterEach(async () => {
	await app?.close();
	app = undefined;
	resetModules();
});

describe("which modules the API mounts", () => {
	it(
		"mounts nothing of a module when the config has none",
		async () => {
			const { server, mounted } = await boot([]);

			expect(mounted).toEqual([]);
			await request(server).get("/api/trpc/fixtureCrm.ping").expect(404);
			await request(server).get("/api/trpc/fixtureBooks.ping").expect(404);
		},
		BOOT_TIMEOUT_MS,
	);

	it(
		"mounts exactly the modules that are switched on",
		async () => {
			const { server, mounted } = await boot(["bookkeeping"]);

			expect(mounted).toEqual(["fixtureBooks.ping"]);
			await request(server).get("/api/trpc/fixtureBooks.ping").expect(200);
			await request(server).get("/api/trpc/fixtureCrm.ping").expect(404);
		},
		BOOT_TIMEOUT_MS,
	);

	it(
		"mounts every module when every module is on",
		async () => {
			const { server, mounted } = await boot(["crm", "bookkeeping"]);

			expect(mounted).toEqual(["fixtureBooks.ping", "fixtureCrm.ping"]);
			await request(server).get("/api/trpc/fixtureCrm.ping").expect(200);
			await request(server).get("/api/trpc/fixtureBooks.ping").expect(200);
		},
		BOOT_TIMEOUT_MS,
	);
});

describe("the real registry", () => {
	it("lists an entry for every module, so a new module cannot be forgotten", () => {
		expect(Object.keys(MODULE_API).sort()).toEqual(["bookkeeping", "crm"]);
	});

	it("follows the active client's modules", () => {
		useModules(["crm", "bookkeeping"]);
		const withAll = enabledApiModules();

		useModules([]);

		expect(enabledApiModules()).toEqual([]);
		expect(withAll).toEqual([...MODULE_API.crm, ...MODULE_API.bookkeeping]);
	});
});
