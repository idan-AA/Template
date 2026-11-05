import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import {
	AgentBuilderShell,
	AgentBuilderSidebarFallback,
} from "@/components/agent-builder/agent-builder-shell";
import { AgentBuilderSidebar } from "@/components/agent-builder/agent-builder-sidebar";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";

export default function AgentBuilderLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<AgentBuilderShell
			sidebar={
				<Suspense fallback={<AgentBuilderSidebarFallback />}>
					<PrefetchedAgentBuilderSidebar />
				</Suspense>
			}
		>
			<Suspense fallback={null}>
				<PrefetchedCapabilities />
			</Suspense>
			{children}
		</AgentBuilderShell>
	);
}

/**
 * Whether this deployment can run agents at all, fetched on the server so the first
 * paint already shows the "not available" notice. It awaits request data, so it sits
 * in its own Suspense boundary (awaiting in the layout body blocks prerendering).
 *
 * fetchQuery throws when the call fails, and a throw here would take down all of
 * /chat and /agents over a notice. Degrade instead: "unknown" counts as allowed
 * (shellStateFrom), the client asks again, and the API refuses the work anyway. The
 * repo has no error reporter yet (error-alert-system is a pattern only), so a failure
 * goes to the server log as one structured line.
 */
async function PrefetchedCapabilities() {
	try {
		await getServerQueryClient().fetchQuery(
			getServerTrpc().agents.capabilities.queryOptions(),
		);
	} catch (error) {
		// Next signals "this needs request data" by throwing; that must pass through.
		unstable_rethrow(error);
		console.error(
			JSON.stringify({
				event: "agent-builder.capabilities.failed",
				message: error instanceof Error ? error.message : "unknown error",
			}),
		);
	}

	return <HydrateClient>{null}</HydrateClient>;
}

async function PrefetchedAgentBuilderSidebar() {
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const conversationsQuery = trpc.conversations.builderList.queryOptions();
	const agentsQuery = trpc.agents.list.queryOptions();

	const [conversations, agents] = await Promise.all([
		queryClient.fetchQuery(conversationsQuery),
		queryClient.fetchQuery(agentsQuery),
	]);
	const updatedAt = Math.min(
		queryClient.getQueryState(conversationsQuery.queryKey)?.dataUpdatedAt ?? 0,
		queryClient.getQueryState(agentsQuery.queryKey)?.dataUpdatedAt ?? 0,
	);

	return (
		<HydrateClient>
			<AgentBuilderSidebar
				className="hidden w-[213px] flex-none border-r md:flex"
				initialData={{ conversations, agents, updatedAt }}
			/>
		</HydrateClient>
	);
}
