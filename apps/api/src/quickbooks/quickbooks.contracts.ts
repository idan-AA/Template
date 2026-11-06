import { z } from "zod";

export const connectionStatusSchema = z.enum([
	"CONNECTED",
	"NEEDS_RECONNECT",
	"DISCONNECTED",
]);

export const quickbooksStatusOutput = z.object({
	/** False until the deploy has its Intuit keys and the encryption key. */
	configured: z.boolean(),
	environment: z.enum(["sandbox", "production"]),
	/** Whether the caller may connect, reconnect and disconnect. */
	canConnect: z.boolean(),
	/** The address to register in the Intuit app. Only sent to people who can connect. */
	redirectUri: z.string().nullable(),
	/** Null until QuickBooks has been connected at least once. */
	connection: z
		.object({
			status: connectionStatusSchema,
			companyName: z.string().nullable(),
			/** Intuit's company id, shown so support can match it to the right company. */
			realmId: z.string(),
			homeCurrency: z.string().nullable(),
			country: z.string().nullable(),
			connectedAt: z.string().nullable(),
			connectedBy: z.string().nullable(),
			lastCheckedAt: z.string().nullable(),
			lastSyncedAt: z.string().nullable(),
			/** A plain sentence; never contains a token. */
			lastError: z.string().nullable(),
		})
		.nullable(),
});

export type QuickbooksStatus = z.infer<typeof quickbooksStatusOutput>;

export const connectStartOutput = z.object({
	/** Where to send the browser: Intuit's consent page. */
	url: z.string(),
});

export const disconnectOutput = z.object({
	/** False when Intuit could not be told; our copy of the connection is gone either way. */
	revokedAtIntuit: z.boolean(),
});
