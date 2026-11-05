import type { Prisma } from "@app/db";
import {
	CREDENTIAL_PROVIDER_ID,
	hashPassword,
	verifyPassword,
} from "./password";

type Tx = Prisma.TransactionClient;

export class EmailTakenError extends Error {
	constructor() {
		super("That email address already has an account.");
		this.name = "EmailTakenError";
	}
}

/** Emails are stored lower case, the way better-auth looks them up at sign-in. */
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export type NewPasswordUser = {
	name: string;
	email: string;
	password: string;
	/** True when someone else chose the password: the person must replace it. */
	passwordChangeRequired: boolean;
};

/**
 * Creates a user who signs in with a password, inside the caller's transaction.
 * This is the only place accounts with a password are born: better-auth's own
 * sign-up is switched off, so no request can create an account on its own.
 * Throws `EmailTakenError` if the address is already used.
 */
export async function createPasswordUser(
	tx: Tx,
	input: NewPasswordUser,
): Promise<{ id: string; email: string }> {
	const email = normalizeEmail(input.email);

	const existing = await tx.user.findUnique({
		where: { email },
		select: { id: true },
	});

	if (existing) throw new EmailTakenError();

	const id = crypto.randomUUID();
	const now = new Date();

	await tx.user.create({
		data: {
			id,
			name: input.name.trim(),
			email,
			emailVerified: true,
			passwordChangeRequired: input.passwordChangeRequired,
			createdAt: now,
			updatedAt: now,
		},
	});

	await tx.account.create({
		data: {
			id: crypto.randomUUID(),
			accountId: id,
			providerId: CREDENTIAL_PROVIDER_ID,
			userId: id,
			password: await hashPassword(input.password),
			createdAt: now,
			updatedAt: now,
		},
	});

	return { id, email };
}

/**
 * Sets (or first sets) the password for an existing user and records whether
 * they must replace it. A person who so far signed in with Google gets a
 * password sign-in added next to it.
 */
export async function setPassword(
	tx: Tx,
	userId: string,
	password: string,
	options: { passwordChangeRequired: boolean },
): Promise<void> {
	const hash = await hashPassword(password);
	const now = new Date();

	const credential = await tx.account.findFirst({
		where: { userId, providerId: CREDENTIAL_PROVIDER_ID },
		select: { id: true },
	});

	if (credential) {
		await tx.account.update({
			where: { id: credential.id },
			data: { password: hash, updatedAt: now },
		});
	} else {
		await tx.account.create({
			data: {
				id: crypto.randomUUID(),
				accountId: userId,
				providerId: CREDENTIAL_PROVIDER_ID,
				userId,
				password: hash,
				createdAt: now,
				updatedAt: now,
			},
		});
	}

	await tx.user.update({
		where: { id: userId },
		data: {
			passwordChangeRequired: options.passwordChangeRequired,
			updatedAt: now,
		},
	});
}

/** Whether `password` is this user's current password. False when they have none. */
export async function checkPassword(
	tx: Pick<Tx, "account">,
	userId: string,
	password: string,
): Promise<boolean> {
	const credential = await tx.account.findFirst({
		where: { userId, providerId: CREDENTIAL_PROVIDER_ID },
		select: { password: true },
	});

	if (!credential?.password) return false;

	return verifyPassword({ hash: credential.password, password });
}

export async function hasPassword(
	tx: Pick<Tx, "account">,
	userId: string,
): Promise<boolean> {
	const credential = await tx.account.findFirst({
		where: { userId, providerId: CREDENTIAL_PROVIDER_ID },
		select: { password: true },
	});

	return Boolean(credential?.password);
}
