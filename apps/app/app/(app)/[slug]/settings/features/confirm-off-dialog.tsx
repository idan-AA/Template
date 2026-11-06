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

type Target = { id: string; label: string };

/** Switching a feature off takes it away from everyone but the developer at once, so it asks first. */
export function ConfirmOffDialog({
	row,
	onCancel,
	onConfirm,
}: {
	row: Target | null;
	onCancel: () => void;
	onConfirm: (row: Target) => void;
}) {
	return (
		<AlertDialog
			open={row !== null}
			onOpenChange={(open) => {
				if (!open) onCancel();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Switch off {row?.label}?</AlertDialogTitle>
					<AlertDialogDescription>
						People in this workspace lose access to {row?.label} right away.
						Nothing is deleted, and you can switch it back on at any time.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (row) onConfirm(row);
						}}
					>
						Switch off
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
