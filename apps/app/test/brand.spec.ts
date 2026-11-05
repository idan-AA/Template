import { describe, expect, it } from "bun:test";
import { DEFAULT_WORKSPACE_NAME } from "@app/auth/organization";
import { defineClient } from "@app/modules/define-client";
import defaultClient from "../../../clients/default/client.config";
import {
	BRAND_FAVICON_URL,
	BRAND_LOGO_URL,
	brandCss,
	brandOf,
	headerLabel,
	lighten,
	manifestOf,
	metadataOf,
	readableOn,
} from "../lib/brand-core";

/** A second client, built in the test so nothing is registered or left on disk. */
const salon = defineClient({
	brand: {
		name: "Glow Salon",
		shortName: "Glow",
		tagline: "Book your next visit.",
		logo: "brand/logo.svg",
		favicon: "brand/favicon.svg",
		primaryColor: "#c2185b",
		supportEmail: "hello@glow.example",
		emailFromName: "Glow Salon",
		domain: "glow.example",
	},
	modules: [],
	locale: { currency: "USD", timezone: "UTC" },
});

const FORBIDDEN = /Comp AI|trycomp|\bCRM\b/i;

describe("the page title, description and manifest follow the brand", () => {
	it("default client: neutral, nothing from the old product", () => {
		const brand = brandOf(defaultClient);
		const meta = metadataOf(brand);

		expect(meta.title).toEqual({
			default: "Template",
			template: "%s · Template",
		});
		expect(JSON.stringify([meta, manifestOf(brand)])).not.toMatch(FORBIDDEN);
	});

	it("a second client changes every one of them", () => {
		const brand = brandOf(salon);
		const meta = metadataOf(brand);
		const manifest = manifestOf(brand);

		expect(meta.title).toEqual({
			default: "Glow Salon",
			template: "%s · Glow Salon",
		});
		expect(meta.description).toBe("Book your next visit.");
		expect(manifest.name).toBe("Glow Salon");
		expect(manifest.short_name).toBe("Glow");
		expect(manifest.theme_color).toBe("#c2185b");
		expect(brand.logoUrl).toBe(BRAND_LOGO_URL);
		expect(brand.faviconUrl).toBe(BRAND_FAVICON_URL);
		expect(brand.supportEmail).toBe("hello@glow.example");
		expect(JSON.stringify([meta, manifest])).not.toMatch(FORBIDDEN);
	});

	it("every icon the manifest names is one the brand route serves", () => {
		const served = new Set([
			"/brand/favicon.svg",
			"/brand/icon-192.png",
			"/brand/icon-512.png",
		]);

		for (const icon of manifestOf(brandOf(salon)).icons ?? []) {
			expect(served.has(icon.src)).toBe(true);
		}
	});
});

describe("the brand colour", () => {
	it("is one primary in both themes; only the dark ring lightens", () => {
		const css = brandCss("#c2185b");
		const [light, dark] = css.split("html.dark");

		expect(light).toContain("--primary:#c2185b");
		expect(light).toContain("--sidebar-primary:#c2185b");
		expect(light).toContain("--ring:#c2185b");
		expect(dark).toContain("--primary:#c2185b");
		expect(dark).not.toContain("--ring:#c2185b");
		expect(dark).toContain(`--ring:${lighten("#c2185b", 0.45)}`);
	});

	it("keeps button text readable on dark and light brand colours", () => {
		expect(readableOn("#006b4f")).toBe("#ffffff");
		expect(readableOn("#c2185b")).toBe("#ffffff");
		expect(readableOn("#ffd54f")).toBe("#111111");
		expect(brandCss("#ffd54f")).toContain("--primary-foreground:#111111");
	});
});

describe("the header label", () => {
	it("shows the workspace the owner named", () => {
		expect(headerLabel("Acme Plumbing", "Glow Salon")).toBe("Acme Plumbing");
		expect(headerLabel("  Acme  ", "Glow Salon")).toBe("Acme");
	});

	it("shows the brand until somebody names the workspace, and never says CRM", () => {
		expect(headerLabel(undefined, "Glow Salon")).toBe("Glow Salon");
		expect(headerLabel("   ", "Glow Salon")).toBe("Glow Salon");
		expect(headerLabel(DEFAULT_WORKSPACE_NAME, "Glow Salon")).toBe(
			"Glow Salon",
		);
	});
});
