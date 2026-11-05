import type { NavIconKey } from "@app/modules/define-module";
import type { CarbonIcon } from "@app/ui/components/icon";
import Book from "@carbon/icons-react/es/Book";
import Building from "@carbon/icons-react/es/Building";
import Partnership from "@carbon/icons-react/es/Partnership";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";

/** Every icon a module may ask for. A new key in `NAV_ICON_KEYS` fails to compile until it is added here. */
export const NAV_ICONS: Record<NavIconKey, CarbonIcon> = {
	company: Building,
	contact: UserMultiple,
	deal: Partnership,
	ledger: Book,
};
