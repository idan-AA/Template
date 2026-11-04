"use client";

export type CtaLocation = "hero" | "closing";

export function LandingAnalytics() {
	return null;
}

export function captureLanding(
	_event: "setup_prompt_copied" | "github_star_clicked",
	_location: CtaLocation,
): void {}
