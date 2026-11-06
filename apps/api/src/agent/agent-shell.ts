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

/**
 * Whether this deployment has an agent service at all. The one question every
 * agent gate asks: queueing enrichment, re-enrich, research, the Enrichment chip
 * and the agent screens. `AGENT_URL` set means a service was wired in; unset on
 * Render means there is none (the free practice deploy); unset anywhere else is
 * local dev, where the agent answers on its default localhost port. No new
 * variable: it is the same `AGENT_URL` the bridge already dials.
 */
export function agentServiceEnabled(
	env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
	if (env.AGENT_URL?.trim()) return true;

	return !env.RENDER;
}

const AGENT_UNAVAILABLE_TITLE = "Not available on this deployment";

export const AGENT_UNAVAILABLE_REASON =
	"This workspace has no research agent, so records are not looked up automatically. Fill in the details by hand.";

/** Call first in anything that would ask the research agent to look something up. */
export function assertAgentService(): void {
	if (!agentServiceEnabled()) {
		throw new PreconditionFailedException(
			`${AGENT_UNAVAILABLE_TITLE}. ${AGENT_UNAVAILABLE_REASON}`,
		);
	}
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

/**
 * What the web app reads to hide or explain agent screens: the shell answer
 * (Chat, builder, team agents) plus whether any agent service exists (enrichment,
 * research, the Enrichment chip). One query, one place.
 */
export function agentCapabilities(
	env: Readonly<Record<string, string | undefined>> = process.env,
): { shell: boolean; reason: string | null; agent: boolean } {
	return { ...agentShellCapability(env), agent: agentServiceEnabled(env) };
}

/** Call first in anything that would queue builder or team-agent work. */
export function assertAgentShell(): void {
	if (!shellFeaturesEnabled()) {
		throw new PreconditionFailedException(
			`${SHELL_UNAVAILABLE_TITLE}. ${SHELL_UNAVAILABLE_REASON}`,
		);
	}
}
