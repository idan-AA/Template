import { Client } from "pg";

const LOCK_NAMESPACE = 7_251_001;

type LockResult<T> =
	| { readonly acquired: true; readonly value: T }
	| { readonly acquired: false };

export type WithLock = <T>(
	key: number,
	run: () => Promise<T>,
) => Promise<LockResult<T>>;

export const withAdvisoryLock: WithLock = async (key, run) => {
	const client = new Client({ connectionString: process.env.DATABASE_URL });
	await client.connect();

	try {
		const { rows } = await client.query<{ locked: boolean }>(
			"SELECT pg_try_advisory_lock($1, $2) AS locked",
			[LOCK_NAMESPACE, key],
		);

		if (!rows[0]?.locked) return { acquired: false };

		try {
			return { acquired: true, value: await run() };
		} finally {
			await client.query("SELECT pg_advisory_unlock($1, $2)", [
				LOCK_NAMESPACE,
				key,
			]);
		}
	} finally {
		await client.end();
	}
};
