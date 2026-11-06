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
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export type RemoveTarget = { id: string; name: string };

/**
 * Takes someone out of the workspace. They lose access at once and cannot sign
 * in again, but their account stays, so what they did keeps their name and an
 * owner or admin can add them back later.
 */
export function RemoveMemberDialog({
	member,
	onClose,
}: {
	member: RemoveTarget | null;
	onClose: () => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();

	const remove = useMutation(
		trpc.workspace.removeMember.mutationOptions({
			onSuccess: async (_result, input) => {
				await cache.workspace();
				toast.success(`${member?.name ?? "The member"} was removed.`);
				if (input.memberId === member?.id) onClose();
			},
			onError: (error) => {
				toast.error(error.message);
				onClose();
			},
		}),
	);

	return (
		<AlertDialog
			open={member !== null}
			onOpenChange={(open) => {
				if (!open && !remove.isPending) onClose();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove {member?.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						They are signed out everywhere and cannot sign in again. Their
						account and everything they did stay as they are, and you can add
						them back later.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={remove.isPending}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={remove.isPending}
						onClick={(event) => {
							// Stay open until the answer is back.
							event.preventDefault();
							if (member) remove.mutate({ memberId: member.id });
						}}
					>
						{remove.isPending ? "Removing…" : "Remove member"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
