import type { Locale } from "./api/types";

/**
 * Money helpers — string-in, string-out. KWD is 3 decimal places.
 *
 * We do the only arithmetic the storefront needs (sum of line totals, price ×
 * quantity) on integer fils to avoid IEEE-754 drift, then format back to a
 * 3dp string. The POS remains the source of truth and recomputes everything at
 * order time; these totals are display-only.
 */

const SCALE = 1000; // fils per KWD

/** "1.250" -> 1250 (integer fils). Tolerant of undefined/empty. */
export function toFils(amount: string | undefined | null): number {
  if (!amount) return 0;
  const n = Math.round(parseFloat(amount) * SCALE);
  return Number.isFinite(n) ? n : 0;
}

/** 1250 -> "1.250" */
export function fromFils(fils: number): string {
  return (fils / SCALE).toFixed(3);
}

export function addPrices(...amounts: (string | undefined | null)[]): string {
  return fromFils(amounts.reduce<number>((acc, a) => acc + toFils(a), 0));
}

export function multiplyPrice(amount: string, qty: number): string {
  return fromFils(toFils(amount) * Math.max(0, Math.floor(qty)));
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Format a KWD string for display, localizing digits in Arabic. */
export function formatMoney(amount: string, locale: Locale): string {
  const value = (toFils(amount) / SCALE).toFixed(3);
  if (locale === "ar") {
    return value.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
  }
  return value;
}

export function localizeNumber(value: number | string, locale: Locale): string {
  const s = String(value);
  if (locale === "ar") return s.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
  return s;
}
