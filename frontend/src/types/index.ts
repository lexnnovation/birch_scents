/**
 * Birchscents API contract types — the single source of truth shared by mock
 * data (Phases 2–5) and the live Laravel API (Phase 10+). Both must satisfy
 * these shapes so the data layer can swap from mocks to HTTP with no changes
 * to pages or components.
 *
 * Conventions (CLAUDE.md §4, §5, §8):
 *  - All money is integer minor units (pesewas): `*Pesewas: number`. Never floats.
 *  - JSON keys are camelCase. Timestamps are ISO 8601 UTC strings.
 */

/* ------------------------------- Catalog ------------------------------- */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
}

export type VariantLabel = "50ml" | "100ml" | "Standard";

export interface ProductVariant {
  id: string;
  label: VariantLabel;
  sku: string;
  /** Selling price in pesewas (integer). */
  pricePesewas: number;
  /** Optional "was" price in pesewas for discount display; null when not on sale. */
  compareAtPesewas: number | null;
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  scentNotes: string;
  imageUrl: string | null;
  gallery: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants: ProductVariant[];
}

/* -------------------------------- Cart --------------------------------- */

/** A line stored client-side in the cart (Zustand + localStorage). */
export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  imageUrl: string | null;
  unitPricePesewas: number;
  quantity: number;
}

/* -------------------------------- Orders ------------------------------- */

export type OrderStatus = "pending" | "paid" | "processing" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  productName: string;
  variantLabel: string;
  unitPricePesewas: number;
  quantity: number;
  lineTotalPesewas: number;
  imageUrl: string | null;
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  note?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalPesewas: number;
  deliveryFeePesewas: number;
  totalPesewas: number;
  delivery: DeliveryDetails;
  items: OrderItem[];
  createdAt: string;
}

/* --------------------------- API envelopes ----------------------------- */

/** List responses: `{ data, meta }` (Laravel paginator via API Resources). */
export interface Paginated<T> {
  data: T[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

/** Normalized error shape thrown by the data layer. */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
