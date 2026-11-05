import type * as React from "react";

/**
 * The client's own logo, served from /brand/logo.svg (apps/app/app/brand), so
 * the same component shows a different mark per client. It is an <svg> that
 * holds the file as an image, so it takes the same props and sizing classes as
 * every other icon. Decorative unless the caller passes `alt`: the link or
 * heading around it already names the brand.
 */
const Logo = ({
	alt,
	...props
}: React.SVGProps<SVGSVGElement> & { alt?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 32 32"
		fill="none"
		role={alt ? "img" : undefined}
		aria-label={alt}
		aria-hidden={alt ? undefined : true}
		{...props}
	>
		<image href="/brand/logo.svg" width={32} height={32} />
	</svg>
);
export default Logo;
