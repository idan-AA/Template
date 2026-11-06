const PLACEHOLDER_DOMAINS = new Set([
	"example.com",
	"example.net",
	"example.org",
	"example.invalid",
]);

/**
 * A support address worth showing a customer. The template ships
 * `support@example.com` until a client sets a real one; printing "Need help?
 * support@example.com" tells a real owner nobody is there. Empty, malformed or
 * placeholder addresses all count as "no address".
 */
export function usableSupportEmail(
	email: string | null | undefined,
): string | null {
	const trimmed = email?.trim();
	if (!trimmed) return null;

	const at = trimmed.lastIndexOf("@");
	if (at < 1) return null;

	const domain = trimmed.slice(at + 1).toLowerCase();
	if (!domain.includes(".") || PLACEHOLDER_DOMAINS.has(domain)) return null;

	return trimmed;
}
