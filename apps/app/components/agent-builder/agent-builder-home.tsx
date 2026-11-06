"use client";

import { Icon } from "@app/ui/components/icon";
import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { adoptChatUrl } from "@/lib/chat-route";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { AgentComposer, type BuilderComposerPrompt } from "./agent-composer";
import { useAgentShell } from "./agent-shell";

const SUGGESTIONS = [
	"Brief every deal owner before a renewal call",
	"Flag deals with no activity for 14 days",
	"Hand new customers from Sales to Onboarding",
];

export function AgentBuilderHome({ name }: { name: string }) {
	const workspaceUrl = useWorkspaceUrl();
	const shell = useAgentShell();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [initialPrompt, setInitialPrompt] = useState("");
	const create = useMutation(
		trpc.conversations.createBuilder.mutationOptions({
			onSuccess: async ({ id }) => {
				await queryClient.invalidateQueries({
					queryKey: trpc.conversations.builderList.pathKey(),
				});
				adoptChatUrl(window.history, workspaceUrl(`/chat/${id}`));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const submit = async (
		prompt: BuilderComposerPrompt,
		clientRequestId: string,
	) => {
		await create.mutateAsync({
			...prompt,
			clientRequestId,
		});
	};

	// The banner above already says why. Here, a calm page instead of a greeting
	// and a composer that cannot send: nothing on it invites a click that fails.
	if (!shell.available) {
		return (
			<main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-16 text-center sm:px-6">
				<h1 className="text-balance font-medium text-2xl tracking-tight">
					Chat is not available here
				</h1>
				<p className="max-w-md text-balance text-muted-foreground text-sm">
					Your companies, contacts and deals work as usual. Chat and team agents
					need a service this workspace does not include.
				</p>
				<Link
					href={workspaceUrl()}
					className="text-primary text-sm underline-offset-4 hover:underline"
				>
					Back to the overview
				</Link>
			</main>
		);
	}

	return (
		<main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pt-14 pb-20 sm:px-6 sm:pt-12 sm:pb-28">
			<div className="flex w-full max-w-3xl flex-col items-center gap-3 pb-6 text-center">
				<h1 className="text-balance font-medium text-2xl tracking-tight sm:text-3xl">
					What can I help with, {firstName(name)}?
				</h1>
				<p className="max-w-xl text-balance text-muted-foreground text-sm">
					Ask about your CRM, tag a record or integration, or describe an agent
					to build to automate a task.
				</p>
			</div>

			<div className="w-full max-w-3xl">
				<AgentComposer
					key={initialPrompt}
					mode="home"
					initialPrompt={initialPrompt}
					onSubmit={submit}
				/>
				<p className="flex h-8 items-center px-px text-muted-foreground text-xs">
					Chats and agent drafts stay private to you. Deploying an agent makes
					it available to the whole team.
				</p>

				<div className="pt-1">
					<p className="flex h-7 items-center text-muted-foreground text-xs">
						Suggested agents
					</p>
					{SUGGESTIONS.map((suggestion) => (
						<button
							key={suggestion}
							type="button"
							onClick={() => setInitialPrompt(`/Create agent ${suggestion}`)}
							className="flex h-[42px] w-full items-center border-t text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
						>
							<span className="min-w-0 flex-1 font-medium text-sm">
								{suggestion}
							</span>
							<Icon
								icon={ArrowRight}
								className="size-4 text-muted-foreground"
							/>
						</button>
					))}
				</div>
			</div>
		</main>
	);
}

function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] || "there";
}
