"use client";

import { Button } from "@app/ui/components/button";
import { Icon } from "@app/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@app/ui/components/input-group";
import View from "@carbon/icons-react/es/View";
import ViewOff from "@carbon/icons-react/es/ViewOff";
import { type ComponentProps, useState } from "react";

type PasswordInputProps = Omit<
	ComponentProps<typeof InputGroupInput>,
	"type" | "autoComplete"
> & {
	/** `current-password` when signing in, `new-password` when choosing one. */
	autoComplete: "current-password" | "new-password";
	/** Start with the characters showing, for a password someone has to read out. */
	revealed?: boolean;
};

/** A password field with a show/hide control, sized for a thumb (44px target). */
export function PasswordInput({
	autoComplete,
	revealed = false,
	...props
}: PasswordInputProps) {
	const [shown, setShown] = useState(revealed);

	return (
		<InputGroup>
			<InputGroupInput
				{...props}
				type={shown ? "text" : "password"}
				autoComplete={autoComplete}
				autoCapitalize="off"
				autoCorrect="off"
				spellCheck={false}
			/>
			<InputGroupAddon align="inline-end">
				<Button
					variant="ghost"
					size="icon"
					type="button"
					aria-label={shown ? "Hide password" : "Show password"}
					aria-pressed={shown}
					onClick={() => setShown((current) => !current)}
				>
					<Icon icon={shown ? ViewOff : View} />
				</Button>
			</InputGroupAddon>
		</InputGroup>
	);
}
