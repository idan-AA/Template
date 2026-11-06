import { afterEach, describe, expect, it } from "bun:test";
import { developerEmail, isDeveloperEmail } from "../src/developer";

afterEach(() => {
	delete process.env.DEVELOPER_EMAIL;
});

describe("the developer address", () => {
	it("is nobody when DEVELOPER_EMAIL is unset or blank", () => {
		expect(developerEmail()).toBeNull();
		expect(isDeveloperEmail("dev@example.com")).toBe(false);

		process.env.DEVELOPER_EMAIL = "   ";
		expect(developerEmail()).toBeNull();
		expect(isDeveloperEmail("dev@example.com")).toBe(false);
	});

	it("matches the address ignoring case and spaces, and nobody else", () => {
		process.env.DEVELOPER_EMAIL = " Dev@Example.com ";

		expect(developerEmail()).toBe("dev@example.com");
		expect(isDeveloperEmail("DEV@example.COM")).toBe(true);
		expect(isDeveloperEmail("owner@example.com")).toBe(false);
		expect(isDeveloperEmail("")).toBe(false);
		expect(isDeveloperEmail(null)).toBe(false);
	});
});
