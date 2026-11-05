"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import {
	AgentShellHintView,
	AgentShellNoticeView,
	type AgentShellState,
	shellStateFrom,
} from "./agent-shell-view";

export { NOT_AVAILABLE_TITLE } from "./agent-shell-view";

/** Whether the agent builder and team agents work on this deployment. */
export function useAgentShell(): AgentShellState {
	const trpc = useTRPC();
	const capabilities = useQuery({
		...trpc.agents.capabilities.queryOptions(),
		staleTime: Number.POSITIVE_INFINITY,
	});

	return shellStateFrom(capabilities.data);
}

export function AgentShellNotice({ className }: { className?: string }) {
	return <AgentShellNoticeView state={useAgentShell()} className={className} />;
}

export function AgentShellHint({ className }: { className?: string }) {
	return <AgentShellHintView state={useAgentShell()} className={className} />;
}
