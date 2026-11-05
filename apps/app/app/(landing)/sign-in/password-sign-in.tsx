"use client";

import { signIn } from "@app/auth/client";
import { Button } from "@app/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import { Spinner } from "@app/ui/components/spinner";
import { useId, useState } from "react";
import { PasswordInput } from "@/components/password-input";

/** One sentence for every way this can fail. It never says which half was wrong. */
function sentenceFor(error: { status?: number; message?: string }): string {
	if (error.status === 429) {
		return "Too many tries. Wait a minute and try again.";
	}

	if (error.status === 401 || error.status === 400) {
		return "That email and password do not match. Check them and try again.";
	}

	return "Could not reach the sign-in service. Try again in a moment.";
}

export function PasswordSignIn() {
	const emailId = useId();
	const passwordId = useId();
	const errorId = useId();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [problem, setProblem] = useState<string | null>(null);

	async function submit() {
		setPending(true);
		setProblem(null);

		const { error } = await signIn.email({ email: email.trim(), password });

		if (error) {
			setProblem(sentenceFor(error));
			setPending(false);
			return;
		}

		// A full load: the proxy decides where this person goes next
		// (choose a password, set up the company, or straight in).
		window.location.assign("/");
	}

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				submit().catch(() => {
					setProblem(sentenceFor({}));
					setPending(false);
				});
			}}
		>
			<FieldGroup>
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
						autoFocus
						required
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						aria-describedby={problem ? errorId : undefined}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
					<PasswordInput
						id={passwordId}
						name="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						aria-describedby={problem ? errorId : undefined}
					/>
				</Field>
			</FieldGroup>

			{problem ? (
				<p id={errorId} role="alert" className="text-destructive text-sm/5">
					{problem}
				</p>
			) : null}

			<Button type="submit" className="w-full" disabled={pending}>
				{pending ? <Spinner data-icon="inline-start" /> : null}
				Sign in
			</Button>

			<p className="text-muted-foreground text-sm/5">
				Forgot your password? An owner or admin of this workspace can set a new
				one for you in Settings, Members.
			</p>
		</form>
	);
}
