import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AccountPassword } from "./account-password";

export const metadata: Metadata = {
	title: "Account",
};

export default function AccountSettingsPage() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Account</PageShellTitle>
					<PageShellDescription>
						Your own sign-in. Everyone else is managed under Members.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Account />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Account() {
	const { user } = await requireSession();

	const state = await getServerQueryClient().fetchQuery(
		getServerTrpc().account.state.queryOptions(),
	);

	return <AccountPassword email={user.email} hasPassword={state.hasPassword} />;
}
