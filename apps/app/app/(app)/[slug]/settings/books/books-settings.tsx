"use client";

import { Button } from "@app/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/ui/components/card";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { formatDate } from "../../books/books-format";
import { QueryError } from "../../books/_components/query-error";

/** Plain names for the number runs, in the order a person meets them. Unknown keys sort last. */
const SEQUENCE_LABEL: Record<string, string> = {
	ENTRY: "Journal entry",
	INVOICE: "Invoice",
	CREDIT_NOTE: "Credit note",
	BILL: "Bill",
	VENDOR_CREDIT: "Vendor credit",
	PAYMENT: "Payment",
};
const SEQUENCE_ORDER = Object.keys(SEQUENCE_LABEL);

/** Only journal entries are numbered by a screen that exists today; the rest wait for later releases. */
const IN_USE = new Set(["ENTRY"]);

function sequenceLabel(key: string): string {
	return (
		SEQUENCE_LABEL[key] ??
		`${key.charAt(0)}${key.slice(1).toLowerCase().replaceAll("_", " ")}`
	);
}

function sequenceRank(key: string): number {
	const at = SEQUENCE_ORDER.indexOf(key);

	return at === -1 ? SEQUENCE_ORDER.length : at;
}

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export function BooksSettings() {
	const trpc = useTRPC();
	const settings = useQuery(trpc.bookkeepingSettings.get.queryOptions());

	if (settings.error) return <QueryError error={settings.error} />;
	if (!settings.data) return null;

	return <Loaded data={settings.data} />;
}

function Loaded({
	data,
}: {
	data: {
		baseCurrency: string;
		timezone: string;
		today: string;
		fiscalYearStartMonth: number;
		lockDate: string | null;
		hardLockDate: string | null;
		firstPostedAt: string | null;
		attentionStaleDays: number;
		sequences: Array<{
			key: string;
			prefix: string;
			padding: number;
			nextValue: number;
			example: string;
		}>;
		can: { settings: boolean; lock: boolean; reopen: boolean };
	};
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const lockId = useId();
	const hardId = useId();
	const monthId = useId();

	const [lock, setLock] = useState(data.lockDate ?? "");
	const [hard, setHard] = useState(data.hardLockDate ?? "");

	const refresh = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.bookkeepingSettings.get.queryKey(),
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.bookkeeping.home.queryKey(),
			}),
		]);
	};

	const update = useMutation(
		trpc.bookkeepingSettings.update.mutationOptions({
			onSuccess: async () => {
				await refresh();
				toast.success("Saved.");
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const sequence = useMutation(
		trpc.bookkeepingSettings.updateSequence.mutationOptions({
			onSuccess: async () => {
				await refresh();
				toast.success("Numbering saved.");
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const lockChanged = lock !== (data.lockDate ?? "");
	const hardChanged = hard !== (data.hardLockDate ?? "");
	const lockForward =
		lock !== "" && (data.lockDate === null || lock > data.lockDate);
	// Moving the lock forward needs the lock permission; backward or clearing needs reopen. The
	// hard lock always needs reopen. The API checks the same rules again.
	const lockAllowed = !lockChanged || (lockForward ? data.can.lock : data.can.reopen);
	const hardAllowed = !hardChanged || data.can.reopen;
	const busy = update.isPending || sequence.isPending;

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Closing the books</CardTitle>
					<CardDescription>
						Nothing can be posted on or before the lock date without a reason
						from someone allowed to. The closed date stops everyone. Moving a
						date back reopens closed books, so only the owner can.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="flex flex-col gap-4"
						onSubmit={(event) => {
							event.preventDefault();
							update.mutate({
								lockDate: lockChanged ? lock || null : undefined,
								hardLockDate: hardChanged ? hard || null : undefined,
							});
						}}
					>
						<Field className="max-w-xs">
							<FieldLabel htmlFor={lockId}>Lock date</FieldLabel>
							<Input
								id={lockId}
								type="date"
								value={lock}
								disabled={!data.can.lock && !data.can.reopen}
								onChange={(event) => setLock(event.target.value)}
							/>
							<FieldDescription>
								{data.lockDate
									? `Locked through ${formatDate(data.lockDate)}.`
									: "No lock date. Anything can be posted."}
							</FieldDescription>
						</Field>

						<Field className="max-w-xs">
							<FieldLabel htmlFor={hardId}>Closed date</FieldLabel>
							<Input
								id={hardId}
								type="date"
								value={hard}
								disabled={!data.can.reopen}
								onChange={(event) => setHard(event.target.value)}
							/>
							<FieldDescription>
								{data.hardLockDate
									? `Closed through ${formatDate(data.hardLockDate)}. Nobody can post on or before it.`
									: "Not set. Set the lock date first; the closed date cannot be later."}
							</FieldDescription>
						</Field>

						{!lockAllowed || !hardAllowed ? (
							<p className="text-destructive text-xs">
								Your role cannot make that change to the dates.
							</p>
						) : null}

						<div>
							<Button
								type="submit"
								disabled={
									busy ||
									(!lockChanged && !hardChanged) ||
									!lockAllowed ||
									!hardAllowed
								}
							>
								{update.isPending ? <Spinner data-icon="inline-start" /> : null}
								Save dates
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Reports</CardTitle>
					<CardDescription>
						The fiscal year decides where "this year" starts in the ledger and
						the reports. Amounts are kept in {data.baseCurrency}, which is fixed
						once the first entry is posted
						{data.firstPostedAt ? " (it has been)" : ""}. Time zone:{" "}
						{data.timezone}.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="max-w-xs">
						<FieldLabel htmlFor={monthId}>Fiscal year starts in</FieldLabel>
						<Select
							value={String(data.fiscalYearStartMonth)}
							disabled={!data.can.settings || busy}
							onValueChange={(next) =>
								update.mutate({ fiscalYearStartMonth: Number(next) })
							}
						>
							<SelectTrigger id={monthId} className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{MONTHS.map((month, index) => (
									<SelectItem key={month} value={String(index + 1)}>
										{month}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Numbering</CardTitle>
					<CardDescription>
						Each kind of entry has its own run of numbers. The next number only
						moves forward, so a number is never used twice.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{[...data.sequences]
						.sort((a, b) => sequenceRank(a.key) - sequenceRank(b.key))
						.map((row) => (
						<SequenceRow
							key={row.key}
							row={row}
							inUse={IN_USE.has(row.key)}
							canEdit={data.can.settings}
							busy={busy}
							onSave={(patch) => sequence.mutate({ key: row.key, ...patch })}
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

function SequenceRow({
	row,
	inUse,
	canEdit,
	busy,
	onSave,
}: {
	inUse: boolean;
	row: {
		key: string;
		prefix: string;
		padding: number;
		nextValue: number;
		example: string;
	};
	canEdit: boolean;
	busy: boolean;
	onSave: (patch: {
		prefix: string;
		padding: number;
		nextValue: number;
	}) => void;
}) {
	const prefixId = useId();
	const paddingId = useId();
	const nextId = useId();
	const [prefix, setPrefix] = useState(row.prefix);
	const [padding, setPadding] = useState(String(row.padding));
	const [next, setNext] = useState(String(row.nextValue));

	const paddingValue = Number.parseInt(padding, 10);
	const nextValue = Number.parseInt(next, 10);
	const valid =
		Number.isInteger(paddingValue) &&
		paddingValue >= 1 &&
		paddingValue <= 12 &&
		Number.isInteger(nextValue) &&
		nextValue >= row.nextValue;
	const changed =
		prefix !== row.prefix ||
		paddingValue !== row.padding ||
		nextValue !== row.nextValue;

	return (
		<form
			className="flex flex-wrap items-end gap-3 border-b pb-4 last:border-b-0 last:pb-0"
			onSubmit={(event) => {
				event.preventDefault();
				if (valid) onSave({ prefix, padding: paddingValue, nextValue });
			}}
		>
			<div className="w-32 text-sm">
				<div className="font-medium">{sequenceLabel(row.key)}</div>
				<div className="text-muted-foreground text-xs">
					{inUse ? `Next: ${row.example}` : "Not used yet"}
				</div>
			</div>
			<Field className="w-28">
				<FieldLabel htmlFor={prefixId}>Prefix</FieldLabel>
				<Input
					id={prefixId}
					value={prefix}
					maxLength={12}
					disabled={!canEdit}
					onChange={(event) => setPrefix(event.target.value)}
				/>
			</Field>
			<Field className="w-24">
				<FieldLabel htmlFor={paddingId}>Digits</FieldLabel>
					<FieldDescription>
						How many digits the number has, padded with zeros. 6 gives 000001.
					</FieldDescription>
				<Input
					id={paddingId}
					inputMode="numeric"
					value={padding}
					disabled={!canEdit}
					onChange={(event) => setPadding(event.target.value)}
				/>
			</Field>
			<Field className="w-28">
				<FieldLabel htmlFor={nextId}>Next number</FieldLabel>
				<Input
					id={nextId}
					inputMode="numeric"
					value={next}
					disabled={!canEdit}
					onChange={(event) => setNext(event.target.value)}
				/>
			</Field>
			<Button
				type="submit"
				variant="outline"
				disabled={!canEdit || busy || !valid || !changed}
			>
				Save
			</Button>
		</form>
	);
}
