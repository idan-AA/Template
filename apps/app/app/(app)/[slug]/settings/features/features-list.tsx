"use client";

import { ALL_MODULES, type ModuleId } from "@app/modules/registry";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { Badge } from "@app/ui/components/badge";
import { Button } from "@app/ui/components/button";
import { Skeleton } from "@app/ui/components/skeleton";
import { Switch } from "@app/ui/components/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LocalRelativeTime } from "@/components/local-date-time";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { ConfirmOffDialog } from "./confirm-off-dialog";

type Row = RouterOutputs["modules"]["list"]["modules"][number];

/** Must match PREVIEW_COOKIE in lib/modules.ts (that file is server-only). */
const PREVIEW_COOKIE = "preview-as-client";
const PREVIEW_DAYS = 1;

function readPreview(): boolean {
	return document.cookie
		.split("; ")
		.some((part) => part === `${PREVIEW_COOKIE}=1`);
}

function writePreview(on: boolean): void {
	document.cookie = on
		? `${PREVIEW_COOKIE}=1; path=/; max-age=${PREVIEW_DAYS * 86_400}; samesite=lax`
		: `${PREVIEW_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/** Why a switch cannot move right now, in a sentence, or null when it can. */
function blockedReason(row: Row, rows: readonly Row[]): string | null {
	const byId = new Map(rows.map((entry) => [entry.id, entry]));

	if (!row.enabled) {
		const clashing = row.conflicts.filter((id) => byId.get(id)?.enabled);

		if (clashing.length > 0) {
			const names = clashing.map((id) => byId.get(id)?.label ?? id).join(", ");
			return `Not available while ${names} is on. Switch ${names} off first.${row.conflictNote ? ` ${row.conflictNote}` : ""}`;
		}

		const missing = row.requires.filter((id) => !byId.get(id)?.enabled);

		if (missing.length === 0) return null;

		const names = missing.map((id) => byId.get(id)?.label ?? id).join(", ");
		return `Needs ${names}. Switch it on first.`;
	}

	const needsIt = rows.filter(
		(entry) => entry.enabled && entry.requires.includes(row.id),
	);

	if (needsIt.length === 0) return null;

	return `${needsIt.map((entry) => entry.label).join(", ")} needs ${row.label}. Switch it off first.`;
}

function statusLabel(row: Row): string {
	if (row.source === "switch") {
		return row.enabled ? "Switched on" : "Switched off";
	}

	return row.enabled ? "On (starting set)" : "Off (starting set)";
}

export function FeaturesList() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const [confirming, setConfirming] = useState<Row | null>(null);
	const [previewing, setPreviewing] = useState(false);

	useEffect(() => {
		setPreviewing(readPreview());
	}, []);

	const list = useQuery(trpc.modules.list.queryOptions());

	const set = useMutation(
		trpc.modules.set.mutationOptions({
			onSuccess: (data, variables) => {
				queryClient.setQueryData(trpc.modules.list.queryKey(), data);

				const label =
					data.modules.find((row) => row.id === variables.moduleId)?.label ??
					"The feature";
				toast.success(
					`${label} is ${variables.enabled ? "on" : "off"} for this workspace.`,
				);

				// The rail, settings sidebar and every module page are server
				// rendered from the answer the API just changed.
				router.refresh();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (list.isPending) {
		return (
			<div className="flex flex-col gap-3" aria-busy="true">
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-20 w-full" />
			</div>
		);
	}

	if (list.isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Features could not be loaded</AlertTitle>
				<AlertDescription>
					<span>{list.error.message}</span>
					<Button
						variant="outline"
						size="sm"
						className="mt-2 w-fit"
						onClick={() => list.refetch()}
					>
						Try again
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	const { modules, lockedByEnvironment } = list.data;

	return (
		<div className="flex max-w-3xl flex-col gap-4">
			{lockedByEnvironment ? (
				<Alert variant="warning">
					<AlertTitle>Features are fixed on this deploy</AlertTitle>
					<AlertDescription>
						ENABLED_MODULES is set in this deploy&apos;s environment, so these
						switches are read only. Remove it to switch features here.
					</AlertDescription>
				</Alert>
			) : null}

			{modules.length === 0 ? (
				<p className="text-muted-foreground text-sm">No features to switch.</p>
			) : (
				<ul className="flex flex-col divide-y rounded-md border">
					{modules.map((row) => {
						const blocked = blockedReason(row, modules);
						const disabled =
							lockedByEnvironment || set.isPending || blocked !== null;
						// A module with no rail item (an integration) opens its settings page.
						const definition =
							row.enabled && row.id in ALL_MODULES
								? ALL_MODULES[row.id as ModuleId]
								: undefined;
						const openPath =
							definition?.nav[0]?.href ?? definition?.settings[0]?.href;

						return (
							<li
								key={row.id}
								className="flex items-start justify-between gap-4 p-4"
							>
								<div className="flex min-w-0 flex-col gap-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-medium">{row.label}</span>
										<Badge variant={row.enabled ? "default" : "outline"}>
											{statusLabel(row)}
										</Badge>
									</div>

									{row.description ? (
										<p className="text-muted-foreground text-sm">
											{row.description}
										</p>
									) : null}

									{blocked ? (
										<p className="text-muted-foreground text-xs">{blocked}</p>
									) : null}

									{!row.enabled && row.dataHint ? (
										<p className="text-muted-foreground text-xs">
											Kept while off: {row.dataHint}.
										</p>
									) : null}

									{row.changedAt ? (
										<p className="text-muted-foreground text-xs">
											Last changed{" "}
											<LocalRelativeTime date={row.changedAt} />
											{row.changedBy ? ` by ${row.changedBy}` : ""}.
										</p>
									) : null}

									{openPath ? (
										<Button
											asChild
											variant="link"
											size="sm"
											className="h-auto w-fit p-0"
										>
											<Link href={url(openPath)}>Open {row.label}</Link>
										</Button>
									) : null}
								</div>

								<Switch
									checked={row.enabled}
									disabled={disabled}
									aria-label={`${row.label} is ${row.enabled ? "on" : "off"}`}
									onCheckedChange={(next) => {
										if (next) {
											set.mutate({ moduleId: row.id, enabled: true });
										} else {
											setConfirming(row);
										}
									}}
								/>
							</li>
						);
					})}
				</ul>
			)}

			<div className="flex items-start justify-between gap-4 rounded-md border p-4">
				<div className="flex flex-col gap-1">
					<span className="font-medium">Preview as a client</span>
					<p className="text-muted-foreground text-sm">
						You always see every feature. Turn this on to see exactly what the
						people in this workspace see. It only changes your own view.
					</p>
				</div>

				<Switch
					checked={previewing}
					aria-label="Preview as a client"
					onCheckedChange={(next) => {
						writePreview(next);
						setPreviewing(next);
						router.refresh();
					}}
				/>
			</div>

			<ConfirmOffDialog
				row={confirming}
				onCancel={() => setConfirming(null)}
				onConfirm={(row) => {
					setConfirming(null);
					set.mutate({ moduleId: row.id, enabled: false });
				}}
			/>
		</div>
	);
}
