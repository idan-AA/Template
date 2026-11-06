"use client";

import { Badge } from "@app/ui/components/badge";
import { Button } from "@app/ui/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
} from "@app/ui/components/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@app/ui/components/dropdown-menu";
import { Icon } from "@app/ui/components/icon";
import { PersonAvatar } from "@app/ui/components/person-avatar";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalRelativeTime } from "@/components/local-date-time";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { membersSearchParams } from "./members-search-params";
import { RemoveMemberDialog, type RemoveTarget } from "./remove-member-dialog";
import { ResetPasswordDialog, type ResetTarget } from "./reset-password-dialog";

type RoleOption = { id: string; label: string };

/** What to show before the workspace has answered: the roles every deploy has. */
const CORE_ROLE_OPTIONS: RoleOption[] = [
	{ id: "owner", label: "Owner" },
	{ id: "admin", label: "Admin" },
	{ id: "member", label: "Member" },
];

/** A stored role this deploy no longer offers (its module is off) still reads as a word. */
function roleLabel(roles: RoleOption[], id: string): string {
	return (
		roles.find((role) => role.id === id)?.label ??
		id.charAt(0).toUpperCase() + id.slice(1)
	);
}

type MemberRow = RouterOutputs["workspace"]["members"]["rows"][number];

function columns(
	canChangeRoles: boolean,
	roles: RoleOption[],
	onChangeRole: (member: MemberRow, role: string) => void,
	onResetPassword: (member: MemberRow) => void,
	onRemove: (member: MemberRow) => void,
	pending: boolean,
): DataTableColumn<MemberRow>[] {
	return [
		{
			id: "name",
			header: "Name",
			sortable: true,
			hideable: false,
			width: "w-[34%]",
			cell: (row) => (
				<span className="flex min-w-0 items-center gap-2">
					<PersonAvatar
						size="sm"
						src={row.image}
						name={row.name}
						email={row.email}
					/>
					<span className="truncate font-medium">{row.name}</span>
					{row.isViewer ? (
						<span className="text-muted-foreground text-xs">You</span>
					) : null}
					{row.isDeveloper ? <Badge variant="outline">Developer</Badge> : null}
				</span>
			),
		},
		{
			id: "email",
			header: "Email",
			sortable: true,
			width: "w-[32%]",
			hideBelow: "md",
			cell: (row) => (
				<span className="truncate text-muted-foreground">{row.email}</span>
			),
		},
		{
			id: "role",
			header: "Role",
			sortable: true,
			width: "w-[14%]",
			cell: (row) => (
				<span className="text-muted-foreground">
					{roleLabel(roles, row.role)}
				</span>
			),
		},
		{
			id: "joinedAt",
			header: "Joined",
			label: "Joined date",
			sortable: true,
			align: "right",
			width: "w-[14%]",
			hideBelow: "sm",
			cell: (row) => (
				<span className="text-muted-foreground">
					<LocalRelativeTime date={row.joinedAt} />
				</span>
			),
		},
		{
			id: "actions",
			header: <span className="sr-only">Actions</span>,
			label: "Actions",
			hideable: false,
			align: "right",
			width: "w-[6%]",
			// The developer account is locked: its role and password are not changed from here.
			cell: (row) =>
				canChangeRoles && !row.isDeveloper ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" disabled={pending}>
								<Icon icon={OverflowMenuHorizontal} />
								<span className="sr-only">Actions for {row.name}</span>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							<DropdownMenuGroup>
								<DropdownMenuLabel>Role</DropdownMenuLabel>
								{roles.map((role) => (
									<DropdownMenuItem
										key={role.id}
										data-checked={row.role === role.id}
										onSelect={() => {
											if (row.role === role.id) return;
											onChangeRole(row, role.id);
										}}
									>
										{role.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuGroup>

							{row.isViewer ? null : (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={() => onResetPassword(row)}>
										Reset password
									</DropdownMenuItem>
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => onRemove(row)}
									>
										Remove member
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				) : null,
		},
	];
}

export function MembersTable() {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { query, input } = useTableQuery(membersSearchParams);
	const [resetting, setResetting] = useState<ResetTarget | null>(null);
	const [removing, setRemoving] = useState<RemoveTarget | null>(null);

	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const members = useQuery({
		...trpc.workspace.members.queryOptions(input),
		placeholderData: (previous) => previous,
	});

	const setRole = useMutation(
		trpc.workspace.setMemberRole.mutationOptions({
			onSuccess: async () => {
				await cache.workspace();
				toast.success("Role changed.");
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const facetCounts = members.data?.facetCounts;
	const roles = workspace.data?.roles ?? CORE_ROLE_OPTIONS;

	// Every role offered, plus any stored role this deploy no longer offers.
	const facetRoles: RoleOption[] = [
		...roles,
		...Object.keys(facetCounts?.role ?? {})
			.filter((id) => !roles.some((role) => role.id === id))
			.map((id) => ({ id, label: roleLabel(roles, id) })),
	];

	const facets: DataTableFacet[] = [
		{
			id: "role",
			label: "Role",
			options: facetRoles.flatMap((role) =>
				(facetCounts?.role?.[role.id] ?? 0) > 0
					? [{ value: role.id, label: role.label }]
					: [],
			),
		},
	];

	return (
		<>
			<DataTable
				query={query}
				search={<ListSearch placeholder="Search by name or email…" />}
				columns={columns(
					workspace.data?.canChangeRoles ?? false,
					roles,
					(member, role) => setRole.mutate({ memberId: member.id, role }),
					(member) => setResetting({ id: member.id, name: member.name }),
					(member) => setRemoving({ id: member.id, name: member.name }),
					setRole.isPending,
				)}
				rows={members.data?.rows ?? []}
				total={members.data?.total ?? 0}
				facetCounts={facetCounts}
				facets={facets}
				getRowId={(row) => row.id}
				loading={members.isFetching}
				empty="Nobody matches this view."
			/>

			<ResetPasswordDialog
				member={resetting}
				onClose={() => setResetting(null)}
			/>

			<RemoveMemberDialog
				member={removing}
				onClose={() => setRemoving(null)}
			/>
		</>
	);
}
