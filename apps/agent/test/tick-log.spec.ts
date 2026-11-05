import { describe, expect, it } from "bun:test";
import { type TickCounts, tickLine } from "../agent/lib/tick-log";

const counts: TickCounts = {
	factsScanned: 3,
	factsFilled: 1,
	staleClosed: 0,
	staleRetired: 2,
	tasksStarted: 4,
	agentRunsQueued: 0,
	builderPending: 0,
	runsPending: 0,
};

describe("tickLine", () => {
	it("is one line of JSON with a fixed event name", () => {
		const line = tickLine(counts, 120);

		expect(line).not.toContain("\n");
		expect(JSON.parse(line)).toEqual({
			event: "agent.dispatch.tick",
			shell: "on",
			...counts,
			durationMs: 120,
		});
	});

	it("says the shell is off so a zero builderPending is not read as nothing queued", () => {
		const parsed = JSON.parse(tickLine(counts, 5, undefined, "off"));

		expect(parsed.shell).toBe("off");
	});

	it("carries the error on a failed tick", () => {
		const parsed = JSON.parse(tickLine(counts, 5, "database down"));

		expect(parsed.error).toBe("database down");
		expect(parsed.event).toBe("agent.dispatch.tick");
	});
});
