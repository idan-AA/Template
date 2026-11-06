"use client";

import { Button } from "@app/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@app/ui/components/field";
import { Icon } from "@app/ui/components/icon";
import { Input } from "@app/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/ui/components/select";
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
import { Textarea } from "@app/ui/components/textarea";
import Add from "@carbon/icons-react/es/Add";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useBooksAccess } from "../../_components/use-books-access";
import {
	type AccountTypeKey,
	SUBTYPES_BY_TYPE,
	subtypeLabel,
	TYPE_LABEL,
	TYPE_ORDER,
} from "../../books-format";

/** Adds an account to the chart. Only people with bookkeeping.settings see the button (the API checks again). */
export function CreateAccountSheet() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { can } = useBooksAccess();

	const codeId = useId();
	const nameId = useId();
	const typeId = useId();
	const subtypeId = useId();
	const descriptionId = useId();

	const [open, setOpen] = useState(false);
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [type, setType] = useState<AccountTypeKey>("EXPENSE");
	const [subtype, setSubtype] = useState("OPERATING_EXPENSE");
	const [description, setDescription] = useState("");

	const create = useMutation(
		trpc.bookkeepingAccounts.create.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.bookkeepingAccounts.list.queryKey(),
				});
				toast.success(`${name} added to the chart.`);
				setOpen(false);
				setCode("");
				setName("");
				setDescription("");
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!can("bookkeeping.settings")) return null;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<Icon icon={Add} data-icon="inline-start" />
					New account
				</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>New account</SheetTitle>
					<SheetDescription>
						An account is a place money is counted. The type decides which
						report it lands on and which side is its normal balance.
					</SheetDescription>
				</SheetHeader>

				<form
					id="create-account"
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						create.mutate({
							code,
							name,
							type,
							subtype: subtype as never,
							description: description || undefined,
						});
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={codeId}>Code</FieldLabel>
							<Input
								id={codeId}
								value={code}
								onChange={(event) => setCode(event.target.value)}
								placeholder="6460"
								autoComplete="off"
								required
							/>
							<FieldDescription>
								Codes sort the chart: 1 assets, 2 liabilities, 3 equity, 4
								income, 5 cost of sales, 6 expenses.
							</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={nameId}>Name</FieldLabel>
							<Input
								id={nameId}
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="Bank charges"
								autoComplete="off"
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={typeId}>Type</FieldLabel>
							<Select
								value={type}
								onValueChange={(next) => {
									const key = next as AccountTypeKey;
									setType(key);
									setSubtype(SUBTYPES_BY_TYPE[key][0] ?? "");
								}}
							>
								<SelectTrigger id={typeId} className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{TYPE_ORDER.map((key) => (
										<SelectItem key={key} value={key}>
											{TYPE_LABEL[key]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor={subtypeId}>Kind</FieldLabel>
							<Select value={subtype} onValueChange={setSubtype}>
								<SelectTrigger id={subtypeId} className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SUBTYPES_BY_TYPE[type].map((value) => (
										<SelectItem key={value} value={value}>
											{subtypeLabel(value)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
							<Textarea
								id={descriptionId}
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								placeholder="Optional. What belongs here."
							/>
						</Field>
					</FieldGroup>
				</form>

				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline" type="button">
							Cancel
						</Button>
					</SheetClose>
					<Button
						type="submit"
						form="create-account"
						disabled={create.isPending || code.trim() === "" || name.trim() === ""}
					>
						{create.isPending ? <Spinner data-icon="inline-start" /> : null}
						Add account
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
