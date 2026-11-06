import { redirect } from "next/navigation";
import { workspaceUrl } from "@/lib/workspace-url";

/** Accounting has no landing page of its own: its first tab is the chart of accounts. */
export default async function AccountingPage({
	params,
}: PageProps<"/[slug]/books/accounting">) {
	const { slug } = await params;

	redirect(workspaceUrl(slug, "/books/accounting/accounts"));
}
