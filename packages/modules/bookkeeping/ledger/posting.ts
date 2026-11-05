import type { Prisma } from "@app/db";
import { type AuditActorType, writeAudit } from "@app/db/audit";
import { lockIdempotencyKey } from "@app/db/idempotency";
import {
	type AccountInfo,
	buildReversal,
	LedgerError,
	type PostedEntryView,
	type PostingContext,
	type PostingInput,
	type PostingLine,
	validatePosting,
} from "../engine";

type Tx = Prisma.TransactionClient;

/** Who is acting. Becomes the session variables the database guards read, and the audit row. */
export interface Actor {
	type: AuditActorType;
	id: string | null;
	label?: string | null;
	/** Only for users holding bookkeeping.lock: post on or before the soft lock date. */
	softLockOverride?: boolean;
	/** Only the owner service call: lower a lock date. */
	reopen?: boolean;
	requestId?: string | null;
}

export function dateOnlyToDate(value: string): Date {
	return new Date(`${value}T00:00:00.000Z`);
}

export function dateToDateOnly(value: Date): string {
	return value.toISOString().slice(0, 10);
}

export interface PostResult {
	entryId: string;
	number: string;
	created: boolean;
}

/** Sets the session variables the guards read. Call at the top of every ledger transaction. */
export async function setSession(tx: Tx, actor: Actor): Promise<void> {
	await tx.$executeRaw`SELECT set_config('app.actor_type', ${actor.type}, true)`;
	await tx.$executeRaw`SELECT set_config('app.actor_id', ${actor.id ?? ""}, true)`;
	await tx.$executeRaw`SELECT set_config('app.soft_lock_override', ${actor.softLockOverride ? "on" : "off"}, true)`;
	await tx.$executeRaw`SELECT set_config('app.reopen', ${actor.reopen ? "on" : "off"}, true)`;
}

/** Reads settings and accounts so the pure builders can run with real ids. */
export async function loadPostingContext(
	tx: Tx,
	now: string,
): Promise<PostingContext> {
	const settings = await tx.ledgerSettings.findUniqueOrThrow({
		where: { id: "ledger" },
	});
	const rows = await tx.ledgerAccount.findMany();
	const accounts = new Map<string, AccountInfo>();
	const byRole = new Map<string, string>();
	for (const a of rows) {
		accounts.set(a.id, {
			id: a.id,
			type: a.type,
			subtype: a.subtype,
			systemRole: a.systemRole,
			archived: a.archivedAt !== null,
			currency: a.currency,
		});
		if (a.systemRole) byRole.set(a.systemRole, a.id);
	}
	const need = (role: string): string => {
		const id = byRole.get(role);
		if (!id)
			throw new LedgerError(
				"ACCOUNTS_REQUIRED",
				`System account ${role} is missing. Run the seed.`,
			);
		return id;
	};
	return {
		baseCurrency: settings.baseCurrency,
		now,
		accounts,
		systemAccounts: {
			receivable: need("ACCOUNTS_RECEIVABLE"),
			payable: need("ACCOUNTS_PAYABLE"),
			fxGainLoss: need("FX_GAIN_LOSS"),
			rounding: need("ROUNDING"),
			suspense: need("SUSPENSE"),
			openingBalanceEquity: need("OPENING_BALANCE_EQUITY"),
		},
	};
}

export async function loadEntryView(
	tx: Tx,
	entryId: string,
): Promise<PostedEntryView> {
	const e = await tx.journalEntry.findUniqueOrThrow({
		where: { id: entryId },
		include: { lines: { orderBy: { lineNo: "asc" } } },
	});
	return {
		id: e.id,
		number: e.number,
		date: dateToDateOnly(e.date),
		source: e.source,
		baseCurrency: e.baseCurrency,
		reversesId: e.reversesId,
		lines: e.lines.map(
			(l): PostingLine => ({
				accountId: l.accountId,
				kind: l.kind,
				side: l.debitMinor > 0n ? "DEBIT" : "CREDIT",
				currency: l.currency,
				amountMinor: l.debitMinor > 0n ? l.debitMinor : l.creditMinor,
				baseAmountMinor:
					l.debitMinor > 0n ? l.baseDebitMinor : l.baseCreditMinor,
				fxRate: l.fxRate.toString(),
				fxOrigin: l.fxOrigin,
				fxRateAt: l.fxRateAt.toISOString(),
				counterpartyId: l.counterpartyId,
				documentId: l.documentId,
				paymentId: l.paymentId,
				taxRateId: l.taxRateId,
				memo: l.memo,
			}),
		),
	};
}

export interface PostOptions {
	proposalId?: string | null;
}

/**
 * The only writer of JournalEntry and JournalLine. Everything runs in the caller's
 * transaction: idempotency lock, existing-entry check, DRAFT insert, flip to POSTED
 * (the guards run on the flip), audit row.
 *
 * Cached document balances (BookDocument.balanceMinor, LedgerPayment.unallocatedMinor) do not
 * exist yet: those tables arrive in phases 3 and 4, and refreshBalances is added with them.
 */
export async function post(
	tx: Tx,
	input: PostingInput,
	actor: Actor,
	options: PostOptions = {},
): Promise<PostResult> {
	await setSession(tx, actor);
	await lockIdempotencyKey(tx, input.sourceKey);

	const existing = await tx.journalEntry.findUnique({
		where: { sourceKey: input.sourceKey },
		select: { id: true, number: true },
	});
	if (existing) {
		return {
			entryId: existing.id,
			number: existing.number ?? "",
			created: false,
		};
	}

	// Same lock order as guard G1: read firstPostedAt unlocked, then FOR UPDATE if this could be
	// the very first post (it sets firstPostedAt), FOR SHARE otherwise. FOR SHARE followed by the
	// trigger's FOR UPDATE would deadlock two concurrent first posters (found by T9).
	const peek = await tx.ledgerSettings.findUnique({
		where: { id: "ledger" },
		select: { firstPostedAt: true },
	});
	if (!peek)
		throw new LedgerError(
			"ACCOUNTS_REQUIRED",
			"The ledger is not set up. Run the seed.",
		);
	if (peek.firstPostedAt === null) {
		await tx.$queryRaw`SELECT 1 FROM "ledgerSettings" WHERE "id" = 'ledger' FOR UPDATE`;
	} else {
		await tx.$queryRaw`SELECT 1 FROM "ledgerSettings" WHERE "id" = 'ledger' FOR SHARE`;
	}

	const ctx = await loadPostingContext(tx, new Date().toISOString());
	validatePosting(input, ctx);

	const created = await tx.journalEntry.create({
		data: {
			date: dateOnlyToDate(input.date),
			memo: input.memo,
			status: "DRAFT",
			source: input.source,
			sourceId: input.sourceId,
			sourceKey: input.sourceKey,
			baseCurrency: input.baseCurrency,
			reversesId: input.reversesId ?? null,
			proposalId: options.proposalId ?? null,
			createdById: actor.id ?? "system",
			lines: {
				create: input.lines.map((l, i) => ({
					lineNo: i + 1,
					accountId: l.accountId,
					kind: l.kind,
					currency: l.currency,
					debitMinor: l.side === "DEBIT" ? l.amountMinor : 0n,
					creditMinor: l.side === "CREDIT" ? l.amountMinor : 0n,
					baseDebitMinor: l.side === "DEBIT" ? l.baseAmountMinor : 0n,
					baseCreditMinor: l.side === "CREDIT" ? l.baseAmountMinor : 0n,
					fxRate: l.fxRate,
					fxOrigin: l.fxOrigin,
					fxRateAt: new Date(l.fxRateAt),
					counterpartyId: l.counterpartyId ?? null,
					documentId: l.documentId ?? null,
					paymentId: l.paymentId ?? null,
					taxRateId: l.taxRateId ?? null,
					memo: l.memo ?? null,
				})),
			},
		},
		select: { id: true },
	});

	const posted = await tx.journalEntry.update({
		where: { id: created.id },
		data: { status: "POSTED", postedById: actor.id },
		select: { id: true, number: true },
	});

	await writeAudit(tx, {
		module: "bookkeeping",
		actorType: actor.type,
		actorId: actor.id,
		actorLabel: actor.label ?? null,
		requestId: actor.requestId ?? null,
		action: input.source === "REVERSAL" ? "ENTRY_REVERSED" : "ENTRY_POSTED",
		entityType: "JournalEntry",
		entityId: posted.id,
		summary: `${posted.number} ${input.source} ${input.date}`,
		after: {
			source: input.source,
			sourceKey: input.sourceKey,
			lines: input.lines.length,
		},
	});

	return { entryId: posted.id, number: posted.number ?? "", created: true };
}

/** R14: builds the mirror image of a posted entry with the engine, then posts it. */
export async function reverse(
	tx: Tx,
	entryId: string,
	options: { date: string; reason: string },
	actor: Actor,
): Promise<PostResult> {
	const original = await loadEntryView(tx, entryId);
	const ctx = await loadPostingContext(tx, new Date().toISOString());
	const input = buildReversal(original, options, ctx);
	return post(tx, input, actor);
}
