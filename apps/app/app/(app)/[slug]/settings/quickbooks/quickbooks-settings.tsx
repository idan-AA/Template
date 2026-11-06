"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@app/ui/components/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { Badge } from "@app/ui/components/badge";
import { Button } from "@app/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/ui/components/card";
import { Skeleton } from "@app/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LocalRelativeTime } from "@/components/local-date-time";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type Status = RouterOutputs["quickbooks"]["status"];

/** What the person is told when Intuit sends them back unfinished. Keys match the `reason` the API puts in the address. */
const FAILURE_TEXT: Record<string, string> = {
	denied:
		"You did not approve the connection in QuickBooks, so nothing was connected.",
	expired: "That sign-in took too long. Please try again.",
	invalid:
		"We could not confirm that request. Please start again from this page.",
	"different-company":
		"That is a different QuickBooks company from the one connected before. Disconnect first if you meant to switch.",
	"not-configured": "QuickBooks is not set up on this deploy yet.",
	failed: "QuickBooks did not finish connecting. Please try again.",
};

export function QuickbooksSettings() {
	const trpc = useTRPC();
	const status = useQuery(trpc.quickbooks.status.queryOptions());

	useReturnFromQuickbooks();

	if (status.isPending) {
		return (
			<div className="flex flex-col gap-3" aria-busy="true">
				<Skeleton className="h-40 w-full" />
			</div>
		);
	}

	if (status.isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>QuickBooks could not be loaded</AlertTitle>
				<AlertDescription>
					<span>{status.error.message}</span>
					<Button
						variant="outline"
						size="sm"
						className="mt-2 w-fit"
						onClick={() => status.refetch()}
					>
						Try again
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	return <Loaded status={status.data} />;
}

/**
 * Intuit sends the browser back to this page with `?status=connected` or
 * `?status=error&reason=...`. Say it once, then clear the address so a refresh does
 * not say it again.
 */
function useReturnFromQuickbooks() {
	const params = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const handled = useRef(false);

	const result = params.get("status");
	const reason = params.get("reason");

	useEffect(() => {
		if (handled.current || !result) return;
		handled.current = true;

		if (result === "connected") {
			toast.success("QuickBooks is connected.");
		} else {
			toast.error(
				FAILURE_TEXT[reason ?? ""] ??
					"QuickBooks did not finish connecting. Please try again.",
			);
		}

		void queryClient.invalidateQueries({
			queryKey: trpc.quickbooks.status.queryKey(),
		});
		router.replace(pathname);
	}, [result, reason, router, pathname, queryClient, trpc]);
}

function Loaded({ status }: { status: Status }) {
	const connection = status.connection;
	const connected = connection !== null && connection.status !== "DISCONNECTED";

	if (!status.configured) return <NotSetUp status={status} />;

	if (!connected) return <NotConnected status={status} />;

	return <Connected status={status} connection={connection} />;
}

function NotSetUp({ status }: { status: Status }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>QuickBooks is not set up yet</CardTitle>
				<CardDescription>
					This workspace needs its QuickBooks keys before anyone can connect.
					Ask your developer to add them.
				</CardDescription>
			</CardHeader>
			{status.canConnect && status.redirectUri ? (
				<CardContent className="flex flex-col gap-2 text-sm">
					<p className="text-muted-foreground">
						For your developer: register this address as a redirect URI in the
						Intuit app.
					</p>
					<code className="w-fit select-all break-all rounded bg-muted px-2 py-1 text-xs">
						{status.redirectUri}
					</code>
				</CardContent>
			) : null}
		</Card>
	);
}

function useStartConnect() {
	const trpc = useTRPC();

	return useMutation(
		trpc.quickbooks.connectStart.mutationOptions({
			onSuccess: ({ url }) => {
				// Intuit's own page: the person signs in there and picks the company.
				window.location.assign(url);
			},
			onError: (error) => toast.error(error.message),
		}),
	);
}

function NotConnected({ status }: { status: Status }) {
	const start = useStartConnect();

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Connect your QuickBooks</CardTitle>
					<CardDescription>
						Create invoices from won deals and see who owes you, right in the
						CRM. You sign in to QuickBooks and choose the company. We never
						change your books unless you click.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{status.canConnect ? (
						<div className="flex items-center gap-3">
							<Button
								disabled={start.isPending || start.isSuccess}
								onClick={() => start.mutate()}
							>
								{start.isPending || start.isSuccess
									? "Opening QuickBooks…"
									: "Connect to QuickBooks"}
							</Button>
							{status.environment === "sandbox" ? (
								<SandboxBadge />
							) : null}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">
							An owner or admin can connect QuickBooks.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function SandboxBadge() {
	return (
		<Badge variant="outline" title="Test data only. Nothing here touches a real company.">
			Sandbox
		</Badge>
	);
}

function Connected({
	status,
	connection,
}: {
	status: Status;
	connection: NonNullable<Status["connection"]>;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const start = useStartConnect();
	const [confirming, setConfirming] = useState(false);

	const needsReconnect = connection.status === "NEEDS_RECONNECT";

	const check = useMutation(
		trpc.quickbooks.check.mutationOptions({
			onSuccess: (data) => {
				queryClient.setQueryData(trpc.quickbooks.status.queryKey(), data);
				toast.success("QuickBooks is working.");
			},
			onError: (error) => {
				toast.error(error.message);
				void queryClient.invalidateQueries({
					queryKey: trpc.quickbooks.status.queryKey(),
				});
			},
		}),
	);

	const disconnect = useMutation(
		trpc.quickbooks.disconnect.mutationOptions({
			onSuccess: async (result) => {
				setConfirming(false);
				await queryClient.invalidateQueries({
					queryKey: trpc.quickbooks.status.queryKey(),
				});

				if (result.revokedAtIntuit) {
					toast.success("QuickBooks is disconnected.");
				} else {
					toast.warning(
						"Disconnected here. If it still shows in QuickBooks, remove it under Apps in QuickBooks.",
					);
				}
			},
			onError: (error) => {
				setConfirming(false);
				toast.error(error.message);
			},
		}),
	);

	return (
		<div className="flex flex-col gap-4">
			{needsReconnect ? (
				<Alert variant="destructive">
					<AlertTitle>QuickBooks is disconnected</AlertTitle>
					<AlertDescription>
						<span>
							Invoices and balances are paused until you reconnect. Nothing
							in QuickBooks was changed.
						</span>
						{status.canConnect ? (
							<Button
								size="sm"
								className="mt-2 w-fit"
								disabled={start.isPending || start.isSuccess}
								onClick={() => start.mutate()}
							>
								{start.isPending || start.isSuccess
									? "Opening QuickBooks…"
									: "Reconnect"}
							</Button>
						) : (
							<span>An owner or admin can reconnect it.</span>
						)}
					</AlertDescription>
				</Alert>
			) : null}

			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle>{connection.companyName ?? "QuickBooks company"}</CardTitle>
						<Badge variant={needsReconnect ? "outline" : "default"}>
							{needsReconnect ? "Disconnected" : "Connected"}
						</Badge>
						{status.environment === "sandbox" ? <SandboxBadge /> : null}
					</div>
					<CardDescription>
						{needsReconnect
							? "The last known details are shown below."
							: "Your books stay in QuickBooks. This connection reads from it and creates invoices only when you ask."}
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col gap-4">
					<dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
						{connection.homeCurrency ? (
							<>
								<dt className="text-muted-foreground">Currency</dt>
								<dd>{connection.homeCurrency}</dd>
							</>
						) : null}

						{connection.connectedAt ? (
							<>
								<dt className="text-muted-foreground">Connected</dt>
								<dd>
									<LocalRelativeTime date={connection.connectedAt} />
									{connection.connectedBy ? ` by ${connection.connectedBy}` : ""}
								</dd>
							</>
						) : null}

						{connection.lastCheckedAt ? (
							<>
								<dt className="text-muted-foreground">Last checked</dt>
								<dd>
									<LocalRelativeTime date={connection.lastCheckedAt} />
								</dd>
							</>
						) : null}

						<dt className="text-muted-foreground">Company ID</dt>
						<dd className="break-all">{connection.realmId}</dd>
					</dl>

					{connection.lastError && !needsReconnect ? (
						<p className="text-destructive text-sm">{connection.lastError}</p>
					) : null}

					{status.canConnect ? (
						<div className="flex flex-wrap gap-2">
							{!needsReconnect ? (
								<Button
									variant="outline"
									disabled={check.isPending}
									onClick={() => check.mutate()}
								>
									{check.isPending ? "Checking…" : "Check connection"}
								</Button>
							) : null}
							<Button
								variant="outline"
								disabled={disconnect.isPending}
								onClick={() => setConfirming(true)}
							>
								Disconnect
							</Button>
						</div>
					) : null}
				</CardContent>
			</Card>

			<AlertDialog
				open={confirming}
				onOpenChange={(open) => {
					if (!open && !disconnect.isPending) setConfirming(false);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Disconnect {connection.companyName ?? "QuickBooks"}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Invoices and balances stop showing here and nothing syncs.
							Nothing changes in QuickBooks. You can connect again any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={disconnect.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={disconnect.isPending}
							onClick={(event) => {
								// Stay open until the answer is back.
								event.preventDefault();
								disconnect.mutate();
							}}
						>
							{disconnect.isPending ? "Disconnecting…" : "Disconnect"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
