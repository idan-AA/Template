"use client";

import { passwordProblem } from "@app/auth/password-policy";
import { Button } from "@app/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@app/ui/components/field";
import { Spinner } from "@app/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/password-input";
import { useTRPC } from "@/lib/trpc/client";

/**
 * Current password, new password, new password again. Used on the screen that
 * stops a person with a temporary password, and on Settings, Account.
 */
export function ChangePasswordForm({
	submitLabel = "Change password",
	askCurrent = true,
	onDone,
}: {
	submitLabel?: string;
	/** False on the forced change: the temporary password was just typed to sign in. */
	askCurrent?: boolean;
	onDone: () => void;
}) {
	const trpc = useTRPC();

	const currentId = useId();
	const newId = useId();
	const confirmId = useId();
	const errorId = useId();

	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	const change = useMutation(
		trpc.account.changePassword.mutationOptions({
			onSuccess: () => {
				toast.success("Password changed.");
				onDone();
			},
			onError: (error) => setProblem(error.message),
		}),
	);

	return (
		<form
			className="flex flex-col gap-6"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				setProblem(null);

				const rule = passwordProblem(next);
				if (rule) return setProblem(rule);
				if (next !== confirm) {
					return setProblem("The two new passwords are not the same.");
				}
				if (askCurrent && next === current) {
					return setProblem("Choose a password you have not been using.");
				}

				change.mutate({
					currentPassword: askCurrent ? current : undefined,
					newPassword: next,
				});
			}}
		>
			<FieldGroup>
				{askCurrent ? (
					<Field>
						<FieldLabel htmlFor={currentId}>Current password</FieldLabel>
						<PasswordInput
							id={currentId}
							name="currentPassword"
							autoComplete="current-password"
							value={current}
							onChange={(event) => setCurrent(event.target.value)}
							aria-describedby={problem ? errorId : undefined}
							required
						/>
					</Field>
				) : null}

				<Field>
					<FieldLabel htmlFor={newId}>New password</FieldLabel>
					<PasswordInput
						id={newId}
						name="newPassword"
						autoComplete="new-password"
						value={next}
						onChange={(event) => setNext(event.target.value)}
						aria-describedby={problem ? errorId : undefined}
						required
					/>
					<FieldDescription>
						At least 10 characters. A few words in a row is easy to remember and
						hard to guess.
					</FieldDescription>
				</Field>

				<Field>
					<FieldLabel htmlFor={confirmId}>New password again</FieldLabel>
					<PasswordInput
						id={confirmId}
						name="confirmPassword"
						autoComplete="new-password"
						value={confirm}
						onChange={(event) => setConfirm(event.target.value)}
						aria-describedby={problem ? errorId : undefined}
						required
					/>
				</Field>
			</FieldGroup>

			{problem ? (
				<p id={errorId} role="alert" className="text-destructive text-sm/5">
					{problem}
				</p>
			) : null}

			<Button
				type="submit"
				className="w-full sm:w-auto sm:self-start"
				disabled={
					change.isPending || (askCurrent && !current) || !next || !confirm
				}
			>
				{change.isPending ? <Spinner data-icon="inline-start" /> : null}
				{submitLabel}
			</Button>
		</form>
	);
}
