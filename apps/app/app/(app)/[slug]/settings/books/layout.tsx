import { ModuleGate } from "@/components/module-gate";

/** Part of the bookkeeping module: a deploy or person without it gets the 404 page here. */
export default function BooksSettingsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <ModuleGate id="bookkeeping">{children}</ModuleGate>;
}
