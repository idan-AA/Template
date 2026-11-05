import { defineClient } from "@app/modules/define-client";

/**
 * The client that boots when `CLIENT_ID` is not set: neutral brand, no modules.
 * Copy this folder to start a new client.
 */
export default defineClient({
	brand: {
		name: "Template",
		shortName: "Template",
		logo: "brand/logo.svg",
		favicon: "brand/favicon.svg",
		primaryColor: "#006b4f",
		supportEmail: "support@example.com",
		emailFromName: "Template",
		domain: "localhost",
	},
	modules: [],
	locale: { currency: "USD", timezone: "UTC" },
	features: { telemetry: false, landing: false },
});
