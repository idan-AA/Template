/**
 * Length beats complexity: ten characters minimum, no rules about symbols or
 * digits. The same numbers are given to better-auth (`auth.ts`) so its own
 * endpoints agree with ours.
 */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

/** A sentence a person can act on, or null when the password is acceptable. */
export function passwordProblem(password: string): string | null {
	if (password.length < PASSWORD_MIN_LENGTH) {
		return `Use at least ${PASSWORD_MIN_LENGTH} characters. A few words in a row is easy to remember and hard to guess.`;
	}

	if (password.length > PASSWORD_MAX_LENGTH) {
		return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
	}

	return null;
}
