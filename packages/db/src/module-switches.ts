import type { Db } from "./client";
import { SETTINGS_ID } from "./settings";

/**
 * Runtime module switches and the developer pin. Plain reads and writes only:
 * which modules exist, and whether a switch is allowed, is decided by the
 * callers in `@app/modules` and the API.
 */

export type ModuleSwitchRow = {
	moduleId: string;
	enabled: boolean;
	changedById: string | null;
	changedAt: Date;
};

/** Every explicit switch. No row for a module means its client config decides. */
export async function readModuleSwitches(
	db: Pick<Db, "moduleSwitch">,
): Promise<ModuleSwitchRow[]> {
	return db.moduleSwitch.findMany({
		select: {
			moduleId: true,
			enabled: true,
			changedById: true,
			changedAt: true,
		},
		orderBy: { moduleId: "asc" },
	});
}

/** The user id the developer account is pinned to, or null before the first sign-in. */
export async function readDeveloperPin(
	db: Pick<Db, "appSetting">,
): Promise<string | null> {
	const row = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { developerUserId: true },
	});

	return row?.developerUserId ?? null;
}

/**
 * Pins the developer to `userId` only if nothing is pinned yet. Returns true
 * when this call set the pin. The conditional update makes two sign-ins at the
 * same moment safe: exactly one of them wins.
 */
export async function pinDeveloperIfUnset(
	db: Pick<Db, "appSetting">,
	userId: string,
): Promise<boolean> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID },
		update: {},
	});

	const result = await db.appSetting.updateMany({
		where: { id: SETTINGS_ID, developerUserId: null },
		data: { developerUserId: userId },
	});

	return result.count === 1;
}
