import type { SandboxSession } from "eve/sandbox";

type NetworkControlledSandbox = SandboxSession & {
	setNetworkPolicy(policy: "deny-all"): Promise<void>;
};

function controlsNetwork(
	sandbox: SandboxSession,
): sandbox is NetworkControlledSandbox {
	return "setNetworkPolicy" in sandbox;
}

let warned = false;

export async function denySandboxNetwork<T extends SandboxSession>(
	sandbox: T,
): Promise<T> {
	if (controlsNetwork(sandbox)) {
		await sandbox.setNetworkPolicy("deny-all");
		return sandbox;
	}

	if (!warned) {
		warned = true;
		console.warn(
			"[agent] this sandbox provider cannot enforce a network policy, so deny-all is not applied",
		);
	}

	return sandbox;
}
