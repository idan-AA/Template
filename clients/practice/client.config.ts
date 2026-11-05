import { defineClient } from "@app/modules/define-client";

/** Config for client "practice". Edit the brand, then enable modules. */
export default defineClient({
	brand: {
		name: "Practice",
		shortName: "Practice",
		logo: "brand/logo.svg",
		favicon: "brand/favicon.svg",
		primaryColor: "#006b4f",
		supportEmail: "support@example.com",
		emailFromName: "Practice",
		domain: "practice.example.com",
	},
	modules: ["crm", "bookkeeping"],
	locale: { currency: "USD", timezone: "UTC" },
	features: { telemetry: false, landing: false },
});
