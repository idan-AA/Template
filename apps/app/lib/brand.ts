import "server-only";

import { activeClient } from "@app/modules";
import { type Brand, brandOf } from "@/lib/brand-core";

/** The active client's brand. Server components, metadata and route handlers only. */
export function getBrand(): Brand {
	return brandOf(activeClient().config);
}
