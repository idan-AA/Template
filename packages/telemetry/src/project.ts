export const POSTHOG_KEY_VARIABLE = "TELEMETRY_POSTHOG_KEY";

export const POSTHOG_HOST_VARIABLE = "TELEMETRY_POSTHOG_HOST";

export type TelemetryProject = {
	readonly key: string;
	readonly host: string;
};

export function telemetryProject(
	env: Record<string, string | undefined> = process.env,
): TelemetryProject | null {
	const key = (env[POSTHOG_KEY_VARIABLE] ?? "").trim();
	const host = (env[POSTHOG_HOST_VARIABLE] ?? "").trim();

	if (!key || !host) return null;

	try {
		const url = new URL(host);
		if (url.protocol !== "https:" && url.protocol !== "http:") return null;
	} catch {
		return null;
	}

	return { key, host: host.replace(/\/+$/, "") };
}
