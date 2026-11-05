"use client";

import { passwordProblem } from "@app/auth/password-policy";
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
import Add from "@carbon/icons-react/es/Add";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { generatePassword } from "@/lib/generate-password";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { CopyLine } from "./copy-line";
import {
	NO_EMAIL_NOTE,
	TemporaryPasswordField,
} from "./temporary-password-field";

const FORM = "add-member";

type Added = { name: string; email: string; password: string };

/** "Add member": only rendered for people who may change roles. */
export function AddMemberSheet() {
	const trpc = useTRPC();
	const cache = useCrmCache();

	const nameId = useId();
	const emailId = useId();
	const roleId = useId();

	const workspace = useQuery(trpc.workspace.get.queryOptions());

	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const [added, setAdded] = useState<Added | null>(null);

	const add = useMutation(
		trpc.workspace.addMember.mutationOptions({
			onSuccess: async (member, input) => {
				await cache.workspace();
				setAdded({
					name: member.name,
					email: member.email,
					password: input.password,
				});
			},
			onError: (error) => setProblem(error.message),
		}),
	);

	if (!workspace.data?.canChangeRoles) return null;

	const viewerRole = workspace.data.viewerRole;

	// An admin cannot hand out the owner role; the server refuses it too.
	const roles = workspace.data.roles.filter(
		(option) => option.id !== "owner" || viewerRole === "owner",
	);
	const chosenRole =
		role ?? roles.find((option) => option.id === "member")?.id ?? roles[0]?.id;

	function reset() {
		setName("");
		setEmail("");
		setRole(null);
		setPassword("");
		setProblem(null);
		setAdded(null);
	}

	return (
		<Sheet
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				// Random values are made in the browser, on open, never while rendering.
				if (next) setPassword(generatePassword());
				else reset();
			}}
		>
			<SheetTrigger asChild>
				<Button>
					<Icon icon={Add} data-icon="inline-start" />
					Add member
				</Button>
			</SheetTrigger>

			<SheetContent side="right">
				{added ? (
					<>
						<SheetHeader>
							<SheetTitle>{added.name} can sign in</SheetTitle>
							<SheetDescription>{NO_EMAIL_NOTE}</SheetDescription>
						</SheetHeader>

						<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
							<CopyLine label="Email" value={added.email} />
							<CopyLine
								label="Temporary password"
								value={added.password}
								mono
							/>
							<p className="text-pretty text-muted-foreground text-xs/relaxed">
								This is the only time the password is shown. If it is lost,
								choose Reset password on their row.
							</p>
						</div>

						<SheetFooter>
							<SheetClose asChild>
								<Button>Done</Button>
							</SheetClose>
						</SheetFooter>
					</>
				) : (
					<>
						<SheetHeader>
							<SheetTitle>Add member</SheetTitle>
							<SheetDescription>
								They sign in with this email and the temporary password below.
							</SheetDescription>
						</SheetHeader>

						<form
							id={FORM}
							noValidate
							className="flex-1 overflow-y-auto px-4"
							onSubmit={(event) => {
								event.preventDefault();
								setProblem(null);

								if (!name.trim() || !email.trim() || !chosenRole) {
									return setProblem("Fill in a name, an email and a role.");
								}

								const rule = passwordProblem(password);
								if (rule) return setProblem(rule);

								add.mutate({
									name: name.trim(),
									email: email.trim(),
									role: chosenRole,
									password,
								});
							}}
						>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor={nameId}>Name</FieldLabel>
									<Input
										id={nameId}
										value={name}
										onChange={(event) => setName(event.target.value)}
										autoComplete="off"
										maxLength={120}
										required
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor={emailId}>Email</FieldLabel>
									<Input
										id={emailId}
										type="email"
										inputMode="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										autoComplete="off"
										autoCapitalize="off"
										autoCorrect="off"
										spellCheck={false}
										required
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor={roleId}>Role</FieldLabel>
									<Select value={chosenRole} onValueChange={setRole}>
										<SelectTrigger id={roleId} className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{roles.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldDescription>
										You can change this later from the row menu.
									</FieldDescription>
								</Field>

								<TemporaryPasswordField
									value={password}
									onChange={setPassword}
								/>
							</FieldGroup>

							{problem ? (
								<p role="alert" className="mt-4 text-destructive text-sm/5">
									{problem}
								</p>
							) : null}
						</form>

						<SheetFooter>
							<Button type="submit" form={FORM} disabled={add.isPending}>
								{add.isPending ? <Spinner data-icon="inline-start" /> : null}
								Add member
							</Button>
							<SheetClose asChild>
								<Button variant="outline">Cancel</Button>
							</SheetClose>
						</SheetFooter>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
