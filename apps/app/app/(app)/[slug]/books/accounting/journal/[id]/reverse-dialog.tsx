"use client";

import { Button } from "@app/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@app/ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import { Spinner } from "@app/ui/components/spinner";
import { Textarea } from "@app/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useBooksAccess } from "../../../_components/use-books-access";

/**
 * Reverse a posted entry: a new entry with every line flipped, dated today unless changed. Both
 * entries stay on the books and each points at the other; nothing is deleted (docs/plan B2).
 */
export function ReverseDialog({ id, number }: { id: string; number: string }) {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();
	const { can } = useBooksAccess();
	const dateId = useId();
	const reasonId = useId();
	const overrideId = useId();

	const [open, setOpen] = useState(false);
	const [date, setDate] = useState("");
	const [reason, setReason] = useState("");
	const [override, setOverride] = useState("");

	const settings = useQuery(trpc.bookkeepingSettings.get.queryOptions());

	const reverse = useMutation(
		trpc.bookkeepingJournal.reverse.mutationOptions({
			onSuccess: async (result) => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.bookkeepingJournal.byId.queryKey(),
					}),
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
				toast.success(`${result.number} posted. ${number} is reversed.`);
				setOpen(false);
				router.push(
					workspaceUrl(`/books/accounting/journal/${result.entryId}`),
				);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const today = settings.data?.today ?? "";
	const effectiveDate = date || today;
	const lockDate = settings.data?.lockDate ?? null;
	const insideLock = lockDate !== null && effectiveDate <= lockDate;
	const canOverride = can("bookkeeping.lock");
	const ready =
		effectiveDate !== "" &&
		reason.trim() !== "" &&
		!(insideLock && (!canOverride || override.trim() === "")) &&
		!reverse.isPending;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Reverse entry</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reverse {number}?</DialogTitle>
					<DialogDescription>
						This posts a new entry that cancels {number} line for line. Both
						stay on the books and each links to the other. It cannot be undone:
						to put the original back, enter a new journal.
					</DialogDescription>
				</DialogHeader>

				<form
					id="reverse-entry"
					className="flex flex-col gap-4"
					onSubmit={(event) => {
						event.preventDefault();
						if (!ready) return;

						reverse.mutate({
							id,
							date: effectiveDate,
							reason: reason.trim(),
							lockOverrideReason: insideLock ? override.trim() : undefined,
						});
					}}
				>
					<Field>
						<FieldLabel htmlFor={dateId}>Date of the reversal</FieldLabel>
						<Input
							id={dateId}
							type="date"
							value={effectiveDate}
							onChange={(event) => setDate(event.target.value)}
							required
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor={reasonId}>Reason</FieldLabel>
						<Textarea
							id={reasonId}
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							placeholder="Why this entry is wrong"
							required
						/>
					</Field>

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
									? `The books are locked through ${lockDate}.`
									: `The books are locked through ${lockDate}. Pick a later date.`}
							</FieldDescription>
						</Field>
					) : null}
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" type="button">
							Cancel
						</Button>
					</DialogClose>
					<Button
						type="submit"
						form="reverse-entry"
						variant="destructive"
						disabled={!ready}
					>
						{reverse.isPending ? <Spinner data-icon="inline-start" /> : null}
						Reverse {number}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
