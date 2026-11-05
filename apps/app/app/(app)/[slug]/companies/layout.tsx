import { requireModule } from "@/lib/modules";

/** Part of the CRM module: a deploy without it answers 404 here. */
export default function CrmLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	requireModule("crm");

	return children;
}
