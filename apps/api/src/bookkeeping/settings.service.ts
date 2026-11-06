import type { Db } from "@app/db";
import { writeAudit } from "@app/db/audit";
import { businessToday } from "@app/modules/bookkeeping/engine";
import {
	dateOnlyToDate,
	dateToDateOnly,
	setSession,
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
	sequenceUpdateInput,
	settingsUpdateInput,
} from "./bookkeeping.contracts";
import { BookkeepingAccess } from "./bookkeeping-access";
import { rethrowLedgerError } from "./bookkeeping-errors";

type SettingsUpdate = z.infer<typeof settingsUpdateInput>;
type SequenceUpdate = z.infer<typeof sequenceUpdateInput>;

const NOT_SET_UP = "The books are not set up on this deploy yet.";

function example(prefix: string, padding: number, nextValue: number): string {
	return `${prefix}${String(nextValue).padStart(padding, "0")}`;
}

@Injectable()
export class SettingsService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(BookkeepingAccess) private readonly access: BookkeepingAccess,
	) {}

	async get(userId: string) {
		await this.access.assertAny(userId, [
			"bookkeeping.settings",
			"bookkeeping.lock",
			"bookkeeping.reopen",
			"bookkeeping.reports",
		]);

		const [settings, sequences, granted] = await Promise.all([
			this.db.ledgerSettings.findUnique({ where: { id: "ledger" } }),
			this.db.numberSequence.findMany({ orderBy: { key: "asc" } }),
			this.access.grantedKeys(userId),
		]);
		if (!settings) throw new NotFoundException(NOT_SET_UP);

		return {
			baseCurrency: settings.baseCurrency,
			timezone: settings.timezone,
			today: businessToday(settings.timezone),
			fiscalYearStartMonth: settings.fiscalYearStartMonth,
			lockDate: settings.lockDate ? dateToDateOnly(settings.lockDate) : null,
			hardLockDate: settings.hardLockDate
				? dateToDateOnly(settings.hardLockDate)
				: null,
			firstPostedAt: settings.firstPostedAt?.toISOString() ?? null,
			attentionStaleDays: settings.attentionStaleDays,
			setupCompletedAt: settings.setupCompletedAt?.toISOString() ?? null,
			sequences: sequences.map((row) => ({
				key: row.key,
				prefix: row.prefix,
				padding: row.padding,
				nextValue: row.nextValue,
				example: example(row.prefix, row.padding, row.nextValue),
			})),
			can: {
				settings: granted.keys.includes("bookkeeping.settings"),
				lock: granted.keys.includes("bookkeeping.lock"),
				reopen: granted.keys.includes("bookkeeping.reopen"),
			},
		};
	}

	/**
	 * Who may change what (docs/plan/bookkeeping.md section 8):
	 *  - fiscal year start and the attention window: bookkeeping.settings
	 *  - moving the soft lock date FORWARD: bookkeeping.lock
	 *  - moving the soft lock date BACKWARD or clearing it: bookkeeping.reopen
	 *  - ANY change to the hard lock date: bookkeeping.reopen (closing the books for good is a
	 *    decision for the owner, and lifting it more so)
	 * The database (G8) refuses a backward move that does not carry the reopen session flag, so a
	 * mistake here fails closed.
	 */
	async update(userId: string, input: SettingsUpdate) {
		const settingsKeyNeeded =
			input.fiscalYearStartMonth !== undefined ||
			input.attentionStaleDays !== undefined;
		if (settingsKeyNeeded) await this.access.assert(userId, "bookkeeping.settings");

		const current = await this.db.ledgerSettings.findUnique({
			where: { id: "ledger" },
		});
		if (!current) throw new NotFoundException(NOT_SET_UP);

		const oldSoft = current.lockDate ? dateToDateOnly(current.lockDate) : null;
		const oldHard = current.hardLockDate
			? dateToDateOnly(current.hardLockDate)
			: null;

		const newSoft = input.lockDate === undefined ? oldSoft : input.lockDate;
		const newHard =
			input.hardLockDate === undefined ? oldHard : input.hardLockDate;

		let reopening = false;

		if (newSoft !== oldSoft) {
			const forward = newSoft !== null && (oldSoft === null || newSoft > oldSoft);
			if (forward) {
				await this.access.assert(userId, "bookkeeping.lock");
			} else {
				await this.access.assert(userId, "bookkeeping.reopen");
				reopening = true;
			}
		}

		if (newHard !== oldHard) {
			await this.access.assert(userId, "bookkeeping.reopen");
			reopening = true;
		}

		if (newSoft && newHard && newHard > newSoft) {
			throw new BadRequestException(
				"The closed date cannot be later than the lock date. Move the lock date first.",
			);
		}

		const actor = await this.access.actorFor(userId, { reopen: reopening });

		try {
			await this.db.$transaction(async (tx) => {
				await setSession(tx, actor);

				await tx.ledgerSettings.update({
					where: { id: "ledger" },
					data: {
						fiscalYearStartMonth: input.fiscalYearStartMonth,
						attentionStaleDays: input.attentionStaleDays,
						lockDate:
							newSoft === oldSoft
								? undefined
								: newSoft
									? dateOnlyToDate(newSoft)
									: null,
						hardLockDate:
							newHard === oldHard
								? undefined
								: newHard
									? dateOnlyToDate(newHard)
									: null,
					},
				});

				const lockChanged = newSoft !== oldSoft || newHard !== oldHard;

				await writeAudit(tx, {
					module: "bookkeeping",
					actorType: actor.type,
					actorId: actor.id,
					actorLabel: actor.label ?? null,
					action: lockChanged ? "LOCK_CHANGED" : "SETTINGS_CHANGED",
					entityType: "LedgerSettings",
					entityId: "ledger",
					summary: lockChanged
						? `Lock date ${oldSoft ?? "none"} to ${newSoft ?? "none"}, closed date ${oldHard ?? "none"} to ${newHard ?? "none"}`
						: "Books settings changed",
					before: {
						lockDate: oldSoft,
						hardLockDate: oldHard,
						fiscalYearStartMonth: current.fiscalYearStartMonth,
						attentionStaleDays: current.attentionStaleDays,
					},
					after: {
						lockDate: newSoft,
						hardLockDate: newHard,
						fiscalYearStartMonth:
							input.fiscalYearStartMonth ?? current.fiscalYearStartMonth,
						attentionStaleDays:
							input.attentionStaleDays ?? current.attentionStaleDays,
					},
				});
			});
		} catch (error) {
			return rethrowLedgerError(error);
		}

		return this.get(userId);
	}

	/** Prefix, padding and the next number of one sequence. The next number only moves forward (G13). */
	async updateSequence(userId: string, input: SequenceUpdate) {
		await this.access.assert(userId, "bookkeeping.settings");

		const current = await this.db.numberSequence.findUnique({
			where: { key: input.key },
		});
		if (!current) throw new NotFoundException("No number sequence with that key.");

		if (input.nextValue !== undefined && input.nextValue < current.nextValue) {
			throw new BadRequestException(
				`The next number can only move forward, from ${current.nextValue}. Numbers already used must never repeat.`,
			);
		}

		const actor = await this.access.actorFor(userId);

		try {
			await this.db.$transaction(async (tx) => {
				await tx.numberSequence.update({
					where: { key: input.key },
					data: {
						prefix: input.prefix,
						padding: input.padding,
						nextValue: input.nextValue,
					},
				});

				await writeAudit(tx, {
					module: "bookkeeping",
					actorType: actor.type,
					actorId: actor.id,
					actorLabel: actor.label ?? null,
					action: "NUMBERING_CHANGED",
					entityType: "NumberSequence",
					entityId: input.key,
					summary: `Numbering for ${input.key} changed`,
					before: {
						prefix: current.prefix,
						padding: current.padding,
						nextValue: current.nextValue,
					},
					after: {
						prefix: input.prefix ?? current.prefix,
						padding: input.padding ?? current.padding,
						nextValue: input.nextValue ?? current.nextValue,
					},
				});
			});
		} catch (error) {
			return rethrowLedgerError(error);
		}

		return this.get(userId);
	}
}
