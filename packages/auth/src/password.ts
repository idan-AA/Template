import { hashPassword, verifyPassword } from "better-auth/crypto";

/** The `account.providerId` better-auth uses for a password sign-in. */
export const CREDENTIAL_PROVIDER_ID = "credential";

export { hashPassword, verifyPassword };
