import type { ActivityType } from "@app/db/enums";
import { Icon } from "@app/ui/components/icon";
import { activityIcon } from "@/lib/activity-presentation";

export function ActivityIcon({ type }: { type: ActivityType }) {
	return <Icon icon={activityIcon(type)} />;
}
