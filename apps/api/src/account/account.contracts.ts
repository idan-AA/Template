import { PASSWORD_MAX_LENGTH } from "@app/auth/password-policy";
import { z } from "zod";

// Length rules are checked in the service, so the person gets a sentence they
// can act on instead of a schema message. These only keep the input sane.
export const passwordField = z.string().min(1).max(PASSWORD_MAX_LENGTH);

export const emailField = z.string().trim().min(3).max(254).email();

export const nameField = z.string().trim().min(1).max(120);

export const bootstrapStatusOutput = z.object({ needsOwner: z.boolean() });

export const createOwnerInput = z.object({
	name: nameField,
	email: emailField,
	password: passwordField,
});

export const createOwnerOutput = z.object({ ok: z.literal(true) });

export const accountStateOutput = z.object({
	passwordChangeRequired: z.boolean(),
	hasPassword: z.boolean(),
});

export const changePasswordInput = z.object({
	/** Left out only while a temporary password is being replaced (the forced change). */
	currentPassword: passwordField.optional(),
	newPassword: passwordField,
});

export const changePasswordOutput = z.object({ ok: z.literal(true) });
