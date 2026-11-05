import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ChooseOwnPassword } from "./choose-own-password";

export const metadata: Metadata = {
	title: "Choose a password",
};

export const instant = false;

/** Where the proxy sends a person whose password was set by someone else. */
export default async function ChangePasswordPage() {
	await requireSession();

	const state = await getServerQueryClient().fetchQuery(
		getServerTrpc().account.state.queryOptions(),
	);

	if (!state.passwordChangeRequired) redirect("/");

	return (
		<AuthShell>
			<AuthHeading
				title="Choose your own password"
				description="The one you were given is temporary. Pick a password only you know, then carry on."
			/>

			<ChooseOwnPassword />
		</AuthShell>
	);
}
