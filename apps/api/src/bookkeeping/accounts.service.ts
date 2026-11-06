import { type Db, Prisma } from "@app/db";
import { writeAudit } from "@app/db/audit";
import { dateToDateOnly } from "@app/modules/bookkeeping/ledger/posting";
import {
	accountBalanceBefore,
	accountLedger,
	trialBalanceRoster,
} from "@app/modules/bookkeeping/ledger/queries";
import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type {
	accountCreateInput,
	accountLedgerInput,
	accountListInput,
	accountSubtype,
	accountType,
	entrySource,
} from "./bookkeeping.contracts";
import { BookkeepingAccess } from "./bookkeeping-access";
import { rethrowLedgerError } from "./bookkeeping-errors";

type AccountType = z.infer<typeof accountType>;
type AccountSubtype = z.infer<typeof accountSubtype>;
type EntrySource = z.infer<typeof entrySource>;

/** Mirror of the ledgerAccount_type_family_chk CHECK, so a mistake reads as a sentence, not a constraint name. */
const FAMILY: Record<AccountType, readonly AccountSubtype[]> = {
	ASSET: [
		"BANK",
		"CASH",
		"ACCOUNTS_RECEIVABLE",
		"CURRENT_ASSET",
		"FIXED_ASSET",
		"OTHER_ASSET",
	],
	LIABILITY: [
		"CREDIT_CARD",
		"ACCOUNTS_PAYABLE",
		"CURRENT_LIABILITY",
		"TAX_LIABILITY",
		"LONG_TERM_LIABILITY",
	],
	EQUITY: ["OWNER_EQUITY", "RETAINED_EARNINGS"],
	INCOME: ["REVENUE", "OTHER_INCOME"],
	EXPENSE: ["COST_OF_SALES", "OPERATING_EXPENSE", "OTHER_EXPENSE"],
};

/** Assets and expenses are debit accounts; liabilities, equity and income are credit accounts. */
export function normalSideOf(type: string): "DEBIT" | "CREDIT" {
	return type === "ASSET" || type === "EXPENSE" ? "DEBIT" : "CREDIT";
}

/** Net debit minus credit, flipped for credit accounts so a normal balance reads positive. */
export function naturalBalance(
	type: string,
	debit: bigint,
	credit: bigint,
): bigint {
	return normalSideOf(type) === "DEBIT" ? debit - credit : credit - debit;
}

export const NOT_SET_UP = "The books are not set up on this deploy yet.";

@Injectable()
export class AccountsService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(BookkeepingAccess) private readonly access: BookkeepingAccess,
	) {}

	async list(userId: string, input: z.infer<typeof accountListInput>) {
		await this.access.assert(userId, "bookkeeping.reports");

		const settings = await this.db.ledgerSettings.findUnique({
			where: { id: "ledger" },
			select: { baseCurrency: true },
		});
		if (!settings) throw new NotFoundException(NOT_SET_UP);

		const [roster, details] = await Promise.all([
			trialBalanceRoster(this.db),
			this.db.ledgerAccount.findMany({
				select: { id: true, description: true, isSystem: true },
			}),
		]);
		const detailById = new Map(details.map((row) => [row.id, row]));
		const needle = input.q.toLowerCase();

		const accounts = roster
			.filter((row) => input.includeArchived || !row.archived)
			.filter((row) => !input.type || row.type === input.type)
			.filter(
				(row) =>
					needle === "" ||
					row.code.toLowerCase().includes(needle) ||
					row.name.toLowerCase().includes(needle),
			)
			.map((row) => ({
				id: row.accountId,
				code: row.code,
				name: row.name,
				type: row.type as AccountType,
				subtype: row.subtype as AccountSubtype,
				systemRole: row.systemRole,
				description: detailById.get(row.accountId)?.description ?? null,
				isSystem: detailById.get(row.accountId)?.isSystem ?? false,
				archived: row.archived,
				balanceBase: naturalBalance(
					row.type,
					row.debitBase,
					row.creditBase,
				).toString(),
			}));

		return { baseCurrency: settings.baseCurrency, accounts };
	}

	async create(userId: string, input: z.infer<typeof accountCreateInput>) {
		await this.access.assert(userId, "bookkeeping.settings");

		if (!FAMILY[input.type].includes(input.subtype)) {
			throw new BadRequestException(
				`A ${input.type.toLowerCase()} account must be one of: ${FAMILY[
					input.type
				]
					.map((value) => value.toLowerCase().replaceAll("_", " "))
					.join(", ")}.`,
			);
		}

		const actor = await this.access.actorFor(userId);

		try {
			return await this.db.$transaction(async (tx) => {
				const created = await tx.ledgerAccount.create({
					data: {
						code: input.code,
						name: input.name,
						type: input.type,
						subtype: input.subtype,
						description: input.description || null,
						isSystem: false,
					},
					select: { id: true, code: true, name: true },
				});

				await writeAudit(tx, {
					module: "bookkeeping",
					actorType: actor.type,
					actorId: actor.id,
					actorLabel: actor.label ?? null,
					action: "ACCOUNT_CREATED",
					entityType: "LedgerAccount",
					entityId: created.id,
					summary: `Account ${created.code} ${created.name} added`,
					after: {
						code: created.code,
						name: created.name,
						type: input.type,
						subtype: input.subtype,
					},
				});

				return { id: created.id };
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				throw new ConflictException(
					`Account code ${input.code} is already used. Pick another code.`,
				);
			}

			return rethrowLedgerError(error);
		}
	}

	async update(
		userId: string,
		id: string,
		data: {
			name?: string;
			description?: string | null;
			archived?: boolean;
		},
	) {
		await this.access.assert(userId, "bookkeeping.settings");
		const actor = await this.access.actorFor(userId);

		try {
			return await this.db.$transaction(async (tx) => {
				const before = await tx.ledgerAccount.findUnique({ where: { id } });
				if (!before) throw new NotFoundException("No account with that id.");

				let archivedAt: Date | null | undefined;
				if (data.archived === true) archivedAt = before.archivedAt ?? new Date();
				if (data.archived === false) archivedAt = null;

				const after = await tx.ledgerAccount.update({
					where: { id },
					data: {
						name: data.name,
						description:
							data.description === undefined
								? undefined
								: data.description || null,
						archivedAt,
					},
					select: { id: true, code: true, name: true, archivedAt: true },
				});

				await writeAudit(tx, {
					module: "bookkeeping",
					actorType: actor.type,
					actorId: actor.id,
					actorLabel: actor.label ?? null,
					action: "ACCOUNT_UPDATED",
					entityType: "LedgerAccount",
					entityId: id,
					summary: `Account ${after.code} ${after.name} changed`,
					before: {
						name: before.name,
						description: before.description,
						archived: before.archivedAt !== null,
					},
					after: {
						name: after.name,
						archived: after.archivedAt !== null,
					},
				});

				return { id: after.id };
			});
		} catch (error) {
			return rethrowLedgerError(error);
		}
	}

	async ledger(userId: string, input: z.infer<typeof accountLedgerInput>) {
		await this.access.assert(userId, "bookkeeping.reports");

		const [account, settings] = await Promise.all([
			this.db.ledgerAccount.findUnique({ where: { id: input.id } }),
			this.db.ledgerSettings.findUnique({
				where: { id: "ledger" },
				select: { baseCurrency: true },
			}),
		]);
		if (!account) throw new NotFoundException("No account with that id.");
		if (!settings) throw new NotFoundException(NOT_SET_UP);

		const [opening, lines] = await Promise.all([
			input.from
				? accountBalanceBefore(this.db, account.id, input.from)
				: Promise.resolve(0n),
			accountLedger(this.db, account.id, { from: input.from, to: input.to }),
		]);

		let running = opening;
		let totalDebit = 0n;
		let totalCredit = 0n;

		const rows = lines.map((line) => {
			running += line.debitBase - line.creditBase;
			totalDebit += line.debitBase;
			totalCredit += line.creditBase;

			return {
				entryId: line.entryId,
				number: line.number,
				date: dateToDateOnly(line.date),
				source: line.source as EntrySource,
				memo: line.memo,
				lineMemo: line.lineMemo,
				debitBase: line.debitBase.toString(),
				creditBase: line.creditBase.toString(),
				runningBase: running.toString(),
			};
		});

		return {
			baseCurrency: settings.baseCurrency,
			account: {
				id: account.id,
				code: account.code,
				name: account.name,
				type: account.type,
				subtype: account.subtype,
				archived: account.archivedAt !== null,
			},
			normalSide: normalSideOf(account.type),
			from: input.from ?? null,
			to: input.to ?? null,
			openingBase: opening.toString(),
			rows,
			totalDebitBase: totalDebit.toString(),
			totalCreditBase: totalCredit.toString(),
			closingBase: running.toString(),
		};
	}
}
