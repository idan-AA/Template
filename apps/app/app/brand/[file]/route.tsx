import { ImageResponse } from "next/og";
import { getBrand } from "@/lib/brand";
import { readableOn } from "@/lib/brand-core";
import { readBrandFile } from "@/lib/brand-files";

const CACHE = "public, max-age=300, stale-while-revalidate=3600";

const ICON_SIZES = new Map([
	["icon-192.png", 192],
	["icon-512.png", 512],
	["apple-touch-icon.png", 180],
]);

/**
 * The active client's brand files, at fixed URLs so the sign-in page can use
 * them before anyone is signed in (the proxy skips paths that end in .svg or
 * .png). `logo.svg` and `favicon.svg` stream the file named in
 * clients/<id>/client.config.ts; the content type comes from the real file, so
 * a PNG logo works too. The PNG icons (home screen, app install) are drawn from
 * the brand colour and the first letter of the short name.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ file: string }> },
) {
	const { file } = await params;

	if (file === "logo.svg" || file === "favicon.svg") {
		const found = await readBrandFile(file === "logo.svg" ? "logo" : "favicon");

		if (!found) return new Response("Not found", { status: 404 });

		return new Response(new Uint8Array(found.body), {
			headers: { "Content-Type": found.contentType, "Cache-Control": CACHE },
		});
	}

	const size = ICON_SIZES.get(file);

	if (!size) return new Response("Not found", { status: 404 });

	const brand = getBrand();

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: brand.primaryColor,
				color: readableOn(brand.primaryColor),
				fontSize: Math.round(size * 0.56),
				fontWeight: 700,
			}}
		>
			{Array.from(brand.shortName)[0]?.toUpperCase()}
		</div>,
		{ width: size, height: size, headers: { "Cache-Control": CACHE } },
	);
}
