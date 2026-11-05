import { type ResolvedClient, resolveClient } from "./client-config";
import { replaceActiveClient } from "./runtime";

/**
 * For tests only. Switches the process to a client with exactly these modules
 * (the `default` client's brand), or back to whatever the environment says.
 */
export function useModules(enabled: readonly string[]): ResolvedClient {
	const client = resolveClient({
		CLIENT_ID: "default",
		ENABLED_MODULES: enabled.length > 0 ? enabled.join(",") : "none",
	});

	replaceActiveClient(client);
	return client;
}

export function resetModules(): void {
	replaceActiveClient(null);
}
