import type { Db } from "@app/db";
import { writeAudit } from "@app/db/audit";
import {
	assertDateOnly,
	buildManualJournalEntry,
	type JournalLineInput,
	parseMinor,
} from "@app/modules/bookkeeping/engine";
import {
	dateOnlyToDate,
	dateToDateOnly,
	loadPostingContext,
	post,
	reverse,
} from "@app/modules/bookkeeping/ledger/posting";
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type {
	entrySource,
	journalListInput,
	journalPostInput,
	journalReverseInput,
} from "./bookkeeping.contracts";
import { BookkeepingAccess } from "./bookkeeping-access";
import { rethrowLedgerError } from "./bookkeeping-errors";

type EntrySource = z.infer<typeof entrySource>;

/** A reversal's memo reads "Reversal of JE-000001: <reason>"; this returns the reason part. */
function reversalReason(memo: string | null): string | null {
	if (!memo) return null;

	const at = memo.indexOf(": ");
	const reason = at === -1 ? memo : memo.slice(at + 2);

	return reason.trim() === "" ? null : reason.trim();
}

type LockCheck = {
	lockDate: string | null;
	hardLockDate: string | null;
};

@Injectable()
export class JournalService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(BookkeepingAccess) private readonly access: BookkeepingAccess,
	) {}

	async list(userId: string, input: z.infer<typeof journalListInput>) {
		await this.access.assert(userId, "bookkeeping.reports");

		const settings = await this.db.ledgerSettings.findUnique({
			where: { id: "ledger" },
			select: { baseCurrency: true },
		});
		if (!settings) {
			throw new NotFoundException(
				"The books are not set up on this deploy yet.",
			);
		}

		const where = {
			status: "POSTED" as const,
			source: input.source,
			date: {
				gte: input.from ? dateOnlyToDate(input.from) : undefined,
				lte: input.to ? dateOnlyToDate(input.to) : undefined,
			},
		};

		const [total, entries] = await Promise.all([
			this.db.journalEntry.count({ where }),
			this.db.journalEntry.findMany({
				where,
				orderBy: [{ date: "desc" }, { number: "desc" }],
				skip: (input.page - 1) * input.pageSize,
				take: input.pageSize,
				select: {
					id: true,
					number: true,
					date: true,
					source: true,
					memo: true,
					postedAt: true,
					postedById: true,
					reversedBy: { select: { id: true } },
					reverses: { select: { number: true } },
				},
			}),
		]);

		const ids = entries.map((entry) => entry.id);
		const [sums, people] = await Promise.all([
			this.db.journalLine.groupBy({
				by: ["entryId"],
				where: { entryId: { in: ids } },
				_sum: { baseDebitMinor: true },
			}),
			this.peopleByIds(entries.map((entry) => entry.postedById)),
		]);
		const totalById = new Map(
			sums.map((row) => [row.entryId, row._sum.baseDebitMinor ?? 0n]),
		);

		return {
			baseCurrency: settings.baseCurrency,
			total,
			page: input.page,
			pageSize: input.pageSize,
			rows: entries.map((entry) => ({
				id: entry.id,
				number: entry.number ?? "",
				date: dateToDateOnly(entry.date),
				source: entry.source as EntrySource,
				memo: entry.memo,
				totalBase: (totalById.get(entry.id) ?? 0n).toString(),
				postedAt: entry.postedAt?.toISOString() ?? null,
				postedBy: entry.postedById
					? (people.get(entry.postedById) ?? null)
					: null,
				reversed: entry.reversedBy !== null,
				reversesNumber: entry.reverses?.number ?? null,
			})),
		};
	}

	async byId(userId: string, id: string) {
		await this.access.assert(userId, "bookkeeping.reports");

		const entry = await this.db.journalEntry.findUnique({
			where: { id },
			include: {
				lines: {
					orderBy: { lineNo: "asc" },
					include: { account: { select: { code: true, name: true } } },
				},
				reverses: { select: { id: true, number: true } },
				reversedBy: {
					select: {
						id: true,
						number: true,
						memo: true,
						postedAt: true,
						postedById: true,
					},
				},
			},
		});
		if (!entry || entry.status !== "POSTED") {
			throw new NotFoundException("No journal entry with that id.");
		}

		const [events, people] = await Promise.all([
			this.db.auditEvent.findMany({
				where: { entityType: "JournalEntry", entityId: id },
				orderBy: { at: "asc" },
				select: {
					id: true,
					at: true,
					action: true,
					summary: true,
					actorLabel: true,
					reason: true,
				},
			}),
			this.peopleByIds([entry.postedById, entry.reversedBy?.postedById ?? null]),
		]);

		let totalDebit = 0n;
		let totalCredit = 0n;
		for (const line of entry.lines) {
			totalDebit += line.baseDebitMinor;
			totalCredit += line.baseCreditMinor;
		}

		return {
			id: entry.id,
			number: entry.number ?? "",
			date: dateToDateOnly(entry.date),
			source: entry.source as EntrySource,
			memo: entry.memo,
			baseCurrency: entry.baseCurrency,
			postedAt: entry.postedAt?.toISOString() ?? null,
			postedBy: entry.postedById
				? (people.get(entry.postedById) ?? null)
				: null,
			canReverse: entry.source !== "REVERSAL" && entry.reversedBy === null,
			reverses: entry.reverses
				? { id: entry.reverses.id, number: entry.reverses.number ?? "" }
				: null,
			reversedBy: entry.reversedBy
				? {
						id: entry.reversedBy.id,
						number: entry.reversedBy.number ?? "",
						postedAt: entry.reversedBy.postedAt?.toISOString() ?? null,
						postedBy: entry.reversedBy.postedById
							? (people.get(entry.reversedBy.postedById) ?? null)
							: null,
						// The reversal's memo is "Reversal of JE-n: <reason>"; the reason is what follows.
						reason: reversalReason(entry.reversedBy.memo),
					}
				: null,
			lines: entry.lines.map((line) => ({
				lineNo: line.lineNo,
				accountId: line.accountId,
				accountCode: line.account.code,
				accountName: line.account.name,
				kind: line.kind,
				currency: line.currency,
				debit: line.debitMinor.toString(),
				credit: line.creditMinor.toString(),
				debitBase: line.baseDebitMinor.toString(),
				creditBase: line.baseCreditMinor.toString(),
				fxRate: line.fxRate.toString(),
				memo: line.memo,
			})),
			totalDebitBase: totalDebit.toString(),
			totalCreditBase: totalCredit.toString(),
			history: events.map((event) => ({
				id: event.id,
				at: event.at.toISOString(),
				action: event.action,
				summary: event.summary,
				actorLabel: event.actorLabel,
				reason: event.reason,
			})),
		};
	}

	/**
	 * Post a manual or adjusting journal in the base currency. There is no draft state in this
	 * round: the person reviews the balanced form, then posts, and a posted entry never changes
	 * (B2). The browser sends one `requestKey` per form, so a double click posts once.
	 */
	async post(userId: string, input: z.infer<typeof journalPostInput>) {
		await this.access.assert(userId, "bookkeeping.post");
		const override = await this.overrideFor(userId, input.lockOverrideReason);
		const actor = await this.access.actorFor(userId, {
			softLockOverride: override,
		});

		try {
			return await this.db.$transaction(async (tx) => {
				const ctx = await loadPostingContext(tx, new Date().toISOString());
				const date = assertDateOnly(input.date);
				await this.assertDateOpen(date, override, input.lockOverrideReason);

				const lines: JournalLineInput[] = input.lines.map((line) => ({
					accountId: line.accountId,
					side: line.side,
					amountMinor: parseMinor(line.amount, ctx.baseCurrency),
					currency: ctx.baseCurrency,
					fx: null,
					memo: line.memo || null,
				}));

				const entry = buildManualJournalEntry(
					{
						id: input.requestKey,
						source: input.kind,
						date,
						memo: input.memo || null,
						lines,
					},
					ctx,
				);

				const result = await post(tx, entry, actor);

				if (override && result.created) {
					await writeAudit(tx, {
						module: "bookkeeping",
						actorType: actor.type,
						actorId: actor.id,
						actorLabel: actor.label ?? null,
						action: "LOCK_OVERRIDE",
						entityType: "JournalEntry",
						entityId: result.entryId,
						summary: `${result.number} posted inside the locked period`,
						reason: input.lockOverrideReason ?? null,
					});
				}

				return result;
			});
		} catch (error) {
			return rethrowLedgerError(error);
		}
	}

	/** R14: the mirror image of a posted entry, dated `date`, with a reason. Both entries stay. */
	async reverse(userId: string, input: z.infer<typeof journalReverseInput>) {
		await this.access.assert(userId, "bookkeeping.post");
		const override = await this.overrideFor(userId, input.lockOverrideReason);
		const actor = await this.access.actorFor(userId, {
			softLockOverride: override,
		});

		try {
			return await this.db.$transaction(async (tx) => {
				const date = assertDateOnly(input.date);
				await this.assertDateOpen(date, override, input.lockOverrideReason);

				const original = await tx.journalEntry.findUnique({
					where: { id: input.id },
					select: {
						status: true,
						source: true,
						reversedBy: { select: { number: true } },
					},
				});
				if (!original || original.status !== "POSTED") {
					throw new NotFoundException("No journal entry with that id.");
				}
				if (original.reversedBy) {
					throw new BadRequestException(
						`This entry has already been reversed by ${original.reversedBy.number}.`,
					);
				}

				const result = await reverse(
					tx,
					input.id,
					{ date, reason: input.reason },
					actor,
				);

				if (override && result.created) {
					await writeAudit(tx, {
						module: "bookkeeping",
						actorType: actor.type,
						actorId: actor.id,
						actorLabel: actor.label ?? null,
						action: "LOCK_OVERRIDE",
						entityType: "JournalEntry",
						entityId: result.entryId,
						summary: `${result.number} posted inside the locked period`,
						reason: input.lockOverrideReason ?? null,
					});
				}

				return result;
			});
		} catch (error) {
			return rethrowLedgerError(error);
		}
	}

	/**
	 * A reason for posting inside the soft lock counts only for people who may (bookkeeping.lock).
	 * Giving one without the key is refused rather than ignored, so nobody believes it worked.
	 */
	private async overrideFor(
		userId: string,
		reason: string | undefined,
	): Promise<boolean> {
		if (!reason) return false;

		await this.access.assert(userId, "bookkeeping.lock");

		return true;
	}

	/**
	 * Friendly pre-check of the lock dates. The database guard (G1) is the real enforcement and
	 * stays on; this only turns its refusal into advice. The hard lock stops everyone. The soft lock
	 * stops everyone except a person holding bookkeeping.lock who gives a reason.
	 */
	private async assertDateOpen(
		date: string,
		override: boolean,
		reason: string | undefined,
	): Promise<void> {
		const locks = await this.locks();

		if (locks.hardLockDate && date <= locks.hardLockDate) {
			throw new BadRequestException(
				`The books are closed through ${locks.hardLockDate}. Pick a later date.`,
			);
		}

		if (locks.lockDate && date <= locks.lockDate && !override) {
			throw new BadRequestException(
				`The books are locked through ${locks.lockDate}. Pick a later date, or ask someone who can post inside the lock to enter a reason.`,
			);
		}

		if (locks.lockDate && date <= locks.lockDate && override && !reason) {
			throw new BadRequestException("Posting inside the lock needs a reason.");
		}
	}

	private async locks(): Promise<LockCheck> {
		const settings = await this.db.ledgerSettings.findUnique({
			where: { id: "ledger" },
			select: { lockDate: true, hardLockDate: true },
		});

		return {
			lockDate: settings?.lockDate ? dateToDateOnly(settings.lockDate) : null,
			hardLockDate: settings?.hardLockDate
				? dateToDateOnly(settings.hardLockDate)
				: null,
		};
	}

	private async peopleByIds(
		ids: Array<string | null>,
	): Promise<Map<string, string>> {
		const wanted = [...new Set(ids.filter((id): id is string => id !== null))];
		if (wanted.length === 0) return new Map();

		const users = await this.db.user.findMany({
			where: { id: { in: wanted } },
			select: { id: true, name: true, email: true },
		});

		return new Map(users.map((user) => [user.id, user.name || user.email]));
	}
}
