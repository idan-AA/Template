import type { MailboxProviderId } from "@app/auth/scopes";
import { Separator } from "@app/ui/components/separator";
import type { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { CreateOwnerForm } from "./create-owner-form";
import { PasswordSignIn } from "./password-sign-in";
import { SocialSignIn } from "./social-sign-in";
import { type SsoProvider, SsoSignIn } from "./sso-sign-in";

export const metadata: Metadata = {
	title: "Sign in",
};

type SignInOptions = {
	google: boolean;
	microsoft: boolean;
	providers: SsoProvider[];
};

async function signInOptions(): Promise<SignInOptions | null> {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().sso.signInOptions.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the sign-in options.", error);
		return null;
	}
}

/** Whether this deploy has no accounts yet. Unknown counts as "no": the password form still works. */
async function needsOwner(): Promise<boolean> {
	try {
		const { needsOwner: needed } = await getServerQueryClient().fetchQuery(
			getServerTrpc().account.bootstrapStatus.queryOptions(),
		);
		return needed;
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not tell whether an owner exists.", error);
		return false;
	}
}

async function currentSession() {
	try {
		return await getSession();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the session.", error);
		return null;
	}
}

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
	return (
		<AuthShell>
			<Suspense
				fallback={
					<AuthHeading
						title="Welcome back"
						description="Sign in with your email and password."
					/>
				}
			>
				<SignIn searchParams={searchParams} />
			</Suspense>
		</AuthShell>
	);
}

async function SignIn({
	searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
	const [session, options, first, { method }] = await Promise.all([
		currentSession(),
		signInOptions(),
		needsOwner(),
		searchParams,
	]);

	if (session) {
		redirect("/");
	}

	if (first) {
		return (
			<>
				<AuthHeading
					title="Create the owner account"
					description="Nobody has an account yet, so you are first. You will add everyone else yourself, from Settings."
				/>

				<CreateOwnerForm />
			</>
		);
	}

	// Google and Microsoft appear only when this deploy has them set up.
	const configured: MailboxProviderId[] = [];
	if (options?.google) configured.push("google");
	if (options?.microsoft) configured.push("microsoft");

	const providers = options?.providers ?? [];

	const insisted = configured.find((provider) => provider === method);
	const showSso = providers.length > 0 && insisted === undefined;
	const social =
		insisted !== undefined
			? [insisted]
			: providers.length === 0
				? configured
				: [];

	const hasOthers = showSso || social.length > 0;

	return (
		<>
			<AuthHeading
				title="Welcome back"
				description="Sign in with your email and password."
			/>

			<PasswordSignIn />

			{hasOthers ? (
				<>
					<div
						className="flex items-center gap-3 text-muted-foreground text-xs/4"
						aria-hidden="true"
					>
						<Separator className="flex-1" />
						or
						<Separator className="flex-1" />
					</div>

					<div className="flex flex-col gap-3">
						{showSso ? <SsoSignIn providers={providers} /> : null}
						{social.map((provider) => (
							<SocialSignIn key={provider} provider={provider} />
						))}
					</div>
				</>
			) : null}
		</>
	);
}
