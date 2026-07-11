/**
 * Money handling — the ONLY place pesewas become a display string.
 *
 * All monetary values move through the app as integer minor units (pesewas),
 * 100 pesewas = GH₵1 (CLAUDE.md §8). We never store or compute money as floats;
 * the single division below exists purely to format for display.
 *
 *   formatPesewas(24500) === "GH₵ 245.00"
 *   formatPesewas(0)     === "GH₵ 0.00"
 */

const CEDIS = new Intl.NumberFormat("en-GH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format integer pesewas as a Ghana Cedi string, e.g. `GH₵ 245.00`. */
export function formatPesewas(pesewas: number): string {
  if (!Number.isFinite(pesewas)) {
    throw new Error(`formatPesewas expected a finite number, got ${pesewas}`);
  }
  // Non-breaking space between symbol and amount keeps the price from wrapping.
  return `GH₵ ${CEDIS.format(pesewas / 100)}`;
}

/** Compute a whole-number discount percentage from compare-at and current price. */
export function discountPercent(
  pricePesewas: number,
  compareAtPesewas: number | null,
): number | null {
  if (compareAtPesewas === null || compareAtPesewas <= pricePesewas) {
    return null;
  }
  return Math.round(((compareAtPesewas - pricePesewas) / compareAtPesewas) * 100);
}
