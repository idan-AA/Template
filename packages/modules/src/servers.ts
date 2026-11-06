import type { ModuleServer } from "./define-server";
import type { ModuleId } from "./registry";

const SERVERS = {
	crm: async () => (await import("../crm/server")).default,
	bookkeeping: async () => (await import("../bookkeeping/server")).default,
	quickbooks: async () => (await import("../quickbooks/server")).default,
} satisfies Record<ModuleId, () => Promise<ModuleServer>>;

/** Loads a module's server half on demand, so the browser never pulls it in. */
export function loadServer(id: ModuleId): Promise<ModuleServer> {
	return SERVERS[id]();
}
