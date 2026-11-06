"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import {
	AgentShellHintView,
	type AgentShellState,
	agentServiceFrom,
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

/**
 * Whether this deployment has a research agent: `true`, `false`, or `undefined`
 * while the answer loads. Hide agent UI only on an explicit `false`, so nothing
 * flashes away on a deployment that has one.
 */
export function useAgentService(): boolean | undefined {
	const trpc = useTRPC();
	const capabilities = useQuery({
		...trpc.agents.capabilities.queryOptions(),
		staleTime: Number.POSITIVE_INFINITY,
	});

	return agentServiceFrom(capabilities.data);
}

export function AgentShellHint({ className }: { className?: string }) {
	return <AgentShellHintView state={useAgentShell()} className={className} />;
}
