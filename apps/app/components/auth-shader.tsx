// Gradients only. A grain layer built from an SVG turbulence filter used to sit
// here: the browser re-rasterises it on every repaint, which froze the tab on the
// sign-in and change-password pages (software rendering, any repaint).
export function AuthShader() {
	return (
		<>
			<div
				aria-hidden="true"
				className="absolute inset-0 size-full opacity-60 bg-[radial-gradient(circle_at_20%_20%,#2e2e2e,transparent_55%),radial-gradient(circle_at_80%_0%,#1a1a1a,transparent_50%),radial-gradient(circle_at_60%_90%,#ededed_0%,transparent_40%),linear-gradient(#000000,#000000)]"
			/>
			<div aria-hidden="true" className="absolute inset-0 bg-background/70" />
		</>
	);
}
