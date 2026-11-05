import { LedgerError } from "./errors";
import type {
	PostedEntryView,
	PostingContext,
	PostingInput,
	PostingLine,
	SettlementTarget,
	Side,
} from "./types";
import { validatePosting } from "./validate";

export interface SimEntry extends PostedEntryView {
	input: PostingInput;
}

export interface TagBalance {
	txnMinor: bigint;
	baseMinor: bigint;
}

export interface AccountBalance {
	debitBase: bigint;
	creditBase: bigint;
}

export class SimLedger {
	readonly entries: SimEntry[] = [];
	private readonly byKey = new Map<string, SimEntry>();
	private readonly reversed = new Set<string>();

	constructor(private readonly ctx: PostingContext) {}

	post(input: PostingInput): SimEntry {
		const existing = this.byKey.get(input.sourceKey);
		if (existing) return existing;
		validatePosting(input, this.ctx);
		if (input.reversesId) {
			if (this.reversed.has(input.reversesId)) {
				throw new LedgerError("ALREADY_REVERSED", "Already reversed.");
			}
			this.reversed.add(input.reversesId);
		}
		const entry: SimEntry = {
			id: `e${this.entries.length + 1}`,
			number: `JE-${String(this.entries.length + 1).padStart(6, "0")}`,
			date: input.date,
			source: input.source,
			baseCurrency: input.baseCurrency,
			lines: input.lines,
			reversesId: input.reversesId ?? null,
			input,
		};
		this.entries.push(entry);
		this.byKey.set(input.sourceKey, entry);
		return entry;
	}

	isReversed(entryId: string): boolean {
		return this.reversed.has(entryId);
	}

	entry(id: string): SimEntry {
		const found = this.entries.find((e) => e.id === id);
		if (!found) throw new Error(`no entry ${id}`);
		return found;
	}

	allLines(): PostingLine[] {
		return this.entries.flatMap((e) => e.lines);
	}

	trialBalance(): Map<string, AccountBalance> {
		const result = new Map<string, AccountBalance>();
		for (const line of this.allLines()) {
			const row = result.get(line.accountId) ?? {
				debitBase: 0n,
				creditBase: 0n,
			};
			if (line.side === "DEBIT") row.debitBase += line.baseAmountMinor;
			else row.creditBase += line.baseAmountMinor;
			result.set(line.accountId, row);
		}
		return result;
	}

	totalDebitBase(): bigint {
		let total = 0n;
		for (const row of this.trialBalance().values()) total += row.debitBase;
		return total;
	}

	totalCreditBase(): bigint {
		let total = 0n;
		for (const row of this.trialBalance().values()) total += row.creditBase;
		return total;
	}

	accountBalance(accountId: string): bigint {
		const row = this.trialBalance().get(accountId);
		return row ? row.debitBase - row.creditBase : 0n;
	}

	tagBalance(
		tag: { documentId?: string; paymentId?: string },
		natural: Side,
	): TagBalance {
		let txn = 0n;
		let base = 0n;
		for (const line of this.allLines()) {
			const matches =
				(tag.documentId && line.documentId === tag.documentId) ||
				(tag.paymentId && line.paymentId === tag.paymentId);
			if (!matches) continue;
			const sign = line.side === natural ? 1n : -1n;
			txn += sign * line.amountMinor;
			base += sign * line.baseAmountMinor;
		}
		return { txnMinor: txn, baseMinor: base };
	}

	target(
		tag: { documentId?: string; paymentId?: string },
		natural: Side,
		allocatedMinor: bigint,
		rate: {
			fxRate: string;
			fxOrigin: "IDENTITY" | "MANUAL" | "FETCHED";
			fxRateAt: string;
		},
	): SettlementTarget {
		const balance = this.tagBalance(tag, natural);
		return {
			documentId: tag.documentId ?? null,
			paymentId: tag.paymentId ?? null,
			allocatedMinor,
			remainingMinor: balance.txnMinor,
			remainingBaseMinor: balance.baseMinor,
			fxRate: rate.fxRate,
			fxOrigin: rate.fxOrigin,
			fxRateAt: rate.fxRateAt,
		};
	}
}
