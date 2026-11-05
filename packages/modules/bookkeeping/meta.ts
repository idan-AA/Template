import { defineModule } from "../src/define-module";

/**
 * The business keeping its own books. This file is the contract the bookkeeping
 * build codes against: the eight permission keys and the two roles come from
 * docs/plan/bookkeeping.md section 8. Nav and settings items are added by the
 * bookkeeping build; today the module only declares an overview widget.
 */
export const bookkeeping = defineModule({
	id: "bookkeeping",
	label: "Books",
	requires: [],
	nav: [],
	settings: [],
	widgets: [{ id: "bookkeeping.overview", slot: "overview" }],
	roles: [
		{ id: "bookkeeper", label: "Bookkeeper" },
		{ id: "accountant", label: "Accountant" },
	],
	permissions: {
		"bookkeeping.read": [
			"owner",
			"admin",
			"bookkeeper",
			"accountant",
			"member",
		],
		"bookkeeping.write": [
			"owner",
			"admin",
			"bookkeeper",
			"accountant",
			"member",
		],
		"bookkeeping.post": ["owner", "admin", "bookkeeper", "accountant"],
		"bookkeeping.bank": ["owner", "admin", "bookkeeper", "accountant"],
		"bookkeeping.reports": ["owner", "admin", "bookkeeper", "accountant"],
		"bookkeeping.settings": ["owner", "admin", "accountant"],
		"bookkeeping.lock": ["owner", "admin", "accountant"],
		"bookkeeping.reopen": ["owner"],
	},
	fieldEntities: [],
});
