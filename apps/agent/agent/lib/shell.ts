export function shellFeaturesEnabled(): boolean {
	const explicit = process.env.AGENT_SHELL?.trim();

	if (explicit === "1") return true;
	if (explicit === "0") return false;

	return !process.env.RENDER;
}

export const SHELL_OFF_REASON =
	"The agent builder and the deployed team agents need a sandbox with a real shell. " +
	"This host has none, so they are switched off. Set AGENT_SHELL=1 only on a host with a real sandbox.";

let announced = false;

/**
 * Says once per process, in the log, why queued builder chats and team-agent runs are
 * not being picked up. Without this the gate is silent: rows sit QUEUED forever and
 * nobody can tell from the logs that it is by design. (A guard nobody can see is a
 * guard nobody trusts.)
 */
export function shellOffNoticeOnce(
	warn: (message: string) => void = console.warn,
): boolean {
	if (shellFeaturesEnabled()) return false;
	if (!announced) {
		announced = true;
		warn(`[agent] ${SHELL_OFF_REASON}`);
	}
	return true;
}

/** Test seam: forget that the notice was printed. */
export function resetShellOffNotice(): void {
	announced = false;
}
