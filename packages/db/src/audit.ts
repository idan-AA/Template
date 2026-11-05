import type { Prisma } from "./generated/prisma/client";

export type AuditActorType = "USER" | "AGENT" | "SYSTEM" | "API_KEY";

export type AuditEventInput = {
	/** "core", or the id of the module the change belongs to. */
	module: string;
	actorType: AuditActorType;
	actorId?: string | null;
	/** Name or email at the time, so the trail still reads after the person is gone. */
	actorLabel?: string | null;
	/** A verb in capitals, e.g. MEMBER_ROLE_CHANGED, ENTRY_POSTED. */
	action: string;
	entityType: string;
	entityId: string;
	summary: string;
	before?: Prisma.InputJsonValue | null;
	after?: Prisma.InputJsonValue | null;
	reason?: string | null;
	requestId?: string | null;
};

/**
 * Appends one row to the audit trail. Call it with the transaction client of
 * the change it describes, so the change and its record commit together or not
 * at all. The table refuses UPDATE, DELETE and TRUNCATE, so a row written here
 * is permanent.
 */
export async function writeAudit(
	tx: Pick<Prisma.TransactionClient, "auditEvent">,
	event: AuditEventInput,
): Promise<{ id: string }> {
	return tx.auditEvent.create({
		data: {
			module: event.module,
			actorType: event.actorType,
			actorId: event.actorId ?? null,
			actorLabel: event.actorLabel ?? null,
			action: event.action,
			entityType: event.entityType,
			entityId: event.entityId,
			summary: event.summary,
			before: event.before ?? undefined,
			after: event.after ?? undefined,
			reason: event.reason ?? null,
			requestId: event.requestId ?? null,
		},
		select: { id: true },
	});
}
