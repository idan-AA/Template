import { computeDocument, isSalesKind } from "../document";
import { convertAndRound } from "../fx";
import {
	type DocKind,
	type DocumentInput,
	type EntrySource,
	oppositeSide,
	type PostingContext,
	type PostingInput,
	type RawLine,
	type Side,
} from "../types";
import { validatePosting } from "../validate";

const KEY_NAMES: Record<DocKind, string> = {
	INVOICE: "invoice",
	BILL: "bill",
	CREDIT_NOTE: "credit_note",
	VENDOR_CREDIT: "vendor_credit",
};

export function documentSourceKey(kind: DocKind, id: string): string {
	return `${KEY_NAMES[kind]}:${id}:issue`;
}

export function controlSideOf(kind: DocKind): Side {
	return kind === "INVOICE" || kind === "VENDOR_CREDIT" ? "DEBIT" : "CREDIT";
}

export function buildDocumentEntry(
	doc: DocumentInput,
	ctx: PostingContext,
): PostingInput {
	const computed = computeDocument(doc, ctx.exponent);
	const control = isSalesKind(doc.kind)
		? ctx.systemAccounts.receivable
		: ctx.systemAccounts.payable;
	const controlSide = controlSideOf(doc.kind);
	const otherSide = oppositeSide(controlSide);
	const counterpartyId = doc.counterpartyId;

	const raws: RawLine[] = [
		{
			accountId: control,
			kind: "NORMAL",
			side: controlSide,
			currency: doc.currency,
			amountMinor: computed.totalMinor,
			fx: doc.fx,
			counterpartyId,
			documentId: doc.id,
		},
	];

	if (doc.isOpening) {
		raws.push({
			accountId: ctx.systemAccounts.openingBalanceEquity,
			kind: "NORMAL",
			side: otherSide,
			currency: doc.currency,
			amountMinor: computed.totalMinor,
			fx: doc.fx,
			counterpartyId,
		});
	} else {
		for (const line of computed.lines) {
			const rolledIn = line.taxRate !== null && !line.taxRate.recoverable;
			const posted = rolledIn ? line.netMinor + line.taxMinor : line.netMinor;
			if (posted <= 0n) continue;
			raws.push({
				accountId: line.accountId,
				kind: "NORMAL",
				side: otherSide,
				currency: doc.currency,
				amountMinor: posted,
				fx: doc.fx,
				counterpartyId,
				taxRateId: line.taxRate?.id ?? null,
				memo: line.description,
			});
		}
		for (const tax of computed.taxByRate) {
			if (!tax.taxRate.recoverable || tax.taxMinor <= 0n) continue;
			raws.push({
				accountId: tax.taxRate.accountId,
				kind: "TAX",
				side: otherSide,
				currency: doc.currency,
				amountMinor: tax.taxMinor,
				fx: doc.fx,
				counterpartyId,
				taxRateId: tax.taxRate.id,
			});
		}
	}

	const input: PostingInput = {
		source: doc.kind as EntrySource,
		sourceId: doc.id,
		sourceKey: documentSourceKey(doc.kind, doc.id),
		date: doc.issueDate,
		memo: doc.memo ?? null,
		baseCurrency: ctx.baseCurrency,
		lines: convertAndRound(raws, ctx),
	};
	validatePosting(input, ctx);
	return input;
}
