import { connection } from "next/server";

// Render's health probe. Waiting for the connection opts the route out of build
// time prerendering, so it answers per request instead of serving one cached body.
export async function GET(): Promise<Response> {
	await connection();

	return Response.json({ status: "ok" });
}
