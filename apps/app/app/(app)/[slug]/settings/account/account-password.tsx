"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/ui/components/card";
import { useState } from "react";
import { ChangePasswordForm } from "@/components/change-password-form";

export function AccountPassword({
	email,
	hasPassword,
}: {
	email: string;
	hasPassword: boolean;
}) {
	// Remounting clears the three fields after a change.
	const [round, setRound] = useState(0);

	return (
		<Card className="min-w-0 max-w-xl self-start">
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>
					{hasPassword
						? `You sign in as ${email}. Changing your password signs you out everywhere else.`
						: `You sign in as ${email} with Google, Microsoft or SSO, so there is no password to change. An owner or admin can set one for you in Settings, Members.`}
				</CardDescription>
			</CardHeader>
			{hasPassword ? (
				<CardContent>
					<ChangePasswordForm
						key={round}
						onDone={() => setRound((current) => current + 1)}
					/>
				</CardContent>
			) : null}
		</Card>
	);
}
