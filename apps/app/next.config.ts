import { loadRootEnv } from "@app/env";
import { activeClient } from "@app/modules";
import type { NextConfig } from "next";

loadRootEnv();

// Fail the build or the dev server, with a message, on a bad CLIENT_ID or module list.
activeClient();

const apiUrl =
	process.env.API_URL ??
	process.env.NEXT_PUBLIC_API_URL ??
	"http://localhost:3001";

const allowedDevOrigins = (process.env.APP_URL ?? "")
	.split(",")
	.flatMap((origin) => {
		try {
			return [new URL(origin.trim()).hostname];
		} catch {
			return [];
		}
	});

const nextConfig: NextConfig = {
	// A second build (a check beside a running dev server) must not share `.next`.
	distDir: process.env.NEXT_DIST_DIR || ".next",

	allowedDevOrigins,

	env: {
		NEXT_PUBLIC_API_URL: apiUrl,
	},

	transpilePackages: [
		"@app/auth",
		"@app/clients",
		"@app/db",
		"@app/modules",
		"@app/telemetry",
		"@app/ui",
	],

	serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],

	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
		],
	},

	cacheComponents: true,
	partialPrefetching: true,
};

export default nextConfig;
