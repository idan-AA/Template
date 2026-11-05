import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { createPasswordUser } from "@app/auth/credentials";
import { enrolInWorkspace } from "@app/auth/organization";
import { db } from "@app/db";
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
 * The shell gate through the real HTTP stack: a signed-in user calls the real
 * tRPC mutations while the sandbox shell is off and is refused with 412 and the
 * plain reason, and the capability query tells the app so it can disable the
 * controls. With the shell on, the same call gets past the gate.
 */

const RUN = Date.now().toString(36);
const ORIGIN = "http://localhost:3000";
const EMAIL = `shell-${RUN}@shell.test`;
const PASSWORD = "correct horse battery staple";
const saved = {
	RENDER: process.env.RENDER,
	AGENT_SHELL: process.env.AGENT_SHELL,
};

let app: INestApplication;
let server: ReturnType<INestApplication["getHttpServer"]>;
let cookie = "";

const post = (
	procedure: string,
	body: Record<string, string | number | boolean | undefined>,
) =>
	request(server)
		.post(`/api/trpc/${procedure}`)
		.set("Origin", ORIGIN)
		.set("Cookie", cookie)
		.send(body);

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleRef.createNestApplication({ bodyParser: false });
	await app.init();
	server = app.getHttpServer();

	await db.$transaction(async (tx) => {
		const created = await createPasswordUser(tx, {
			name: "Shell Tester",
			email: EMAIL,
			password: PASSWORD,
			passwordChangeRequired: false,
		});
		await enrolInWorkspace(tx, created.id, "member");
	});

	const signedIn = await request(server)
		.post("/api/auth/sign-in/email")
		.set("Origin", ORIGIN)
		.set("X-Forwarded-For", "10.78.0.1")
		.send({ email: EMAIL, password: PASSWORD });
	const cookies = signedIn.headers["set-cookie"] as unknown as string[];
	const session = cookies.find((entry) => entry.includes("session_token"));
	if (!session) throw new Error("no session cookie came back");
	cookie = session.split(";")[0] as string;
}, 90_000);

afterAll(async () => {
	for (const [key, value] of Object.entries(saved)) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
	await db.user.deleteMany({
		where: { email: { endsWith: `-${RUN}@shell.test` } },
	});
	await app?.close();
});

describe("with the agent shell off", () => {
	it("tells the app through agents.capabilities", async () => {
		process.env.AGENT_SHELL = "0";
		const response = await request(server)
			.get("/api/trpc/agents.capabilities")
			.set("Origin", ORIGIN)
			.set("Cookie", cookie);

		expect(response.status).toBe(200);
		expect(response.body.result.data.shell).toBe(false);
		expect(response.body.result.data.reason).toContain("sandbox");
	});

	it("refuses to deploy a team agent with 412 and the plain reason", async () => {
		process.env.AGENT_SHELL = "0";
		const response = await post("agents.deploy", {
			id: "any-agent",
			versionId: "any-version",
			clientRequestId: crypto.randomUUID(),
		});

		expect(response.status).toBe(412);
		expect(JSON.stringify(response.body)).toContain(
			"Not available on this deployment",
		);
	});

	it("refuses to run a team agent now with 412", async () => {
		process.env.AGENT_SHELL = "0";
		const response = await post("agents.runNow", {
			id: "any-agent",
			clientRequestId: crypto.randomUUID(),
		});

		expect(response.status).toBe(412);
	});
});

describe("with the agent shell on (a Render-shaped boot)", () => {
	it("reports it available even though RENDER is set", async () => {
		process.env.RENDER = "true";
		process.env.AGENT_SHELL = "1";
		const response = await request(server)
			.get("/api/trpc/agents.capabilities")
			.set("Origin", ORIGIN)
			.set("Cookie", cookie);

		expect(response.status).toBe(200);
		expect(response.body.result.data).toEqual({ shell: true, reason: null });
	});

	it("lets deploy past the gate (it then fails on the missing agent, not 412)", async () => {
		process.env.RENDER = "true";
		process.env.AGENT_SHELL = "1";
		const response = await post("agents.deploy", {
			id: "any-agent",
			versionId: "any-version",
			clientRequestId: crypto.randomUUID(),
		});

		expect(response.status).not.toBe(412);
	});
});
