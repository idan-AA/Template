// Prisma.Decimal is the decimal.js class the repo already ships, so the engine adds no dependency.
// `@app/db/prisma` is the generated client without the shared database connection, so the pure
// engine and its tests need no database.
import { Prisma } from "@app/db/prisma";

const DecimalJs = Prisma.Decimal;

export const Decimal = DecimalJs.clone({
	precision: 80,
	rounding: DecimalJs.ROUND_HALF_UP,
});

export type Decimal = InstanceType<typeof Decimal>;

export const ROUND_HALF_AWAY = DecimalJs.ROUND_HALF_UP;

export function shift(value: Decimal, places: number): Decimal {
	return value.times(new Decimal(10).pow(places));
}
