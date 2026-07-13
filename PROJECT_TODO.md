# PROJECT_TODO.md — Birchscents Implementation Roadmap

Frontend-first. Phases 2–5 build the entire storefront against mock data behind the typed
data layer (`lib/api/`); the backend only begins once the UI is finished. Every task is
small enough to complete in one focused session. Work strictly in order within a phase;
check off tasks as they land. Conventions live in `CLAUDE.md` — read it before each phase.

**Brand tagline:** "Inhale and Feel the Difference."

---

## Phase 1 — Project Setup

- [x] 1.1 Initialize git repo with root `.gitignore` (node, PHP, `.env*`, `.next`, `vendor`).
- [x] 1.2 Scaffold `/frontend`: latest Next.js (App Router, TypeScript, Tailwind, ESLint, `src/` dir, import alias `@/`).
- [x] 1.3 Enable TypeScript `strict` mode; add Prettier + a `format` script; verify `next build` passes clean.
- [x] 1.4 Initialize shadcn/ui in `/frontend` (CSS variables mode); install Framer Motion and Zustand.
- [x] 1.5 Create the folder skeleton from CLAUDE.md §2 (`components/{ui,layout,product,cart,checkout,marketing,admin}`, `lib/api`, `lib/supabase`, `mocks`, `stores`, `types`) with placeholder index files.
- [x] 1.6 Create `frontend/.env.example` with the four `NEXT_PUBLIC_*` keys (values blank).
- [ ] 1.7 Create a Supabase project (free tier); note the URL, anon key, JWT secret, and DB connection string somewhere safe (not in git).
- [x] 1.8 Commit: "Phase 1 — project setup".

*(Backend scaffolding is deliberately deferred to Phase 6.)*

## Phase 2 — Design System & Mock Data

- [x] 2.1 Define design tokens in `globals.css` + Tailwind config: warm ivory/cream background, deep charcoal text, one muted gold/amber accent, semantic tokens (background, foreground, muted, accent, border) for the shadcn variables.
- [x] 2.2 Set up typography with `next/font`: a serif display face for headlines, a refined sans for body/UI; define the type scale (display, h1–h4, body, small, overline/eyebrow).
- [x] 2.3 Add and fully restyle core shadcn primitives: Button (solid/outline/ghost), Input, Label, Select, Sheet (cart drawer), Dialog, Badge, Skeleton, Separator, Sonner/Toast. None may look like default shadcn.
- [ ] 2.4 Build a throwaway `/dev/styleguide` page rendering all tokens, type scale, and primitives for visual QA (delete before launch).
- [x] 2.5 Define the API contract types in `src/types/`: `Category`, `Product`, `ProductVariant`, `CartItem`, `Order`, `OrderItem`, `Paginated<T>`, `ApiError` — all money fields as `*Pesewas: number` (integers).
- [x] 2.6 Write `lib/money.ts` with `formatPesewas()` (`Intl.NumberFormat en-GH / GHS`) + unit-style sanity checks.
- [x] 2.7 Create mock data in `src/mocks/`: 4 categories (Reed Diffusers, Room Sprays, Fragrance Oils, Humidifiers), ~12 products with sensory luxury copy (Snow Melon flagged `isFeatured`), 50ml/100ml variants where applicable, realistic pesewa prices, placeholder imagery (elegant neutral-toned placeholders or licensed stock).
- [x] 2.8 Build the mock-backed data layer: `lib/api/products.ts`, `categories.ts` etc. returning typed promises from mocks with a ~300 ms delay. Add `client.ts` as a stub for now.
- [x] 2.9 Create shared motion presets (`lib/motion.ts`): fade-up-on-scroll, stagger container, hover-lift — all with `prefers-reduced-motion` fallbacks.
- [x] 2.10 Commit: "Phase 2 — design system, types, mock data layer".

## Phase 3 — Homepage

- [x] 3.1 Build `Header`: logo, nav (Shop, category links), cart icon with count badge, account icon; transparent-over-hero → solid-on-scroll behavior.
- [x] 3.2 Build `MobileNav`: full-screen or sheet menu, large elegant links, staggered entrance animation; fully keyboard/focus-trap accessible.
- [x] 3.3 Build `Footer`: brand statement, category links, contact (Accra, Ghana), quiet trust line; plus a slim `AnnouncementBar` ("Nationwide delivery across Ghana").
- [x] 3.4 Build the `Hero`: full-bleed premium visual, serif headline, sensory sub-line, single CTA to Shop; subtle entrance animation. Feature the brand tagline "Inhale and Feel the Difference" (as headline or eyebrow).
- [x] 3.5 Build `TrustBar`: FDA Approved · Long-lasting Fragrance · Nationwide Delivery · Premium Support — one quiet horizontal strip with fine icons.
- [x] 3.6 Build `CategoryShowcase`: four large image cards linking to category-filtered shop pages, hover zoom/lift.
- [x] 3.7 Build `SignatureScent` section for Snow Melon: asymmetric editorial layout, the flagship description copy, CTA to its product page.
- [x] 3.8 Build `FeaturedProducts` row reusing `ProductCard` (built in 4.1 — stub it now if needed) fed by `getFeaturedProducts()`.
- [x] 3.9 Build a `ForBusiness` teaser section (hotels, spas, offices — corporate gifting) with a contact CTA (mailto/phone for MVP).
- [x] 3.10 Assemble the landing page from these sections; scroll-triggered reveals; QA at 375/768/1440 px; run Lighthouse and fix anything under target.
- [x] 3.11 Commit: "Phase 3 — homepage".

## Phase 4 — Shop & Product Pages

- [x] 4.1 Build `ProductCard`: large image, name, category eyebrow, from-price (`formatPesewas`), hover lift + secondary image or subtle zoom, whole card clickable with proper link semantics.
- [x] 4.2 Build the Shop page `/shop`: responsive grid (2-col mobile → 4-col desktop), page intro header, `Skeleton` loading state.
- [x] 4.3 Add category filtering: elegant pill/tab bar + `/shop/[category]` routes with correct metadata per category; empty-state design.
- [x] 4.4 Build the PDP `/products/[slug]` layout: gallery left / details right on desktop, stacked on mobile.
- [x] 4.5 Build `ProductGallery`: main image + thumbnails, crossfade transitions, `next/image` throughout.
- [x] 4.6 Build `VariantSelector` (50ml/100ml): accessible radio-group styled as premium size chips; price updates with selection; out-of-stock variants disabled with a tasteful note.
- [x] 4.7 Build PDP details: name, tagline, sensory description, scent notes, quantity stepper, prominent Add-to-Cart button; sticky add-to-cart bar on mobile.
- [x] 4.8 Add a "Complete the atmosphere" related-products row (same category, from mocks).
- [x] 4.9 Add `generateMetadata` for shop + PDP (title, description, OG image) and a `not-found` state for bad slugs.
- [x] 4.10 Responsive + accessibility QA pass on shop and PDP; commit: "Phase 4 — shop & product pages".

## Phase 5 — Cart & Checkout UI

- [x] 5.1 Build the cart store (`stores/cart.ts`): Zustand + `persist` (localStorage); items keyed by `variantId`; add/update-qty/remove/clear; derived `subtotalPesewas` and count. Integers only.
- [x] 5.2 Wire Add-to-Cart on the PDP: adds item, opens the cart drawer, toast confirmation.
- [x] 5.3 Build `CartDrawer` (customized Sheet): line items with thumbnails, variant label, qty steppers, remove; subtotal; "Checkout" and "Continue shopping" CTAs; empty-cart state with a warm invitation back to Shop.
- [x] 5.4 Build the full `/cart` page (same store, roomier layout) for direct visits.
- [x] 5.5 Build the checkout page `/checkout`: order summary (line items + subtotal + flat delivery fee + total) alongside a delivery details form (name, phone, address, city, note) with inline validation.
- [x] 5.6 Add the auth gate UX: unauthenticated users hitting checkout are routed to login with a `redirectTo` back to checkout.
- [x] 5.7 Build login/register pages in the `(auth)` layout: email+password forms and a "Continue with Google" button — pure UI for now (fake success), styled to the brand.
- [x] 5.8 Build the order-confirmation page (`/orders/confirmation/[orderNumber]`): thank-you moment, order number, summary, delivery details — fed by mock order data.
- [x] 5.9 Build `/orders` (customer order history): list with status badges, and an order detail view — mock data.
- [x] 5.10 Build the admin UI shell (`/admin`): sidebar layout + three screens against mocks — products table with create/edit form (name, category, copy, variants, prices in pesewas), inventory view (stock per variant, inline adjust), orders table with status detail/update.
- [x] 5.11 Full storefront walkthrough QA: landing → shop → PDP → cart → checkout → confirmation on mobile + desktop; fix rough edges; delete-or-polish pass on animations.
- [x] 5.12 Commit: "Phase 5 — cart, checkout, auth & admin UI (mock-backed)". **UI freeze: backend work may begin.**

## Phase 6 — Database & Laravel Models

- [x] 6.1 Scaffold `/backend`: latest Laravel, API-only (no Blade views/auth scaffolding); set JSON as default; add Pest. Link the project in **Laravel Herd** so it serves at a `.test` domain — local backend dev uses Herd, not Docker (CLAUDE.md §12).
- [x] 6.2 Configure `pgsql` connection to Supabase Postgres via env; create `backend/.env.example` per CLAUDE.md §11; verify `herd php artisan migrate` connects.
- [x] 6.3 Write migrations for `users` (with `supabase_id` uuid unique, `is_admin`), `categories`, `products`, `product_variants` — per the schema in CLAUDE.md §7.
- [x] 6.4 Write migrations for `orders`, `order_items`, `payments` (unique `reference`, `raw_payload` jsonb) with FK constraints and indexes (`slug`, `order_number`, `reference`).
- [x] 6.5 Create models with `$fillable`, relationships, and casts; add `OrderStatus` / `PaymentStatus` PHP enums.
- [x] 6.6 Write seeders mirroring the frontend mock data exactly (same categories, products, variants, pesewa prices) so the API swap is visually invisible.
- [x] 6.7 Add `GET /api/v1/health` (JSON + DB ping); confirm it responds at the Herd `.test` URL. Run migrations + seeds against Supabase (via `herd php artisan`); verify rows in a psql session.
- [x] 6.8 Commit: "Phase 6 — Laravel scaffold, schema, seeds".

## Phase 7 — Authentication

- [x] 7.1 Supabase dashboard: Email+Password enabled (confirmed via live sign-up). **Google OAuth deferred** — no code changes needed later, dashboard toggle only (CLAUDE.md §1).
- [x] 7.2 Frontend: create Supabase browser/server clients in `lib/supabase/`; implement session handling (`proxy.ts` token refresh — Next.js 16 renamed `middleware.ts` → `proxy.ts`).
- [x] 7.3 Wire the real login/register forms: sign-up, sign-in, sign-out, error states, `redirectTo` handling back to checkout. Google OAuth button deferred with the rest of 7.1.
- [x] 7.4 Add a `useUser` session hook and header account state (Sign in ↔ account menu with Orders + Sign out).
- [x] 7.5 Backend: implement `VerifySupabaseJwt` middleware — verify signature via Supabase's JWKS (ES256, this project's actual signing method — not the legacy HS256 shared secret; CLAUDE.md §6 updated), check `exp` + `aud`, alg allowlist per key; find-or-create local `users` row from `sub`/`email`; bind to request.
- [x] 7.6 Implement `EnsureAdmin` middleware (403 unless `is_admin`); registered as route-middleware aliases (`auth.supabase`, `admin`) in `bootstrap/app.php` — applied to real route groups in Phase 8.
- [x] 7.7 Pest tests: valid token passes, expired/tampered/missing/unknown-kid/wrong-alg token → 401, non-admin on admin route → 403, first-request user auto-provisioning, admin not de-escalated on repeat sign-in.
- [x] 7.8 Commit: "Phase 7 — Supabase auth end-to-end".

## Phase 8 — REST API

- [x] 8.1 Configure CORS for `FRONTEND_URL`; set up `/api/v1` route group and the success/error envelope conventions.
- [x] 8.2 Public catalog endpoints: `GET /categories`, `GET /products` (category filter, featured flag, pagination), `GET /products/{slug}` — with API Resources emitting camelCase exactly matching `frontend/src/types`.
- [x] 8.3 Customer order endpoints: `GET /orders` (own orders only), `GET /orders/{orderNumber}` (own-order authorization).
- [x] 8.4 `CheckoutService` + `POST /checkout`: FormRequest validation; re-validate items against DB (active, in stock, server prices); compute totals (flat GH₵20 delivery fee via `config('checkout.delivery_fee_pesewas')`); create order + items + pending payment in a transaction; return order payload (Paystack call added in Phase 9). Stock is checked but intentionally **not** decremented here — only the Phase 9 webhook decrements, per CLAUDE.md §9.
- [x] 8.5 Admin product endpoints: CRUD for products + variants (`/admin/products`…), including activate/deactivate; FormRequests for all writes.
- [x] 8.6 Admin inventory endpoint: `PATCH /admin/variants/{id}/stock`; admin orders: `GET /admin/orders` (filter by status), `PATCH /admin/orders/{orderNumber}` (status transitions validated against the enum via `OrderStatus::canTransitionTo()`).
- [x] 8.7 Pest feature tests: catalog shapes, own-order isolation, checkout rejects price tampering and overselling (409), admin CRUD happy paths + 403 for non-admins. 43 tests passing.
- [x] 8.8 Commit: "Phase 8 — REST API complete".

## Phase 9 — Paystack Integration

- [x] 9.1 Create Paystack account; get test keys; add `PAYSTACK_*` to backend env + `config/services.php`. (Test keys are from an existing personal Paystack account, reused for this project's test mode.)
- [x] 9.2 `PaystackService`: `initializeTransaction()` (amount in pesewas, GHS, email, generated unique reference, callback URL) and `verifyTransaction()` via Paystack API — typed responses, timeouts, logged failures. Network/connection failures are also normalized to `PaystackException` so callers only ever handle one exception type.
- [x] 9.3 Extend `POST /checkout` to initialize the transaction and return `{ authorizationUrl, reference, orderNumber }`; store the reference on the `payments` row. Paystack init happens inside the same DB transaction as order creation — a failed init rolls back the whole checkout (502).
- [x] 9.4 Webhook `POST /webhooks/paystack`: raw-body HMAC SHA512 check with `hash_equals` (401 on mismatch); excluded from auth middleware; rate-limited (`throttle:60,1`).
- [x] 9.5 On `charge.success`: re-verify via API, match amount+currency against our payment row, then in one transaction mark payment `success` + order `paid` + decrement variant stock; idempotent on replay (row-locked re-check inside the transaction); store `raw_payload`; 200 for all validly-signed events.
- [x] 9.6 Pest tests: bad signature → 401, success flow updates payment/order/stock, replayed webhook is a no-op (no double stock decrement), amount mismatch does not fulfill, `PaystackService` failure/timeout handling. 14 new tests, 57 total passing.
- [ ] 9.7 End-to-end test with Paystack test cards against the local Herd backend (tunnel the `.test` domain so Paystack can reach the webhook); configure the test webhook URL in the Paystack dashboard. **Deferred to the user** — requires real browser card entry; verified instead via CLI: real `PaystackService` calls against the live Paystack test API (init + verify, both succeeded), and a hand-signed webhook POST against the live Herd server + real Supabase DB (correctly refused to fulfill an unrecognized reference, proving re-verification isn't bypassable even with a valid signature). Tunnel + dashboard webhook URL registration still needed before a real card test.
- [x] 9.8 Commit: "Phase 9 — Paystack payments".

## Phase 10 — Connect Frontend to Backend

- [x] 10.1 Implement the real `lib/api/client.ts`: typed fetch wrapper on `NEXT_PUBLIC_API_URL`, attaches the Supabase access token, normalizes the error envelope into `ApiError`. Token is sourced via a client-mounted `AuthTokenProvider` reading the real Supabase session; public catalog reads work unauthenticated from Server Components.
- [x] 10.2 Swap `products.ts`/`categories.ts` internals from mocks to the client (signatures unchanged); verified landing, shop, and PDP render identically from live data (6 categories, 17 products — full parity with the mocks). Mock files not yet deleted — `admin.ts` still reads them until 10.5.
- [x] 10.3 Wire checkout: submit cart + delivery form to `POST /checkout`, redirect to `authorizationUrl`; built `/checkout/callback` that polls order status and forwards to the confirmation page; handles the still-pending/timeout case gracefully. **Decision:** dropped the mock's "free delivery over GH₵300" rule — flat GH₵20 always, matching the real backend exactly (no client/server mismatch).
- [x] 10.3b (added) Remember delivery details: last-used name/phone/address/city persist to `localStorage` (`stores/delivery.ts`) and pre-fill the checkout form next time — still fully editable, note stays blank per order.
- [x] 10.4 Wire order confirmation + order history to the live endpoints (own-account-scoped); clear the cart only after `/checkout/callback` confirms the order is no longer `pending`. Both pages gained an auth gate they didn't need before (mock store required no login).
- [ ] 10.5 Wire the admin screens (products CRUD, inventory adjust, order status) to the admin endpoints; verify 403 behavior for non-admin accounts; set your own user `is_admin = true` via SQL.
- [ ] 10.6 Full happy-path E2E on test keys: register → shop → cart → checkout → Paystack test card → webhook → confirmation → order in history → order visible/updatable in admin. **Blocked on the webhook tunnel** — see note below.
- [ ] 10.7 Error-path pass: expired session mid-checkout, out-of-stock race (409), API down (friendly error states, no blank screens).
- [ ] 10.8 Remove the `/dev/styleguide` page and any leftover mock imports. Commit: "Phase 10 — live API integration".

**Webhook tunnel status (for 10.6):** `ngrok http https://birchscents.test:443` connects but forwards the *client's* Host header (the ngrok public hostname) to the backend instead of rewriting it to `birchscents.test` — Herd/Valet's nginx then can't resolve the site and 404s. `ngrok http --help` shows no `--host-header` rewrite flag in this v3 install (that was a v2 flag); v3 needs a Traffic Policy file to rewrite the header, or route around Valet's Host-based resolution entirely (e.g. tunnel to a temporary `php artisan serve` port instead of through nginx). Not yet resolved — pick this up before attempting 10.6.

## Phase 11 — Testing & Performance Optimization

- [ ] 11.1 Full backend test suite green; add any missing money-path coverage (checkout totals, webhook edge cases).
- [ ] 11.2 Frontend: `next build` zero errors/warnings that matter; ESLint clean; dead code removed.
- [ ] 11.3 Lighthouse on landing, shop, PDP (mobile): Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 — fix images (sizes, priority on hero), font loading, and any oversized client bundles (audit `"use client"` usage).
- [ ] 11.4 Accessibility sweep: keyboard-only full purchase journey, focus management in drawer/dialogs, screen-reader labels on cart controls and variant selector, contrast check on gold-accent elements.
- [ ] 11.5 Cross-device QA: iPhone-class Safari, Android Chrome, desktop Safari/Chrome/Firefox; fix layout/interaction defects.
- [ ] 11.6 SEO/metadata final pass: per-page titles/descriptions, OG images, favicon, `robots.txt`, `sitemap.xml` (products + categories).
- [ ] 11.7 Content pass: real product photography and final copy replace placeholders; verify sensory, non-clichéd voice throughout.
- [ ] 11.8 Commit: "Phase 11 — QA & performance".

## Phase 12 — Docker, Coolify & Production Deployment

- [ ] 12.1 Write `frontend/Dockerfile` (multi-stage, `output: 'standalone'`, non-root, port 3000) + `.dockerignore`; verify `docker build` + run locally.
- [ ] 12.2 Write `backend/Dockerfile` (php-fpm-alpine + nginx, config/route cache at boot, `LOG_CHANNEL=stderr`, port 8080) + `.dockerignore`; verify locally against Supabase.
- [ ] 12.3 (Optional) root `docker-compose.yml` for container-parity smoke tests only — day-to-day local dev uses Herd + `npm run dev` (CLAUDE.md §12). Document the Herd setup and both dev servers in a short root README.
- [ ] 12.4 Provision the Hetzner VPS; install Coolify; point DNS (`birchscents.com` → frontend, `api.birchscents.com` → backend).
- [ ] 12.5 Create the two Coolify apps from the repo (base dirs `/frontend`, `/backend`), enter all production env vars, set health checks, set `php artisan migrate --force` as the backend deploy command.
- [ ] 12.6 Deploy backend, run migrations + production seed (categories/products), verify `/api/v1/health` over HTTPS; deploy frontend, verify TLS on both domains.
- [ ] 12.7 Switch to Paystack **live** keys in Coolify; set the live webhook URL in the Paystack dashboard; complete one real low-value live transaction end-to-end and confirm webhook fulfillment.
- [ ] 12.8 Production Supabase auth config: production site URL + redirect URLs, Google OAuth production credentials.
- [ ] 12.9 Launch checklist: `APP_DEBUG=false`, CORS locked to the production origin, admin account set, error monitoring at minimum via Coolify logs, database backup plan confirmed (Supabase automatic backups).
- [ ] 12.10 Enable auto-deploy on push to `main`. Tag `v1.0.0`. **Launch.** 🕯️
