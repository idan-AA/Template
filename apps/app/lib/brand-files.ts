import "server-only";

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { activeClient } from "@app/modules";

const CONTENT_TYPES = new Map([
	[".svg", "image/svg+xml"],
	[".png", "image/png"],
]);

/**
 * The repository's `clients/` folder. The app runs from `apps/app` (dev, the
 * Docker image and `next start` alike) and the image copies the whole repo, so
 * the brand files are on disk next to the code.
 */
function clientsDir(): string | null {
	const cwd = process.cwd();

	for (const candidate of [
		join(cwd, "..", "..", "clients"),
		join(cwd, "clients"),
	]) {
		if (existsSync(join(candidate, "registry.ts"))) return candidate;
	}

	return null;
}

/** A brand file of the active client ("logo" or "favicon"), or null when it is missing. */
export async function readBrandFile(
	role: "logo" | "favicon",
): Promise<{ body: Buffer; contentType: string } | null> {
	const { id, config } = activeClient();
	const root = clientsDir();

	if (!root) return null;

	const folder = resolve(root, id);
	const file = resolve(folder, config.brand[role]);

	// A config path that climbs out of the client's own folder is ignored.
	if (!file.startsWith(folder + sep)) return null;

	const contentType = CONTENT_TYPES.get(extname(file).toLowerCase());

	if (!contentType) return null;

	try {
		return {
			body: await readFile(/* turbopackIgnore: true */ file),
			contentType,
		};
	} catch {
		return null;
	}
}
