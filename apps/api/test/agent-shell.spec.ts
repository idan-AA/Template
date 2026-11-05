import { afterEach, describe, expect, it } from "bun:test";
import { PreconditionFailedException } from "@nestjs/common";
import {
	agentShellCapability,
	assertAgentShell,
	SHELL_UNAVAILABLE_REASON,
	shellFeaturesEnabled,
} from "../src/agent/agent-shell";
import { AgentsRouter } from "../src/agent/agents.router";

const saved = {
	RENDER: process.env.RENDER,
	AGENT_SHELL: process.env.AGENT_SHELL,
};

afterEach(() => {
	for (const [key, value] of Object.entries(saved)) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
});

describe("shellFeaturesEnabled", () => {
	it("is on when nothing says otherwise", () => {
		expect(shellFeaturesEnabled({})).toBe(true);
	});

	it("is off on Render", () => {
		expect(shellFeaturesEnabled({ RENDER: "true" })).toBe(false);
	});

	it("AGENT_SHELL=1 turns it on even on Render, 0 turns it off anywhere", () => {
		expect(shellFeaturesEnabled({ RENDER: "true", AGENT_SHELL: "1" })).toBe(
			true,
		);
		expect(shellFeaturesEnabled({ AGENT_SHELL: "0" })).toBe(false);
	});
});

describe("capability and guard", () => {
	it("reports the reason when off and nothing when on", () => {
		expect(agentShellCapability({ RENDER: "true" })).toEqual({
			shell: false,
			reason: SHELL_UNAVAILABLE_REASON,
		});
		expect(agentShellCapability({})).toEqual({ shell: true, reason: null });
	});

	it("the router query answers from the live environment", () => {
		process.env.RENDER = "true";
		delete process.env.AGENT_SHELL;
		expect(AgentsRouter.prototype.capabilities.call(null).shell).toBe(false);

		process.env.AGENT_SHELL = "1";
		expect(AgentsRouter.prototype.capabilities.call(null).shell).toBe(true);
	});

	it("assertAgentShell refuses with the plain message when off, passes when on", () => {
		process.env.RENDER = "true";
		delete process.env.AGENT_SHELL;
		expect(() => assertAgentShell()).toThrow(PreconditionFailedException);
		expect(() => assertAgentShell()).toThrow(
			"Not available on this deployment",
		);

		process.env.AGENT_SHELL = "1";
		expect(() => assertAgentShell()).not.toThrow();
	});
});
