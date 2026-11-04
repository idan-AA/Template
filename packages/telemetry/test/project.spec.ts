import { describe, expect, it } from "bun:test";
import {
	POSTHOG_HOST_VARIABLE,
	POSTHOG_KEY_VARIABLE,
	telemetryProject,
} from "../src/project";

describe("telemetryProject", () => {
	it("has no destination by default", () => {
		expect(telemetryProject({})).toBeNull();
	});

	it("needs both the key and the host", () => {
		expect(telemetryProject({ [POSTHOG_KEY_VARIABLE]: "phc_x" })).toBeNull();
		expect(
			telemetryProject({ [POSTHOG_HOST_VARIABLE]: "https://ph.example.test" }),
		).toBeNull();
	});

	it("reads both from the environment and trims a trailing slash", () => {
		expect(
			telemetryProject({
				[POSTHOG_KEY_VARIABLE]: " phc_x ",
				[POSTHOG_HOST_VARIABLE]: "https://ph.example.test//",
			}),
		).toEqual({ key: "phc_x", host: "https://ph.example.test" });
	});

	it("rejects a host that is not a web address instead of throwing", () => {
		for (const host of ["not a url", "ftp://ph.example.test", "   "]) {
			expect(
				telemetryProject({
					[POSTHOG_KEY_VARIABLE]: "phc_x",
					[POSTHOG_HOST_VARIABLE]: host,
				}),
			).toBeNull();
		}
	});

	it("names both variables so the docs and the code cannot drift", () => {
		expect([POSTHOG_KEY_VARIABLE, POSTHOG_HOST_VARIABLE]).toEqual([
			"TELEMETRY_POSTHOG_KEY",
			"TELEMETRY_POSTHOG_HOST",
		]);
	});
});
