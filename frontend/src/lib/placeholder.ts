/**
 * Deterministic warm-sage gradient from a seed string, used as a tasteful
 * stand-in wherever product/category photography will go. Same seed -> same
 * gradient, so the UI is stable. Still used by CategoryShowcase/SignatureScent
 * (no reference photos for those yet).
 */
export function placeholderGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = 70 + (h % 60); // olive → sage → soft green
  return `linear-gradient(155deg, hsl(${hue} 20% 88%), hsl(${hue} 22% 74%))`;
}

/**
 * Meantime reference photography, one set per category (not yet per-product —
 * real per-product photos will populate `product.imageUrl`/`gallery` later via
 * the admin dashboard, at which point these become a pure fallback). Reed
 * Diffusers has two reference shots; every other mapped category has one.
 * Categories with no reference photo yet (Humidifiers, Birch Vase) get the
 * neutral fallback.
 */
const CATEGORY_IMAGES: Record<string, string[]> = {
  "room-sprays": ["/products/room-spray.jpg"],
  "reed-diffusers": ["/products/reed-diffuser-1.jpg", "/products/reed-diffuser-2.jpg"],
  "fragrance-oils": ["/products/fragrance-oil.jpg"],
  "car-fragrance": ["/products/car-fragrance.jpg"],
};
const FALLBACK_IMAGE = "/products/category-fallback.jpg";

/** All reference images for a category, cycled to fill as many gallery panels as needed. */
export function getCategoryImages(categorySlug: string): string[] {
  return CATEGORY_IMAGES[categorySlug] ?? [FALLBACK_IMAGE];
}

/** The single representative image for a category (card/thumbnail use). */
export function getCategoryImage(categorySlug: string): string {
  return getCategoryImages(categorySlug)[0];
}

/**
 * Reed Diffusers' two reference photos are actually shot per size (100ml vs
 * 150ml), not interchangeable — once both sizes of the same product can
 * appear side by side (CategorySizeToggle's "All" tab), they need to show
 * the correct bottle for that size, not an arbitrary one.
 */
const VARIANT_IMAGES: Record<string, Record<string, string>> = {
  "reed-diffusers": {
    "100ml": "/products/reed-diffuser-1.jpg",
    "150ml": "/products/reed-diffuser-2.jpg",
  },
};

/** Size-aware image for a category; falls back to the category's single representative image. */
export function getVariantImage(categorySlug: string, sizeLabel: string): string {
  return VARIANT_IMAGES[categorySlug]?.[sizeLabel] ?? getCategoryImage(categorySlug);
}
