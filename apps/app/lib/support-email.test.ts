import { describe, expect, it } from "bun:test";
import { usableSupportEmail } from "./support-email";

describe("usableSupportEmail", () => {
	it("keeps a real address", () => {
		expect(usableSupportEmail("help@salonco.com")).toBe("help@salonco.com");
		expect(usableSupportEmail("  help@salonco.com ")).toBe("help@salonco.com");
	});

	it("drops the template placeholder and its relatives", () => {
		expect(usableSupportEmail("support@example.com")).toBeNull();
		expect(usableSupportEmail("support@Example.COM")).toBeNull();
		expect(usableSupportEmail("support@example.invalid")).toBeNull();
		expect(usableSupportEmail("support@example.org")).toBeNull();
	});

	it("drops empty and malformed values", () => {
		expect(usableSupportEmail(undefined)).toBeNull();
		expect(usableSupportEmail("")).toBeNull();
		expect(usableSupportEmail("not-an-email")).toBeNull();
		expect(usableSupportEmail("@nowhere.com")).toBeNull();
	});
});
