import type { ModuleId } from "@app/modules/registry";
import { Suspense } from "react";
import { requireModuleOn } from "@/lib/modules";

/**
 * Wraps the routes of a module: a person who cannot use the module gets the
 * 404 page, as if the route did not exist. The check asks the API which modules
 * are on right now (the developer account switches them at runtime), so it runs
 * inside Suspense with the rest of the request-time work.
 */
export function ModuleGate({
	id,
	children,
}: Readonly<{ id: ModuleId; children: React.ReactNode }>) {
	return (
		<Suspense fallback={null}>
			<Gate id={id}>{children}</Gate>
		</Suspense>
	);
}

async function Gate({
	id,
	children,
}: Readonly<{ id: ModuleId; children: React.ReactNode }>) {
	await requireModuleOn(id);

	return children;
}
