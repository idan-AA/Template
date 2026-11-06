import { ModuleGate } from "@/components/module-gate";
import { BooksNav } from "./_components/books-nav";

/** Part of the bookkeeping module: a deploy or person without it gets the 404 page here. */
export default function BooksLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ModuleGate id="bookkeeping">
			<div className="flex min-h-0 min-w-0 flex-1 flex-col">
				<BooksNav />
				{children}
			</div>
		</ModuleGate>
	);
}
