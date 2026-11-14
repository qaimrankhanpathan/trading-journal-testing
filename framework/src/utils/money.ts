/**
 * The journal shows money like "$10,000.00", "−$100.00" (a real minus sign, U+2212) or "-$5.00".
 * Tests compare numbers, not text, so a small format change (no cents, another minus sign) does not break them.
 */
export function parseMoney(shown: string): number {
  const cleaned = shown
    .trim()
    .replace(/−/g, "-")
    .replace(/[^0-9.-]/g, "");
  const value = Number(cleaned);
  if (cleaned === "" || Number.isNaN(value)) throw new Error(`"${shown}" is not an amount of money`);
  return value;
}

/** A regular expression for an amount however its minus sign is written: moneyPattern(-100) matches "−$100.00". */
export function moneyPattern(amount: number): RegExp {
  const digits = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = amount < 0 ? "[−-]" : "";
  return new RegExp(`${sign}\\$${digits.replace(/\./g, "\\.")}`);
}
