"use client";

import { signIn } from "@app/auth/client";
import { passwordProblem } from "@app/auth/password-policy";
import { Button } from "@app/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import { Spinner } from "@app/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { PasswordInput } from "@/components/password-input";
import { useTRPC } from "@/lib/trpc/client";

/** The first screen of a new deploy: it makes the owner, then signs them in. */
export function CreateOwnerForm() {
	const trpc = useTRPC();

	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const errorId = useId();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const [signingIn, setSigningIn] = useState(false);

	const create = useMutation(
		trpc.account.createOwner.mutationOptions({
			onSuccess: async () => {
				setSigningIn(true);

				const { error } = await signIn.email({ email: email.trim(), password });

				if (error) {
					setSigningIn(false);
					setProblem(
						"The account was created, but signing in failed. Reload this page and sign in with the email and password you just chose.",
					);
					return;
				}

				// Next stop is setting up the company, which the proxy sends them to.
				window.location.assign("/");
			},
			onError: (error) => setProblem(error.message),
		}),
	);

	const busy = create.isPending || signingIn;

	return (
		<form
			className="flex flex-col gap-6"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				setProblem(null);

				const rule = passwordProblem(password);
				if (rule) return setProblem(rule);

				create.mutate({ name: name.trim(), email: email.trim(), password });
			}}
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={nameId}>Your name</FieldLabel>
					<Input
						id={nameId}
						name="name"
						autoComplete="name"
						autoFocus
						required
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor={emailId}>Email</FieldLabel>
					<Input
						id={emailId}
						name="email"
						type="email"
						inputMode="email"
						autoComplete="username"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
						required
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
					<PasswordInput
						id={passwordId}
						name="password"
						autoComplete="new-password"
						required
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						aria-describedby={problem ? errorId : undefined}
					/>
					<FieldDescription>
						At least 10 characters. A few words in a row is easy to remember and
						hard to guess.
					</FieldDescription>
				</Field>
			</FieldGroup>

			{problem ? (
				<p id={errorId} role="alert" className="text-destructive text-sm/5">
					{problem}
				</p>
			) : null}

			<Button
				type="submit"
				className="w-full"
				disabled={busy || !name.trim() || !email.trim() || !password}
			>
				{busy ? <Spinner data-icon="inline-start" /> : null}
				Create the owner account
			</Button>
		</form>
	);
}
