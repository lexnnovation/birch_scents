/**
 * Deterministic warm-sage gradient from a seed string, used as a tasteful
 * stand-in wherever product/category photography will go (imageUrl is null
 * until Phase 11). Same seed -> same gradient, so the UI is stable.
 */
export function placeholderGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = 70 + (h % 60); // olive → sage → soft green
  return `linear-gradient(155deg, hsl(${hue} 20% 88%), hsl(${hue} 22% 74%))`;
}
