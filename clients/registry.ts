import type { ClientConfig } from "@app/modules/define-client";
import defaultClient from "./default/client.config";
import practiceClient from "./practice/client.config";

/**
 * Every client the template can boot as, keyed by its folder name. `CLIENT_ID`
 * picks one. A new client is a folder `clients/<id>/` with a `client.config.ts`
 * and brand files, plus one line here. A test fails if a folder is missing from
 * this list, or a line has no folder.
 */
/** Client folder name to its config. */
export type ClientRegistry = Readonly<Record<string, ClientConfig>>;

export const CLIENTS: ClientRegistry = {
	default: defaultClient,
	practice: practiceClient,
};
