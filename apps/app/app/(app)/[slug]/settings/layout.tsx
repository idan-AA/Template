import { connection } from "next/server";
import { Suspense } from "react";
import { enabledSettingsNav } from "@/lib/modules";
import { CORE_SETTINGS_ITEMS } from "./settings-items";
import { SettingsSidebar, SettingsSidebarFallback } from "./settings-sidebar";

export default function SettingsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
			<Suspense
				fallback={
					<SettingsSidebarFallback
						items={enabledSettingsNav(CORE_SETTINGS_ITEMS)}
					/>
				}
			>
				<ModuleSettingsSidebar />
			</Suspense>
			{children}
		</div>
	);
}

async function ModuleSettingsSidebar() {
	await connection();

	return <SettingsSidebar items={enabledSettingsNav(CORE_SETTINGS_ITEMS)} />;
}
