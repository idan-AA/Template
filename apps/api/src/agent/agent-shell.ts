import { PreconditionFailedException } from "@nestjs/common";

/**
 * Whether this deployment can run the agent builder and deployed team agents.
 * They need a sandbox with a real shell; Render has none, so they are off there
 * unless `AGENT_SHELL=1`. This is the same rule as `shellFeaturesEnabled` in
 * `apps/agent/agent/lib/shell.ts`; the API and the agent are separate processes
 * and must decide alike, so both read `RENDER` and `AGENT_SHELL`. Set `AGENT_SHELL`
 * in the shared env group, never on one service.
 */
export function shellFeaturesEnabled(
	env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
	const explicit = env.AGENT_SHELL?.trim();

	if (explicit === "1") return true;
	if (explicit === "0") return false;

	return !env.RENDER;
}

const SHELL_UNAVAILABLE_TITLE = "Not available on this deployment";

export const SHELL_UNAVAILABLE_REASON =
	"The agent builder and team agents need a sandbox with a shell, and this host does not provide one.";

export function agentShellCapability(
	env: Readonly<Record<string, string | undefined>> = process.env,
): { shell: boolean; reason: string | null } {
	return shellFeaturesEnabled(env)
		? { shell: true, reason: null }
		: { shell: false, reason: SHELL_UNAVAILABLE_REASON };
}

/** Call first in anything that would queue builder or team-agent work. */
export function assertAgentShell(): void {
	if (!shellFeaturesEnabled()) {
		throw new PreconditionFailedException(
			`${SHELL_UNAVAILABLE_TITLE}. ${SHELL_UNAVAILABLE_REASON}`,
		);
	}
}
