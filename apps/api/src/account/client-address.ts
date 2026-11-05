type RequestLike = {
	ip?: string;
	headers?: Record<string, string | string[] | undefined>;
};

/**
 * Who is calling, for rate limits. On Render the socket address is Render's own
 * proxy, so every person would share one bucket. Cloudflare overwrites
 * `cf-connecting-ip` on public web services, so a caller cannot forge it;
 * `req.ip` is the fallback (and honours Express `trust proxy`).
 */
export function clientAddress(req: RequestLike | undefined): string {
	const header = req?.headers?.["cf-connecting-ip"];
	const value = Array.isArray(header) ? header[0] : header;

	return value?.trim() || req?.ip || "unknown";
}
