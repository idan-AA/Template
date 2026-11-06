"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

/**
 * What this person may do in the books. It only decides which buttons show: the API checks the
 * same keys again on every call (the UI hides, the server decides).
 */
export function useBooksAccess() {
	const trpc = useTRPC();
	const access = useQuery(trpc.bookkeeping.access.queryOptions());
	const granted = access.data?.granted ?? [];

	return {
		loaded: access.data !== undefined,
		can: (key: string) => granted.includes(key),
	};
}
