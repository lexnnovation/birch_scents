/** Public surface of the data layer. Import from `@/lib/api` everywhere. */
export * from "./categories";
export * from "./products";
export { apiFetch, setAccessTokenProvider } from "./client";
export type { RequestOptions } from "./client";
