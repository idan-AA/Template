"use client";

import { Button } from "@app/ui/components/button";
import { Card, CardContent } from "@app/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/ui/components/select";
import { Spinner } from "@app/ui/components/spinner";
import { Textarea } from "@app/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { QueryError } from "../../../_components/query-error";
import { useBooksAccess } from "../../../_components/use-books-access";
import {
	formatMoney,
	isJournalAccount,
	parseAmount,
} from "../../../books-format";

type Line = {
	key: number;
	accountId: string;
	debit: string;
	credit: string;
	memo: string;
};

const blank = (key: number): Line => ({
	key,
	accountId: "",
	debit: "",
	credit: "",
	memo: "",
});

/**
 * A manual or adjusting journal in the base currency. The bar at the bottom says, as you type,
 * whether the debits equal the credits; Post stays off until they do. Posting is final (a posted
 * entry never changes), so the form shows the totals before the button works.
 */
export function JournalForm() {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();
	const { can } = useBooksAccess();

	const dateId = useId();
	const kindId = useId();
	const memoId = useId();
	const overrideId = useId();

	// One key per form: a double click posts once because the server uses it as the idempotency key.
	const requestKey = useRef(crypto.randomUUID());
	const nextKey = useRef(3);

	const accounts = useQuery(
		trpc.bookkeepingAccounts.list.queryOptions({
			includeArchived: false,
			q: "",
		}),
	);
	const settings = useQuery(trpc.bookkeepingSettings.get.queryOptions());

	const [date, setDate] = useState("");
	const [kind, setKind] = useState<"MANUAL" | "ADJUSTMENT">("MANUAL");
	const [memo, setMemo] = useState("");
	const [lines, setLines] = useState<Line[]>([blank(1), blank(2)]);
	const [override, setOverride] = useState("");

	const post = useMutation(
		trpc.bookkeepingJournal.post.mutationOptions({
			onSuccess: async (result) => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.bookkeepingJournal.list.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.bookkeepingAccounts.list.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.bookkeeping.home.queryKey(),
					}),
				]);
				toast.success(`${result.number} posted.`);
				router.push(
					workspaceUrl(`/books/accounting/journal/${result.entryId}`),
				);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (accounts.error) return <QueryError error={accounts.error} />;
	if (settings.error) return <QueryError error={settings.error} />;
	if (!accounts.data || !settings.data) return null;

	const currency = accounts.data.baseCurrency;
	const effectiveDate = date || settings.data.today;
	const lockDate = settings.data.lockDate;
	const insideLock = lockDate !== null && effectiveDate <= lockDate;
	const canOverride = can("bookkeeping.lock");
	const pickable = accounts.data.accounts.filter((account) =>
		isJournalAccount(account.subtype),
	);

	const update = (key: number, patch: Partial<Line>) =>
		setLines((current) =>
			current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
		);

	let debitTotal = BigInt(0);
	let creditTotal = BigInt(0);
	let problem: string | null = null;
	const payload: Array<{
		accountId: string;
		side: "DEBIT" | "CREDIT";
		amount: string;
		memo?: string;
	}> = [];

	for (const line of lines) {
		const debit = line.debit.trim();
		const credit = line.credit.trim();
		if (!line.accountId && !debit && !credit) continue;

		if (!line.accountId) {
			problem = "Pick an account on every line that has an amount.";
			continue;
		}
		if (debit && credit) {
			problem = "A line is either a debit or a credit, not both.";
			continue;
		}

		// An account picked but no amount typed yet is unfinished, not wrong: say nothing until the
		// person types something (the line is left out, and Post stays off until two lines count).
		if (!debit && !credit) continue;

		const text = debit || credit;
		const minor = parseAmount(text, currency);
		if (minor === null || minor <= BigInt(0)) {
			problem = `"${text}" is not an amount ${currency} can hold. Use digits and at most the currency's decimals.`;
			continue;
		}

		if (debit) debitTotal += minor;
		else creditTotal += minor;

		payload.push({
			accountId: line.accountId,
			side: debit ? "DEBIT" : "CREDIT",
			amount: text.replaceAll(",", ""),
			memo: line.memo.trim() || undefined,
		});
	}

	const balanced = debitTotal === creditTotal && debitTotal > BigInt(0);
	const difference = debitTotal - creditTotal;
	const needsMemo = kind === "ADJUSTMENT" && memo.trim() === "";
	const needsReason = insideLock && canOverride && override.trim() === "";
	const blockedByLock = insideLock && !canOverride;

	const ready =
		balanced &&
		payload.length >= 2 &&
		problem === null &&
		!needsMemo &&
		!needsReason &&
		!blockedByLock &&
		!post.isPending;

	return (
		<form
			className="flex max-w-5xl flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				if (!ready) return;

				post.mutate({
					requestKey: requestKey.current,
					date: effectiveDate,
					memo: memo.trim() || undefined,
					kind,
					lines: payload,
					lockOverrideReason: insideLock ? override.trim() : undefined,
				});
			}}
		>
			<div className="grid gap-4 sm:grid-cols-3">
				<Field>
					<FieldLabel htmlFor={dateId}>Date</FieldLabel>
					<Input
						id={dateId}
						type="date"
						value={effectiveDate}
						onChange={(event) => setDate(event.target.value)}
						required
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor={kindId}>Kind</FieldLabel>
					<Select
						value={kind}
						onValueChange={(next) => setKind(next as "MANUAL" | "ADJUSTMENT")}
					>
						<SelectTrigger id={kindId} className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="MANUAL">Journal</SelectItem>
							<SelectItem value="ADJUSTMENT">
								Adjustment (needs a memo)
							</SelectItem>
						</SelectContent>
					</Select>
				</Field>

				<Field className="sm:col-span-3">
					<FieldLabel htmlFor={memoId}>Memo</FieldLabel>
					<Textarea
						id={memoId}
						value={memo}
						onChange={(event) => setMemo(event.target.value)}
						placeholder="Why this entry exists. An adjustment must say."
					/>
				</Field>
			</div>

			{insideLock ? (
				<Field>
					<FieldLabel htmlFor={overrideId}>
						Reason for posting inside the lock
					</FieldLabel>
					<Input
						id={overrideId}
						value={override}
						onChange={(event) => setOverride(event.target.value)}
						disabled={!canOverride}
						autoComplete="off"
					/>
					<FieldDescription>
						{canOverride
							? `The books are locked through ${lockDate}. A reason is kept in the history of this entry.`
							: `The books are locked through ${lockDate}. Pick a later date, or ask someone who can post inside the lock.`}
					</FieldDescription>
				</Field>
			) : null}

			<Card>
				<CardContent className="flex flex-col gap-3">
					<div className="hidden grid-cols-[minmax(0,2fr)_9rem_9rem_minmax(0,1.5fr)_2rem] gap-3 text-muted-foreground text-xs md:grid">
						<span>Account</span>
						<span className="text-right">Debit ({currency})</span>
						<span className="text-right">Credit ({currency})</span>
						<span>Line memo</span>
						<span />
					</div>

					{lines.map((line, index) => (
						<div
							key={line.key}
							className="grid gap-2 rounded-lg border p-3 md:grid-cols-[minmax(0,2fr)_9rem_9rem_minmax(0,1.5fr)_2rem] md:items-center md:gap-3 md:rounded-none md:border-0 md:p-0"
						>
							<Select
								value={line.accountId}
								onValueChange={(next) => update(line.key, { accountId: next })}
							>
								<SelectTrigger
									className="w-full"
									aria-label={`Account for line ${index + 1}`}
								>
									<SelectValue placeholder="Pick an account" />
								</SelectTrigger>
								<SelectContent>
									{pickable.map((account) => (
										<SelectItem key={account.id} value={account.id}>
											{account.code} · {account.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input
								aria-label={`Debit for line ${index + 1}`}
								className="text-right tabular-nums"
								inputMode="decimal"
								placeholder="Debit"
								value={line.debit}
								onChange={(event) =>
									update(line.key, {
										debit: event.target.value,
										credit: event.target.value ? "" : line.credit,
									})
								}
							/>
							<Input
								aria-label={`Credit for line ${index + 1}`}
								className="text-right tabular-nums"
								inputMode="decimal"
								placeholder="Credit"
								value={line.credit}
								onChange={(event) =>
									update(line.key, {
										credit: event.target.value,
										debit: event.target.value ? "" : line.debit,
									})
								}
							/>
							<Input
								aria-label={`Memo for line ${index + 1}`}
								placeholder="Optional"
								value={line.memo}
								onChange={(event) =>
									update(line.key, { memo: event.target.value })
								}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={`Remove line ${index + 1}`}
								disabled={lines.length <= 2}
								onClick={() =>
									setLines((current) =>
										current.filter((item) => item.key !== line.key),
									)
								}
							>
								×
							</Button>
						</div>
					))}

					<div>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								const key = nextKey.current;
								nextKey.current += 1;
								setLines((current) => [...current, blank(key)]);
							}}
						>
							Add line
						</Button>
					</div>

					<p className="text-muted-foreground text-xs">
						Receivable, payable, bank and card accounts are not offered here:
						they move through invoices, bills, payments and the bank screen, so
						they always tie back to a document.
					</p>
				</CardContent>
			</Card>

			<div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
				<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm tabular-nums">
					<span>
						Debits {formatMoney(debitTotal.toString(), currency)}
					</span>
					<span>
						Credits {formatMoney(creditTotal.toString(), currency)}
					</span>
					<span
						className={
							balanced ? "text-success" : "font-medium text-destructive"
						}
					>
						{balanced
							? "Balanced"
							: `Out by ${formatMoney((difference < BigInt(0) ? -difference : difference).toString(), currency)}`}
					</span>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					{problem || needsMemo || needsReason || blockedByLock ? (
						<span className="text-destructive text-xs">
							{problem ??
								(needsMemo
									? "An adjustment needs a memo."
									: needsReason
										? "Give a reason to post inside the lock."
										: "This date is locked.")}
						</span>
					) : null}
					<Button type="submit" disabled={!ready}>
						{post.isPending ? <Spinner data-icon="inline-start" /> : null}
						Post journal
					</Button>
				</div>
			</div>
		</form>
	);
}
