import { describe, expect, it } from "bun:test";
import { listIsNarrowed } from "./list-filters";

describe("listIsNarrowed", () => {
	it("is false for a bare list and for the all tab", () => {
		expect(listIsNarrowed({ q: "", filters: {} })).toBe(false);
		expect(listIsNarrowed({ q: "  ", filters: { stage: ["all"] } })).toBe(false);
		expect(listIsNarrowed({ q: "", filters: { owner: [] } })).toBe(false);
	});

	it("is true once a search or any filter is set", () => {
		expect(listIsNarrowed({ q: "acme", filters: {} })).toBe(true);
		expect(listIsNarrowed({ q: "", filters: { owner: ["u1"] } })).toBe(true);
		expect(listIsNarrowed({ q: "", filters: { "field:size": ["big"] } })).toBe(
			true,
		);
	});
});
