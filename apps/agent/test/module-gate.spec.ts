import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The tools that read or write CRM records. While the CRM is switched off they must say so instead of working. */
const CRM_TOOLS = [
	"enrich_company",
	"fetch_contact_photo",
	"find_contact_socials",
	"get_contact_work_history",
	"identify_contact",
	"list_deals",
	"list_outstanding_work",
	"read_company_history",
	"read_crm_history",
	"read_deal_history",
	"record_fact",
	"record_job_change",
	"research_company",
	"schedule_recheck",
	"search_crm",
	"set_contact_socials",
	"set_field_value",
];

describe("CRM tools while the CRM is switched off", () => {
	for (const tool of CRM_TOOLS) {
		it(`${tool} checks the module before it does anything`, () => {
			const source = readFileSync(
				join(import.meta.dir, "..", "agent", "tools", `${tool}.ts`),
				"utf8",
			);
			// The first statement of execute, not buried after a write.
			const firstStatement = source.match(
				/async execute\([^\n]*\) \{\n\s*([^\n]*)/,
			)?.[1];

			expect(firstStatement).toBe("await requireCrm();");
		});
	}
});
