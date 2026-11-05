import { HttpException } from "@nestjs/common";

/**
 * A small in-memory cap on how often one key (an address, a user) may try
 * something sensitive. It is per process, which is right for a single-instance
 * deploy; better-auth's own database-backed limiter still covers its routes.
 */
export class AttemptLimiter {
	private readonly hits = new Map<string, number[]>();

	constructor(
		private readonly max: number,
		private readonly windowMs: number,
		private readonly message: string,
	) {}

	/** Counts this attempt, and throws a 429 once the key is over its allowance. */
	hit(key: string, now = Date.now()): void {
		const recent = (this.hits.get(key) ?? []).filter(
			(at) => now - at < this.windowMs,
		);

		if (recent.length >= this.max) {
			this.hits.set(key, recent);
			throw new HttpException(this.message, 429);
		}

		recent.push(now);
		this.hits.set(key, recent);

		if (this.hits.size > 10_000) this.sweep(now);
	}

	private sweep(now: number): void {
		for (const [key, times] of this.hits) {
			if (times.every((at) => now - at >= this.windowMs)) this.hits.delete(key);
		}
	}
}
