import { Client } from "pg";

const LOCK_NAMESPACE = 7_251_001;

const CONNECT_TIMEOUT_MS = 10_000;

type LockResult<T> =
	| { readonly acquired: true; readonly value: T }
	| { readonly acquired: false };

export type WithLock = <T>(
	key: number,
	run: () => Promise<T>,
) => Promise<LockResult<T>>;

export const withAdvisoryLock: WithLock = async (key, run) => {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
	});

	// A pg Client with no "error" listener turns a dropped connection into an
	// uncaught exception that takes the whole API process down. The failure still
	// surfaces: the next query on this client rejects and the tick logs it.
	client.on("error", () => {});

	try {
		await client.connect();
	} catch (error) {
		await client.end().catch(() => {});
		throw error;
	}

	try {
		const { rows } = await client.query<{ locked: boolean }>(
			"SELECT pg_try_advisory_lock($1, $2) AS locked",
			[LOCK_NAMESPACE, key],
		);

		if (!rows[0]?.locked) return { acquired: false };

		try {
			return { acquired: true, value: await run() };
		} finally {
			// Best effort: closing the connection below releases the lock anyway, and
			// a failed unlock must not hide the job's own result or error.
			await client
				.query("SELECT pg_advisory_unlock($1, $2)", [LOCK_NAMESPACE, key])
				.catch(() => {});
		}
	} finally {
		await client.end().catch(() => {});
	}
};
