import type { Order, OrderStatus, Paginated, Product, ProductVariant, VariantLabel } from "@/types";
import { apiFetch } from "./client";

/**
 * Admin catalog + order writes. Unlike the public/customer modules, these
 * hit `/bo/*` (deliberately not `/admin/*` — a less guessable prefix) and
 * require an authenticated admin (Laravel `EnsureAdmin` middleware —
 * CLAUDE.md §6). A non-admin caller gets a 403 `ApiError`.
 */

/** Admin manages the whole catalog (including inactive items), so this reads more than one page's worth. */
export function getAdminProducts(): Promise<Product[]> {
  return apiFetch<Paginated<Product>>("/bo/products", { params: { perPage: 100 } }).then(
    (res) => res.data,
  );
}

export interface ProductInput {
  categorySlug: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  scentNotes: string;
  imageUrl?: string | null;
  gallery?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
}

export function createProduct(input: ProductInput): Promise<Product> {
  return apiFetch<{ data: Product }>("/bo/products", { method: "POST", body: input }).then(
    (res) => res.data,
  );
}

export function updateProduct(productId: string, input: Partial<ProductInput>): Promise<Product> {
  return apiFetch<{ data: Product }>(`/bo/products/${productId}`, {
    method: "PATCH",
    body: input,
  }).then((res) => res.data);
}

export function deleteProduct(productId: string): Promise<void> {
  return apiFetch<void>(`/bo/products/${productId}`, { method: "DELETE" });
}

export interface VariantInput {
  label: VariantLabel;
  sku: string;
  pricePesewas: number;
  compareAtPesewas?: number | null;
  stock: number;
  isActive?: boolean;
}

export function createVariant(productId: string, input: VariantInput): Promise<ProductVariant> {
  return apiFetch<{ data: ProductVariant }>(`/bo/products/${productId}/variants`, {
    method: "POST",
    body: input,
  }).then((res) => res.data);
}

export function updateVariant(
  variantId: string,
  input: Partial<VariantInput>,
): Promise<ProductVariant> {
  return apiFetch<{ data: ProductVariant }>(`/bo/variants/${variantId}`, {
    method: "PATCH",
    body: input,
  }).then((res) => res.data);
}

export function deleteVariant(variantId: string): Promise<void> {
  return apiFetch<void>(`/bo/variants/${variantId}`, { method: "DELETE" });
}

export function updateVariantStock(variantId: string, stock: number): Promise<ProductVariant> {
  return apiFetch<{ data: ProductVariant }>(`/bo/variants/${variantId}/stock`, {
    method: "PATCH",
    body: { stock },
  }).then((res) => res.data);
}

export interface GetAdminOrdersParams {
  page?: number;
  perPage?: number;
}

export function getAdminOrders(params: GetAdminOrdersParams = {}): Promise<Paginated<Order>> {
  const { page = 1, perPage = 20 } = params;
  return apiFetch<Paginated<Order>>("/bo/orders", { params: { page, perPage } });
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  return apiFetch<{ data: Order }>(`/bo/orders/${orderId}`, {
    method: "PATCH",
    body: { status },
  }).then((res) => res.data);
}
