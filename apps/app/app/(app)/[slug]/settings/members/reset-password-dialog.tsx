"use client";

import { passwordProblem } from "@app/auth/password-policy";
import { Button } from "@app/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@app/ui/components/dialog";
import { Spinner } from "@app/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { generatePassword } from "@/lib/generate-password";
import { useTRPC } from "@/lib/trpc/client";
import { CopyLine } from "./copy-line";
import {
	NO_EMAIL_NOTE,
	TemporaryPasswordField,
} from "./temporary-password-field";

export type ResetTarget = { id: string; name: string };

/** Sets a new temporary password for one member and shows it once. */
export function ResetPasswordDialog({
	member,
	onClose,
}: {
	member: ResetTarget | null;
	onClose: () => void;
}) {
	return (
		<Dialog
			open={member !== null}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<DialogContent>
				{/* Keyed so each person starts with a fresh password and a clean slate. */}
				{member ? (
					<ResetForm key={member.id} member={member} onClose={onClose} />
				) : null}
			</DialogContent>
		</Dialog>
	);
}

function ResetForm({
	member,
	onClose,
}: {
	member: ResetTarget;
	onClose: () => void;
}) {
	const trpc = useTRPC();

	const [password, setPassword] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const [done, setDone] = useState<string | null>(null);

	const reset = useMutation(
		trpc.workspace.resetMemberPassword.mutationOptions({
			onSuccess: (_result, input) => setDone(input.password),
			onError: (error) => setProblem(error.message),
		}),
	);

	// Random values are made in the browser after mount, never while rendering.
	useEffect(() => setPassword(generatePassword()), []);

	if (done) {
		return (
			<>
				<DialogHeader>
					<DialogTitle>New password for {member.name}</DialogTitle>
					<DialogDescription>
						They are signed out everywhere and must choose their own password
						when they sign in. {NO_EMAIL_NOTE}
					</DialogDescription>
				</DialogHeader>

				<CopyLine label="Temporary password" value={done} mono />

				<DialogFooter>
					<Button onClick={onClose}>Done</Button>
				</DialogFooter>
			</>
		);
	}

	return (
		<form
			className="flex flex-col gap-4"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				setProblem(null);

				const rule = passwordProblem(password);
				if (rule) return setProblem(rule);

				reset.mutate({ memberId: member.id, password });
			}}
		>
			<DialogHeader>
				<DialogTitle>Reset password for {member.name}</DialogTitle>
				<DialogDescription>
					Sets a new temporary password and signs them out everywhere.
				</DialogDescription>
			</DialogHeader>

			<TemporaryPasswordField value={password} onChange={setPassword} />

			{problem ? (
				<p role="alert" className="text-destructive text-sm/5">
					{problem}
				</p>
			) : null}

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={reset.isPending}>
					{reset.isPending ? <Spinner data-icon="inline-start" /> : null}
					Set new password
				</Button>
			</DialogFooter>
		</form>
	);
}
