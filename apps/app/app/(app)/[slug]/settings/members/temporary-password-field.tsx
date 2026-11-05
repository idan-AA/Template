"use client";

import { Button } from "@app/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@app/ui/components/field";
import { Icon } from "@app/ui/components/icon";
import Renew from "@carbon/icons-react/es/Renew";
import { useId } from "react";
import { PasswordInput } from "@/components/password-input";
import { generatePassword } from "@/lib/generate-password";
import { CopyValue } from "../copy-value";

/** The one line that tells the admin how the password reaches the person. */
export const NO_EMAIL_NOTE =
	"No email is sent. Give this password to them yourself; they choose their own when they first sign in.";

/**
 * A password an admin sets for someone else: visible, generated on request,
 * copyable. It is temporary, so it is shown in the clear on purpose.
 */
export function TemporaryPasswordField({
	value,
	onChange,
	label = "Temporary password",
}: {
	value: string;
	onChange: (next: string) => void;
	label?: string;
}) {
	const id = useId();

	return (
		<Field>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<div className="flex flex-wrap items-center gap-1">
				<div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
					<PasswordInput
						id={id}
						name="temporaryPassword"
						autoComplete="new-password"
						revealed
						className="font-mono"
						value={value}
						onChange={(event) => onChange(event.target.value)}
						required
					/>
				</div>
				<CopyValue value={value} label="Password" />
				<Button
					type="button"
					variant="outline"
					onClick={() => onChange(generatePassword())}
				>
					<Icon icon={Renew} data-icon="inline-start" />
					Generate
				</Button>
			</div>
			<FieldDescription>
				At least 10 characters. {NO_EMAIL_NOTE}
			</FieldDescription>
		</Field>
	);
}
