import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
	AgentShellHintView,
	AgentShellNoticeView,
	NOT_AVAILABLE_TITLE,
	shellStateFrom,
} from "../components/agent-builder/agent-shell-view";

describe("shellStateFrom", () => {
	it("is available before the answer arrives", () => {
		expect(shellStateFrom(undefined)).toEqual({
			available: true,
			reason: null,
		});
	});

	it("is available when the API says the shell works", () => {
		expect(shellStateFrom({ shell: true, reason: null }).available).toBe(true);
	});

	it("carries the reason when it does not", () => {
		expect(shellStateFrom({ shell: false, reason: "No shell here." })).toEqual({
			available: false,
			reason: "No shell here.",
		});
	});
});

describe("AgentShellNoticeView", () => {
	it("renders nothing when available", () => {
		const html = renderToStaticMarkup(
			createElement(AgentShellNoticeView, {
				state: { available: true, reason: null },
			}),
		);

		expect(html).toBe("");
	});

	it("says it is not available and why, in a status region", () => {
		const html = renderToStaticMarkup(
			createElement(AgentShellNoticeView, {
				state: { available: false, reason: "This host has no sandbox shell." },
			}),
		);

		expect(html).toContain(NOT_AVAILABLE_TITLE);
		expect(html).toContain("This host has no sandbox shell.");
		expect(html).toContain('role="status"');
	});
});

describe("AgentShellHintView", () => {
	it("renders nothing when available", () => {
		expect(
			renderToStaticMarkup(
				createElement(AgentShellHintView, {
					state: { available: true, reason: null },
				}),
			),
		).toBe("");
	});

	it("puts the reason on the page as text, not in a title", () => {
		const html = renderToStaticMarkup(
			createElement(AgentShellHintView, {
				state: { available: false, reason: "This host has no sandbox shell." },
			}),
		);

		expect(html).toContain(NOT_AVAILABLE_TITLE);
		expect(html).toContain("This host has no sandbox shell.");
		expect(html).toContain('role="note"');
		expect(html).not.toContain("title=");
	});
});
