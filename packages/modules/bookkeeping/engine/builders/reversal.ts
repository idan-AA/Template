import { LedgerError } from "../errors";
import type { DateOnly } from "../time";
import {
	oppositeSide,
	type PostedEntryView,
	type PostingContext,
	type PostingInput,
} from "../types";
import { validatePosting } from "../validate";

export interface ReversalOptions {
	date: DateOnly;
	reason: string;
	alreadyReversed?: boolean;
}

export function buildReversal(
	original: PostedEntryView,
	options: ReversalOptions,
	ctx: PostingContext,
): PostingInput {
	if (original.source === "REVERSAL" || original.reversesId) {
		throw new LedgerError(
			"REVERSAL_OF_REVERSAL",
			"A reversal cannot be reversed. Enter the correction as a new entry.",
		);
	}
	if (options.alreadyReversed) {
		throw new LedgerError(
			"ALREADY_REVERSED",
			"This entry has already been reversed.",
		);
	}
	if (!options.reason.trim()) {
		throw new LedgerError("MEMO_REQUIRED", "A reversal needs a reason.");
	}
	const label = original.number ?? original.id;
	const entry: PostingInput = {
		source: "REVERSAL",
		sourceId: original.id,
		sourceKey: `reversal:${original.id}`,
		date: options.date,
		memo: `Reversal of ${label}: ${options.reason.trim()}`,
		baseCurrency: original.baseCurrency,
		reversesId: original.id,
		lines: original.lines.map((line) => ({
			...line,
			side: oppositeSide(line.side),
		})),
	};
	validatePosting(entry, ctx);
	return entry;
}

export interface VoidableDocument {
	id: string;
	status: "DRAFT" | "ISSUED" | "VOID";
	totalMinor: bigint;
	balanceMinor: bigint;
}

export function assertVoidable(doc: VoidableDocument): void {
	if (doc.status !== "ISSUED") {
		throw new LedgerError(
			"DOCUMENT_NOT_ISSUED",
			"Only an issued document can be voided.",
		);
	}
	if (doc.balanceMinor !== doc.totalMinor) {
		throw new LedgerError(
			"DOCUMENT_HAS_SETTLEMENTS",
			"Remove the payments and credits applied to this document first.",
		);
	}
}

export function buildVoidDocument(
	doc: VoidableDocument,
	issueEntry: PostedEntryView,
	options: ReversalOptions,
	ctx: PostingContext,
): PostingInput {
	assertVoidable(doc);
	return buildReversal(issueEntry, options, ctx);
}

export function buildVoidPayment(
	paymentEntry: PostedEntryView,
	allocationEntries: readonly PostedEntryView[],
	options: { date: DateOnly; reason: string },
	ctx: PostingContext,
): PostingInput[] {
	return [paymentEntry, ...allocationEntries].map((entry) =>
		buildReversal(
			entry,
			{
				date: options.date,
				reason: options.reason,
			},
			ctx,
		),
	);
}
