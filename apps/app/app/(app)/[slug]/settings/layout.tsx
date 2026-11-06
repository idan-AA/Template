import { connection } from "next/server";
import { Suspense } from "react";
import { enabledSettingsNav, getModuleView } from "@/lib/modules";
import { CORE_SETTINGS_ITEMS, FEATURES_HREF } from "./settings-items";
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
						items={enabledSettingsNav(
							CORE_SETTINGS_ITEMS.filter((item) => item.href !== FEATURES_HREF),
						)}
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
	const view = await getModuleView();

	// Features is the developer account's page: nobody else sees it in the list.
	const core = CORE_SETTINGS_ITEMS.filter(
		(item) => view.isDeveloper || item.href !== FEATURES_HREF,
	);

	return <SettingsSidebar items={enabledSettingsNav(core, view.modules)} />;
}
