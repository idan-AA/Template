"use client";

import { Button } from "@app/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@app/ui/components/sheet";
import { Spinner } from "@app/ui/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useBooksAccess } from "../../../_components/use-books-access";

/**
 * Rename or archive an account. The type, kind and code stay as they are: once an account has
 * postings the database refuses to change them, and a code is how people find it. Archiving an
 * account that still holds a balance is refused by the database with a sentence that says so.
 */
export function EditAccountSheet({
	id,
	code,
	name,
	archived,
}: {
	id: string;
	code: string;
	name: string;
	archived: boolean;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { can } = useBooksAccess();
	const nameId = useId();

	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(name);

	const update = useMutation(
		trpc.bookkeepingAccounts.update.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.bookkeepingAccounts.list.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.bookkeepingAccounts.ledger.queryKey(),
					}),
				]);
				toast.success("Account updated.");
				setOpen(false);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!can("bookkeeping.settings")) return null;

	return (
		<Sheet
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) setDraft(name);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline">Edit account</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Edit account {code}</SheetTitle>
					<SheetDescription>
						Change the name, or archive the account so it stops showing in
						pickers. Archiving needs a zero balance.
					</SheetDescription>
				</SheetHeader>

				<form
					id="edit-account"
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						update.mutate({ id, data: { name: draft } });
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={nameId}>Name</FieldLabel>
							<Input
								id={nameId}
								value={draft}
								onChange={(event) => setDraft(event.target.value)}
								autoComplete="off"
								required
							/>
							<FieldDescription>
								Past entries keep showing the account under this name.
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>

				<SheetFooter>
					<Button
						variant="outline"
						type="button"
						disabled={update.isPending}
						onClick={() => update.mutate({ id, data: { archived: !archived } })}
					>
						{archived ? "Restore account" : "Archive account"}
					</Button>
					<SheetClose asChild>
						<Button variant="outline" type="button">
							Cancel
						</Button>
					</SheetClose>
					<Button
						type="submit"
						form="edit-account"
						disabled={
							update.isPending || draft.trim() === "" || draft.trim() === name
						}
					>
						{update.isPending ? <Spinner data-icon="inline-start" /> : null}
						Save name
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
