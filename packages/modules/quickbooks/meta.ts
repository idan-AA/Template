import { defineModule } from "../src/define-module";

/**
 * The business that already keeps its books in QuickBooks Online. QuickBooks stays
 * the official books; this module connects the CRM to it. It is an integration,
 * not an app area, so it has no rail item: a settings page for the connection
 * now, and chips on company and deal pages and overview widgets in later rounds.
 *
 * It conflicts with `bookkeeping` (the built-in Books): a business keeps one set
 * of books. The conflict is declared here only; the relation is symmetric, so the
 * Books module's own meta.ts does not change. See docs/plan/quickbooks-connector.md.
 */
export const quickbooks = defineModule({
	id: "quickbooks",
	label: "QuickBooks",
	description:
		"Connect your QuickBooks Online. Create invoices from won deals and see who owes you, right in the CRM. Your books stay in QuickBooks.",
	routers: ["quickbooks"],
	requires: ["crm"],
	conflicts: ["bookkeeping"],
	conflictNote: "A business keeps one set of books.",
	nav: [],
	settings: [
		{
			title: "QuickBooks",
			href: "/settings/quickbooks",
			after: "/settings/connections",
		},
	],
	widgets: [],
	roles: [],
	permissions: {
		// See balances and invoice status.
		"quickbooks.read": ["owner", "admin", "member"],
		// Connect, reconnect and disconnect QuickBooks.
		"quickbooks.connect": ["owner", "admin"],
	},
	fieldEntities: [],
});
