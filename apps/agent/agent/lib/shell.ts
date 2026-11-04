export function shellFeaturesEnabled(): boolean {
	const explicit = process.env.AGENT_SHELL?.trim();

	if (explicit === "1") return true;
	if (explicit === "0") return false;

	return !process.env.RENDER;
}

export const SHELL_OFF_REASON =
	"The agent builder and the deployed team agents need a sandbox with a real shell. " +
	"This host has none, so they are switched off. Set AGENT_SHELL=1 only on a host with a real sandbox.";
