import { defineModule } from "../src/define-module";

/**
 * The sales side of the product: companies, contacts, deals and the activity
 * that ties them together. Pure data. The CRM code itself still lives where it
 * always did; moving it behind this module is a later phase.
 */
export const crm = defineModule({
	id: "crm",
	label: "CRM",
	description:
		"Companies, contacts and deals, with the activity and research that ties them together.",
	routers: [
		"companies",
		"contacts",
		"deals",
		"activities",
		"enrichment",
		"savedViews",
		"tracking",
	],
	requires: [],
	nav: [
		{
			title: "Companies",
			href: "/companies",
			icon: "company",
			match: "prefix",
		},
		{ title: "Contacts", href: "/contacts", icon: "contact", match: "prefix" },
		{ title: "Deals", href: "/deals", icon: "deal", match: "prefix" },
	],
	settings: [
		{
			title: "Tracking & Analytics",
			href: "/settings/tracking",
			after: "/settings",
		},
	],
	widgets: [{ id: "crm.sales", slot: "overview" }],
	roles: [],
	permissions: {
		"crm.read": ["owner", "admin", "member"],
		"crm.write": ["owner", "admin", "member"],
		"crm.tracking": ["owner", "admin"],
	},
	fieldEntities: ["COMPANY", "CONTACT", "DEAL"],
});
