/** Browsers still ask for /favicon.ico by habit: send them to the client's own favicon. */
export function GET(request: Request) {
	return Response.redirect(new URL("/brand/favicon.svg", request.url), 307);
}
