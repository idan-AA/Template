import type { Db } from "@app/db";
import { EVENT_RETENTION_DAYS } from "@app/db/tracking";
import { Injectable, Logger } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { TrackingCounterService } from "./tracking-counter.service";
import { TrackingRollupService } from "./tracking-rollup.service";

const SWEEP_BATCH = 10_000;

const MAX_SWEEP_PASSES = 50;

@Injectable()
export class TrackingRetentionService {
	private readonly logger = new Logger(TrackingRetentionService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly rollups: TrackingRollupService,
		private readonly counters: TrackingCounterService,
	) {}

	async run() {
		const before = startOfDay(
			new Date(Date.now() - EVENT_RETENTION_DAYS * 24 * 60 * 60_000),
		);

		const rolled = await this.rollups.run(before);
		const { removed, complete } = await this.sweepEvents(before);
		const visitors = await this.sweepVisitors(before);
		const counters = await this.counters.sweep();

		if (!complete) {
			this.logger.warn({
				message:
					"Tracking retention hit its pass limit, events older than the window remain",
				removed,
				retentionDays: EVENT_RETENTION_DAYS,
			});
		}

		this.logger.log({
			message: "Tracking retention swept",
			rolled,
			removed,
			complete,
			visitors,
			counters,
			retentionDays: EVENT_RETENTION_DAYS,
		});

		return { rolled, removed, complete, visitors, counters };
	}

	private async sweepEvents(
		before: Date,
	): Promise<{ removed: number; complete: boolean }> {
		let removed = 0;

		for (let pass = 0; pass < MAX_SWEEP_PASSES; pass += 1) {
			const deleted = await this.db.$executeRaw`
				DELETE FROM "trackedEvent"
				WHERE "id" IN (
					SELECT "id" FROM "trackedEvent"
					WHERE "occurredAt" < ${before}
					LIMIT ${SWEEP_BATCH}
				);
			`;

			removed += deleted;
			if (deleted < SWEEP_BATCH) return { removed, complete: true };
		}

		return { removed, complete: false };
	}

	private async sweepVisitors(before: Date): Promise<number> {
		const orphaned = await this.db.$executeRaw`
			DELETE FROM "trackedVisitor"
			WHERE "contactId" IS NULL
				AND "lastSeen" < ${before}
				AND NOT EXISTS (
					SELECT 1 FROM "trackedEvent"
					WHERE "trackedEvent"."visitorId" = "trackedVisitor"."id"
				);
		`;

		return orphaned;
	}
}

function startOfDay(at: Date): Date {
	const day = new Date(at);
	day.setUTCHours(0, 0, 0, 0);

	return day;
}
