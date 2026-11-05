import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { Glob } from "bun";

/**
 * An SVG feTurbulence filter used as a CSS background froze the browser tab on
 * the sign-in and change-password pages: it is re-rasterised on every repaint.
 * Keep it out of the app's source.
 */
describe("page backgrounds", () => {
	it("use no SVG feTurbulence filters", async () => {
		const root = join(import.meta.dirname, "..");
		const offenders: string[] = [];

		for await (const file of new Glob(
			"{app,components}/**/*.{ts,tsx,css}",
		).scan(root)) {
			if (
				await Bun.file(join(root, file))
					.text()
					.then((t) => /feTurbulence/i.test(t))
			) {
				offenders.push(file);
			}
		}

		expect(offenders).toEqual([]);
	});
});
