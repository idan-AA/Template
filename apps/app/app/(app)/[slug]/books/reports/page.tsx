import type { Metadata } from "next";
import Link from "next/link";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/ui/components/card";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { workspaceUrl } from "@/lib/workspace-url";

export const metadata: Metadata = {
	title: "Reports",
};

const REPORTS = [
	{
		href: "/books/reports/trial-balance",
		title: "Trial balance",
		description:
			"Every account and its balance on a date. Total debits equal total credits, and the report shows the proof.",
	},
	{
		href: "/books/reports/general-ledger",
		title: "General ledger",
		description:
			"Every posted line of one account over a date range, with the balance after each.",
	},
];

export default async function ReportsPage({
	params,
}: PageProps<"/[slug]/books/reports">) {
	const { slug } = await params;

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Reports</PageShellTitle>
					<PageShellDescription>
						Profit and loss, balance sheet and aging arrive with invoices and
						bills.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<div className="grid gap-4 sm:grid-cols-2">
					{REPORTS.map((report) => (
						<Link key={report.href} href={workspaceUrl(slug, report.href)}>
							<Card className="h-full transition-colors hover:bg-muted/50">
								<CardHeader>
									<CardTitle>{report.title}</CardTitle>
									<CardDescription>{report.description}</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			</PageShellContent>
		</PageShell>
	);
}
