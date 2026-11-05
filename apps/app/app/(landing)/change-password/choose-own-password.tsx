"use client";

import { Button } from "@app/ui/components/button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { signOutAndRedirect } from "@/lib/sign-out";

export function ChooseOwnPassword() {
	return (
		<>
			<ChangePasswordForm
				submitLabel="Save and continue"
				askCurrent={false}
				// A full load, so the proxy checks again and moves on to the next step.
				onDone={() => window.location.assign("/")}
			/>

			<Button
				variant="ghost"
				type="button"
				className="self-start"
				onClick={() => void signOutAndRedirect()}
			>
				Sign out
			</Button>
		</>
	);
}
