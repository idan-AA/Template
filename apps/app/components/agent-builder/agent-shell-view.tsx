import { Icon } from "@app/ui/components/icon";
import { cn } from "@app/ui/lib/utils";
import Information from "@carbon/icons-react/es/Information";

export const NOT_AVAILABLE_TITLE = "Not available on this deployment";

export type AgentShellState = {
	/** False on a host with no sandbox shell: the builder and team agents are off. */
	available: boolean;
	/** One plain sentence saying why, or null when available. */
	reason: string | null;
};

/**
 * Maps the API answer to what the UI needs. No answer yet counts as available, so
 * nothing flashes disabled; the API refuses the work either way.
 */
export function shellStateFrom(
	capabilities: { shell: boolean; reason: string | null } | undefined,
): AgentShellState {
	if (capabilities && !capabilities.shell) {
		return { available: false, reason: capabilities.reason };
	}

	return { available: true, reason: null };
}

/**
 * One visible line beside a disabled control. A `title` never shows on a
 * disabled button (the shared Button sets pointer-events-none) or on touch, so the
 * reason has to be text on the page.
 */
export function AgentShellHintView({
	state,
	className,
}: {
	state: AgentShellState;
	className?: string;
}) {
	if (state.available) return null;

	return (
		<p
			role="note"
			className={cn(
				"flex min-w-0 items-start gap-1.5 text-muted-foreground text-xs leading-5",
				className,
			)}
		>
			<Icon icon={Information} className="mt-0.5 size-3.5 shrink-0" />
			<span className="min-w-0 wrap-break-word">
				{NOT_AVAILABLE_TITLE}.{state.reason ? ` ${state.reason}` : ""}
			</span>
		</p>
	);
}

export function AgentShellNoticeView({
	state,
	className,
}: {
	state: AgentShellState;
	className?: string;
}) {
	if (state.available) return null;

	return (
		<div
			role="status"
			className={cn(
				"flex min-w-0 items-start gap-2.5 rounded-md border bg-muted px-3 py-2.5 text-sm",
				className,
			)}
		>
			<Icon icon={Information} className="mt-0.5 size-4 shrink-0" />
			<div className="min-w-0">
				<p className="font-medium">{NOT_AVAILABLE_TITLE}</p>
				{state.reason ? (
					<p className="wrap-break-word text-muted-foreground">
						{state.reason}
					</p>
				) : null}
			</div>
		</div>
	);
}
