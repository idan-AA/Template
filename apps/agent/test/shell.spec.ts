import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { shellFeaturesEnabled } from "../agent/lib/shell";

const KEYS = ["AGENT_SHELL", "RENDER"] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
	for (const key of KEYS) {
		saved[key] = process.env[key];
		delete process.env[key];
	}
});

afterEach(() => {
	for (const key of KEYS) {
		if (saved[key] === undefined) delete process.env[key];
		else process.env[key] = saved[key];
	}
});

describe("shellFeaturesEnabled", () => {
	it("is on by default off Render", () => {
		expect(shellFeaturesEnabled()).toBe(true);
	});

	it("is off on Render", () => {
		process.env.RENDER = "true";
		expect(shellFeaturesEnabled()).toBe(false);
	});

	it("lets AGENT_SHELL=1 turn it on even on Render", () => {
		process.env.RENDER = "true";
		process.env.AGENT_SHELL = "1";
		expect(shellFeaturesEnabled()).toBe(true);
	});

	it("lets AGENT_SHELL=0 turn it off anywhere", () => {
		process.env.AGENT_SHELL = "0";
		expect(shellFeaturesEnabled()).toBe(false);
	});
});
