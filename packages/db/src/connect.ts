import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

/**
 * A client for a database other than the shared one in `client.ts`. Tests use
 * it for a database they cloned or created themselves (the ledger guards forbid
 * DELETE and TRUNCATE, so a ledger test cannot clean up after itself and gets
 * a fresh database instead). The caller owns the client and must disconnect it.
 */
export function connectTo(connectionString: string): PrismaClient {
	return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
