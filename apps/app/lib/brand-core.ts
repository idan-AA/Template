import type { ClientConfig } from "@app/modules/define-client";
import type { Metadata, MetadataRoute } from "next";

/**
 * Everything a screen shows about WHO this deploy is comes from the active
 * client's `brand` (clients/<id>/client.config.ts). This file is the pure part
 * (a config in, plain data out) so a test can prove a second client changes
 * every surface. `lib/brand.ts` binds it to the running client.
 */

/** The logo and favicon are served from these fixed URLs (app/brand/[file]/route.tsx). */
export const BRAND_LOGO_URL = "/brand/logo.svg";
export const BRAND_FAVICON_URL = "/brand/favicon.svg";
const BRAND_APPLE_ICON_URL = "/brand/apple-touch-icon.png";
const BRAND_PWA_ICON_192_URL = "/brand/icon-192.png";
const BRAND_PWA_ICON_512_URL = "/brand/icon-512.png";

export type Brand = {
	name: string;
	shortName: string;
	tagline: string | null;
	primaryColor: string;
	supportEmail: string;
	domain: string;
	logoUrl: string;
	faviconUrl: string;
};

export function brandOf(config: ClientConfig): Brand {
	const { brand } = config;

	return {
		name: brand.name,
		shortName: brand.shortName,
		tagline: brand.tagline ?? null,
		primaryColor: brand.primaryColor,
		supportEmail: brand.supportEmail,
		domain: brand.domain,
		logoUrl: BRAND_LOGO_URL,
		faviconUrl: BRAND_FAVICON_URL,
	};
}

export function metadataOf(brand: Brand): Metadata {
	return {
		title: { default: brand.name, template: `%s · ${brand.name}` },
		description: brand.tagline ?? brand.name,
		icons: {
			icon: [{ url: brand.faviconUrl, type: "image/svg+xml" }],
			apple: BRAND_APPLE_ICON_URL,
		},
		manifest: "/manifest.webmanifest",
	};
}

export function manifestOf(brand: Brand): MetadataRoute.Manifest {
	return {
		name: brand.name,
		short_name: brand.shortName,
		description: brand.tagline ?? brand.name,
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: brand.primaryColor,
		icons: [
			{ src: brand.faviconUrl, sizes: "any", type: "image/svg+xml" },
			{
				src: BRAND_PWA_ICON_192_URL,
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: BRAND_PWA_ICON_512_URL,
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}

function channels(hex: string): [number, number, number] {
	const value = Number.parseInt(hex.slice(1), 16);

	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
	return `#${[r, g, b]
		.map((part) => Math.round(part).toString(16).padStart(2, "0"))
		.join("")}`;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
function luminance(hex: string): number {
	const [r, g, b] = channels(hex).map((part) => {
		const s = part / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	}) as [number, number, number];

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The text colour that stays readable on a button filled with `hex`. */
export function readableOn(hex: string): "#ffffff" | "#111111" {
	return luminance(hex) > 0.4 ? "#111111" : "#ffffff";
}

/** Blends toward white. Used for the focus ring in dark mode only (docs/design.md). */
export function lighten(hex: string, amount: number): string {
	const [r, g, b] = channels(hex);

	return toHex([
		r + (255 - r) * amount,
		g + (255 - g) * amount,
		b + (255 - b) * amount,
	]);
}

/**
 * The brand colour as CSS variables. Same primary in both themes; only the
 * ring lightens in dark (docs/design.md, Colour). `html:root` and `html.dark`
 * out-rank the plain `:root` and `.dark` blocks in globals.css whatever order
 * the stylesheets load in. The colour is a validated 6-digit hex, so it is safe
 * to put in a style tag.
 */
export function brandCss(hex: string): string {
	const on = readableOn(hex);
	const shared = `--primary:${hex};--primary-foreground:${on};--sidebar-primary:${hex};--sidebar-primary-foreground:${on};`;

	return `html:root{${shared}--ring:${hex}}html.dark{${shared}--ring:${lighten(hex, 0.45)}}`;
}

/** What the header calls this install: the workspace's name, or the brand until it has one. */
export function headerLabel(
	workspaceName: string | undefined,
	brandName: string,
): string {
	const trimmed = workspaceName?.trim();

	// "CRM" is the placeholder name a brand-new workspace gets
	// (DEFAULT_WORKSPACE_NAME in @app/auth). It is not a name anybody chose.
	if (!trimmed || trimmed.toUpperCase() === "CRM") return brandName;

	return trimmed;
}
