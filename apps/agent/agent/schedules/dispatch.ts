import { defineSchedule } from "eve/schedules";
import crm from "../channels/crm";
import { sweepBlankFacts } from "../lib/blank-facts";
import {
	pendingAgentRunIds,
	pendingBuilderSubmissionIds,
	queueDueAgentRuns,
} from "../lib/custom-agent-dispatch";
import { brief, drainAll, taskAuth } from "../lib/dispatch";
import { shellFeaturesEnabled } from "../lib/shell";
import { reconcileStaleTasks } from "../lib/stale-tasks";
import { type TickCounts, tickLine } from "../lib/tick-log";

const shellState = () => (shellFeaturesEnabled() ? "on" : "off");

export default defineSchedule({
	cron: "* * * * *",
	async run({ to, waitUntil, appAuth }) {
		const startedAt = Date.now();
		const counts: TickCounts = {
			factsScanned: 0,
			factsFilled: 0,
			staleClosed: 0,
			staleRetired: 0,
			tasksStarted: 0,
			agentRunsQueued: 0,
			builderPending: 0,
			runsPending: 0,
		};

		const work = Promise.all([
			sweepBlankFacts().then((sweep) => {
				counts.factsScanned = sweep.scanned;
				counts.factsFilled = sweep.filled;
			}),

			(async () => {
				const stale = await reconcileStaleTasks();
				counts.staleClosed = stale.closed;
				counts.staleRetired = stale.retired;

				await drainAll((task) => {
					counts.tasksStarted += 1;
					return to(crm, { taskId: task.id }).send(brief(task), {
						auth: taskAuth(task, appAuth),
					});
				});
				counts.agentRunsQueued = await queueDueAgentRuns();
				const [builderIds, runIds] = await Promise.all([
					pendingBuilderSubmissionIds(),
					pendingAgentRunIds(),
				]);
				counts.builderPending = builderIds.length;
				counts.runsPending = runIds.length;

				await Promise.all([
					...builderIds.map((builderSubmissionId) =>
						to(crm, { builderSubmissionId }).send(
							"Continue a queued private agent-builder chat.",
							{
								auth: appAuth,
							},
						),
					),
					...runIds.map((runId) =>
						to(crm, { runId }).send("Execute a queued deployed agent run.", {
							auth: appAuth,
						}),
					),
				]);
			})(),
		]);

		// One line per tick, success or failure, so a deploy can see the schedule run.
		waitUntil(
			work.then(
				() =>
					console.log(
						tickLine(counts, Date.now() - startedAt, undefined, shellState()),
					),
				(error) => {
					console.log(
						tickLine(
							counts,
							Date.now() - startedAt,
							error instanceof Error ? error.message : String(error),
							shellState(),
						),
					);
					throw error;
				},
			),
		);
	},
});
