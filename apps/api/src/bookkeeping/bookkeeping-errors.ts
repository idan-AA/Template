import { LedgerError } from "@app/modules/bookkeeping/engine";
import { BadRequestException, HttpException } from "@nestjs/common";

/**
 * The database guards (G1 to G13) refuse a forbidden change with a raised exception whose text
 * starts "G7 ledger_account_guard: ...". The raw Prisma error around it is noise for a person, so
 * pull the sentence out. A plain ledger rule from the engine already reads as a sentence.
 */
const GUARD = /\bG\d+\s+[a-z_]+:\s*([^\n]+)/;

/** Turns what a ledger call throws into a 400 a person can read. Anything unknown is rethrown. */
export function rethrowLedgerError(error: unknown): never {
	if (error instanceof HttpException) throw error;

	if (error instanceof LedgerError) {
		throw new BadRequestException(error.message);
	}

	const message = error instanceof Error ? error.message : String(error);
	const guard = GUARD.exec(message);

	if (guard?.[1]) {
		throw new BadRequestException(guard[1].trim());
	}

	throw error;
}
