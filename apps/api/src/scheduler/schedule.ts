export type JobSchedule =
	| { readonly everyMinutes: number }
	| { readonly dailyAtUtcHour: number };

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export function latestSlot(schedule: JobSchedule, now: Date): Date {
	if ("everyMinutes" in schedule) {
		const size = schedule.everyMinutes * MINUTE_MS;

		return new Date(Math.floor(now.getTime() / size) * size);
	}

	const today = new Date(now);
	today.setUTCHours(schedule.dailyAtUtcHour, 0, 0, 0);

	return today.getTime() > now.getTime()
		? new Date(today.getTime() - DAY_MS)
		: today;
}

export function isDue(
	lastSuccessAt: Date | null,
	schedule: JobSchedule,
	now: Date,
): boolean {
	if (lastSuccessAt === null) return true;

	return lastSuccessAt.getTime() < latestSlot(schedule, now).getTime();
}
