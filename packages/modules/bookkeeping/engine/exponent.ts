import { minorUnitsOf } from "@app/db/currency";

/** Minor-unit exponent of a currency code; tests inject one that knows an invented 3-decimal currency. */
export type ExponentResolver = (code: string) => number;

export const defaultExponent: ExponentResolver = minorUnitsOf;
