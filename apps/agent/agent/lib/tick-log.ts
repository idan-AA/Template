export type TickCounts = {
	factsScanned: number;
	factsFilled: number;
	staleClosed: number;
	staleRetired: number;
	tasksStarted: number;
	agentRunsQueued: number;
	builderPending: number;
	runsPending: number;
};

/**
 * The single log line the per-minute dispatch tick prints. One line, JSON, with a
 * fixed `event` so a deploy check can grep for it (docs/setup.md).
 */
export function tickLine(
	counts: TickCounts,
	durationMs: number,
	error?: string,
	shell: "on" | "off" = "on",
): string {
	return JSON.stringify({
		event: "agent.dispatch.tick",
		// "off" means builder chats and team-agent runs are not picked up on purpose
		// (shell.ts), so builderPending 0 does not mean nothing is queued.
		shell,
		...counts,
		durationMs,
		...(error === undefined ? {} : { error }),
	});
}
