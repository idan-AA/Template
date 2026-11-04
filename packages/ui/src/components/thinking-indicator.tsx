import { DotMatrix } from "@app/ui/components/dot-matrix";
import { Shimmer } from "@app/ui/components/shimmer";
import { cn } from "@app/ui/lib/utils";

export function ThinkingIndicator({
	label = "Thinking",
	className,
}: {
	label?: string;
	className?: string;
}) {
	return (
		<div className={cn("flex min-w-0 items-center gap-2 text-sm", className)}>
			<DotMatrix decorative />
			<Shimmer className="text-muted-foreground">{label}</Shimmer>
		</div>
	);
}
