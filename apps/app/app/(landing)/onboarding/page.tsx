import type { Metadata } from "next";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { isCrmEnabled } from "@/lib/modules";
import { requireMailboxAccess } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
	title: "Set up",
};

export const instant = false;

export default async function OnboardingPage() {
	await requireMailboxAccess();

	return (
		<AuthShell>
			<AuthHeading
				title="Tell us about your company"
				description="Two things, once. The name is what your workspace is called; the website is optional."
			/>

			<OnboardingForm placeholder="Acme Studio" researchStep={isCrmEnabled()} />
		</AuthShell>
	);
}
