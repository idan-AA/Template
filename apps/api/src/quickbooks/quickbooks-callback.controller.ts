import { type auth } from "@app/auth/auth";
import { SESSION_COOKIE_NAME } from "@app/auth/cookies";
import { isModuleEnabled } from "@app/modules";
import { ensureModuleState } from "@app/modules/state";
import { Controller, ForbiddenException, Get, NotFoundException, Query, Res } from "@nestjs/common";
import { ApiCookieAuth, ApiExcludeEndpoint, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { Response } from "express";
import {
	type CallbackFailure,
	QuickbooksCallbackError,
	QuickbooksConnectionService,
} from "./connection.service";

type CrmSession = UserSession<typeof auth>;

/**
 * Where Intuit sends the browser after the person approves (or refuses) on its
 * consent page. This is a browser redirect, not a fetch, so CORS is not involved.
 * The person's session cookie comes along, and the single-use state must belong to
 * that same person. The answer is another redirect, to the settings page with a
 * status in the query. No token, code or company id ever goes in that address.
 */
@ApiTags("QuickBooks")
@ApiCookieAuth(SESSION_COOKIE_NAME)
@Controller("api/quickbooks")
export class QuickbooksCallbackController {
	constructor(private readonly connection: QuickbooksConnectionService) {}

	@Get("callback")
	@ApiExcludeEndpoint()
	async callback(
		@Session() session: CrmSession,
		@Query("state") state: string | undefined,
		@Query("code") code: string | undefined,
		@Query("realmId") realmId: string | undefined,
		@Query("error") providerError: string | undefined,
		@Res() response: Response,
	) {
		// A switched-off module answers as if it did not exist.
		await ensureModuleState();
		if (!isModuleEnabled("quickbooks")) throw new NotFoundException();

		const finish = async (failure?: CallbackFailure) =>
			response.redirect(
				303,
				await this.connection.settingsRedirect(
					failure ? "error" : "connected",
					failure,
				),
			);

		if (providerError) return finish("denied");
		if (!state || !code || !realmId) return finish("invalid");

		try {
			await this.connection.completeConnect({
				userId: session.user.id,
				state,
				code,
				realmId,
			});
		} catch (error) {
			if (error instanceof QuickbooksCallbackError) return finish(error.reason);
			if (error instanceof ForbiddenException) return finish("invalid");
			throw error;
		}

		return finish();
	}
}
