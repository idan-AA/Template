import { ModuleGate } from "@/components/module-gate";

/** Part of the quickbooks module: a deploy or person without it gets the 404 page here. */
export default function QuickbooksSettingsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <ModuleGate id="quickbooks">{children}</ModuleGate>;
}
