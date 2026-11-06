import { ModuleGate } from "@/components/module-gate";

/** Part of the CRM module: a workspace without it answers 404 here. */
export default function CrmLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <ModuleGate id="crm">{children}</ModuleGate>;
}
