import { defineModule } from "../src/define-module";

/**
 * The business keeping its own books. This file is the contract the bookkeeping
 * build codes against: the eight permission keys and the two roles come from
 * docs/plan/bookkeeping.md section 8. The rail gets one "Books" item; the sections
 * inside it (Accounting and Reports now, Sales, Purchases and Banking later) are a
 * bar inside the Books pages, not more rail items.
 */
export const bookkeeping = defineModule({
	id: "bookkeeping",
	label: "Books",
	description:
		"Keep your own books: chart of accounts, journal, trial balance and general ledger, with closing dates and numbering.",
	routers: [
		"bookkeeping",
		"bookkeepingAccounts",
		"bookkeepingJournal",
		"bookkeepingSettings",
		"bookkeepingReports",
	],
	requires: [],
	nav: [{ title: "Books", href: "/books", icon: "ledger", match: "prefix" }],
	settings: [
		{ title: "Books", href: "/settings/books", after: "/settings/currencies" },
	],
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
