import type { Db } from "@app/db";
import { writeAudit } from "@app/db/audit";
import { pinDeveloperIfUnset, readDeveloperPin } from "@app/db/module-switches";

/**
 * The developer account: the one person who can switch modules on and off for
 * a client. It is named by `DEVELOPER_EMAIL` and pinned to a user id the first
 * time that address signs in, so a look-alike account created later (an
 * admin-added member, an SSO identity the client configured) can never claim
 * it. Server code only.
 *
 * The developer keeps the stored role `owner`: every existing owner check keeps
 * working unchanged. Being the developer adds the module switches and the
 * "see everything" view on top.
 */

/** The configured address, lower-cased, or null when this deploy has no developer. */
export function developerEmail(): string | null {
	const value = process.env.DEVELOPER_EMAIL?.trim().toLowerCase();
	return value ? value : null;
}

/** True when `email` is the reserved developer address. Pure, no database. */
export function isDeveloperEmail(email: string | null | undefined): boolean {
	const reserved = developerEmail();
	if (!reserved || !email) return false;

	return email.trim().toLowerCase() === reserved;
}

type Pinned = { email: string; userId: string };

/** The pin never changes once set, so a process asks the database at most once per address. */
let known: Pinned | null = null;

export function resetDeveloperCache(): void {
	known = null;
}

type DeveloperDb = Pick<Db, "$transaction" | "appSetting">;

/**
 * Whether this signed-in user is the developer. A user whose email is not the
 * reserved address is never the developer, and that answer costs no query.
 */
export async function isDeveloper(
	db: DeveloperDb,
	user: { id: string; email: string },
): Promise<boolean> {
	if (!isDeveloperEmail(user.email)) return false;

	const email = developerEmail() as string;
	if (known && known.email === email) return known.userId === user.id;

	const pin = await readDeveloperPin(db);

	if (pin) {
		known = { email, userId: pin };
		return pin === user.id;
	}

	// First sign-in of the reserved address: claim the pin and record it.
	const claimed = await db.$transaction(async (tx) => {
		const set = await pinDeveloperIfUnset(tx, user.id);

		if (set) {
			await writeAudit(tx, {
				module: "core",
				actorType: "USER",
				actorId: user.id,
				actorLabel: user.email,
				action: "DEVELOPER_PINNED",
				entityType: "user",
				entityId: user.id,
				summary: `Developer account pinned to ${user.email}`,
			});
		}

		return set;
	});

	if (claimed) {
		known = { email, userId: user.id };
		return true;
	}

	// Someone else won the race (or a pin appeared): read it and compare.
	const winner = await readDeveloperPin(db);

	if (winner) known = { email, userId: winner };

	return winner === user.id;
}
