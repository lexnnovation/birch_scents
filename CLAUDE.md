# CLAUDE.md — Birchscents Engineering Handbook

Birchscents is Ghana's premier luxury home fragrance brand (Accra-based, FDA-approved).
Brand tagline: **"Inhale and Feel the Difference."**
This repository is a headless e-commerce monorepo: a Next.js storefront and a Laravel REST API.
The product must *feel* like a world-class luxury brand — sophisticated, warm, calm, minimal — while the codebase stays simple and boring. When in doubt, choose the simpler implementation.

---

## 1. Architecture Overview

```
┌─────────────────────────┐
│  Next.js Frontend       │  UI, cart state, Supabase Auth client
│  (Vercel-style SSR,     │
│   self-hosted via       │
│   Coolify/Docker)       │
└───────────┬─────────────┘
            │  HTTPS — REST, Bearer <Supabase JWT>
┌───────────▼─────────────┐
│  Laravel REST API       │  Validates JWT, authorizes, owns ALL
│  /api/v1/*              │  business logic & data writes
└───────────┬─────────────┘
            │  PostgreSQL wire protocol
┌───────────▼─────────────┐        ┌──────────────────┐
│  PostgreSQL             │        │  Paystack        │
│  (Supabase Free Tier    │        │  init + webhook  │
│   today, self-hosted    │◄───────┤  (HMAC SHA512    │
│   later — connection    │        │   verified)      │
│   string swap only)     │        └──────────────────┘
└─────────────────────────┘
```

### Core decisions and why

| Decision | Reasoning |
|---|---|
| **Laravel owns all application data.** The frontend never queries the database directly; Supabase is used *only* for Auth and as a Postgres host. | Keeps the system database-agnostic. Migrating to self-hosted Postgres later = change `DB_HOST`/`DB_PASSWORD`. No Supabase RLS, no Supabase client data calls to unwind. |
| **Stateless JWT auth.** Laravel verifies the Supabase-issued JWT signature on every request via middleware; no Laravel sessions, no Sanctum tokens. | One source of auth truth (Supabase). Laravel stays horizontally scalable and adds zero auth UI. New OAuth providers (Apple, etc.) are a Supabase dashboard toggle — no code changes. |
| **Cart lives on the client** (Zustand + `localStorage`), validated server-side at checkout. | Guest browsing/carting with zero API chatter. The server re-prices everything at checkout, so client cart data is never trusted. |
| **Money = integer pesewas everywhere** (DB, API, frontend state). Formatting to `GH₵` happens only at render time. | Floating-point money is forbidden. Paystack also expects minor units, so no conversion layer exists anywhere. |
| **Frontend-first with a typed data layer.** All pages are built against local mock data behind the same TypeScript interfaces the API will later fulfill. | The API swap (Phase 10) becomes a change inside `lib/api/` only — no page or component refactoring. |
| **One Docker image per app, orchestrated by Coolify** on a single Hetzner VPS. | MVP-appropriate. No Kubernetes, no queues-as-a-service, no microservices. |

### Explicitly out of scope
Coupons, loyalty, wishlists, reviews, ratings, subscriptions, blog, affiliates, multi-vendor, international shipping. Do not scaffold "for later." Delete speculative abstractions on sight.

---

## 2. Monorepo Folder Structure

```
birch_scents/
├── CLAUDE.md
├── PROJECT_TODO.md
├── docker-compose.yml            # local dev convenience only
├── frontend/                     # Next.js (App Router) + TypeScript
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── (store)/          # public storefront layout (header/footer)
│   │   │   │   ├── page.tsx              # Landing page
│   │   │   │   ├── shop/page.tsx         # Shop grid + category filter
│   │   │   │   ├── shop/[category]/page.tsx
│   │   │   │   ├── products/[slug]/page.tsx
│   │   │   │   ├── cart/page.tsx
│   │   │   │   ├── checkout/page.tsx
│   │   │   │   └── orders/               # confirmation + history (auth)
│   │   │   ├── (auth)/           # minimal centered layout
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── bo/                # admin layout, guarded by role — deliberately not "admin"
│   │   │   │   ├── products/
│   │   │   │   ├── inventory/
│   │   │   │   └── orders/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/               # customized shadcn/ui primitives ONLY
│   │   │   ├── layout/           # Header, Footer, MobileNav, AnnouncementBar
│   │   │   ├── product/          # ProductCard, VariantSelector, Gallery…
│   │   │   ├── cart/             # CartDrawer, CartLineItem, CartSummary
│   │   │   ├── checkout/
│   │   │   ├── marketing/        # Hero, TrustBar, CategoryShowcase, SignatureScent
│   │   │   └── admin/
│   │   ├── lib/
│   │   │   ├── api/              # THE data layer. client.ts + one module per resource
│   │   │   ├── supabase/         # browser + server Supabase clients (auth only)
│   │   │   ├── money.ts          # formatPesewas(), the only money formatter
│   │   │   └── utils.ts
│   │   ├── mocks/                # mock data (products.ts, orders.ts…) — Phase 2–5
│   │   ├── stores/               # cart.ts (Zustand, persisted)
│   │   ├── types/                # shared API contract types (Product, Order…)
│   │   └── styles/globals.css    # design tokens as CSS variables
│   └── …
└── backend/                      # Laravel 13 (API-only)
    ├── Dockerfile
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/Api/V1/        # thin controllers
    │   │   ├── Middleware/                 # VerifySupabaseJwt, EnsureAdmin
    │   │   ├── Requests/                   # FormRequest validation, always
    │   │   └── Resources/                  # API Resources → camelCase JSON
    │   ├── Models/
    │   ├── Services/                       # CheckoutService, PaystackService,
    │   │                                   # InventoryService — business logic
    │   └── Enums/                          # OrderStatus, PaymentStatus
    ├── database/migrations/
    ├── routes/api.php
    └── …
```

**Rules of the structure**
- Controllers are thin: validate (FormRequest) → call a Service → return a Resource. No business logic in controllers or models beyond relationships/casts/scopes.
- `components/ui/` contains only shadcn primitives, always restyled with Birchscents tokens. Feature components live in their domain folder.
- `frontend/src/types/` is the single API contract. Mock data and real API responses both satisfy these types.

---

## 3. Design System & UX Standards

The storefront must read as a crafted luxury brand, not a template. Non-negotiables:

- **Tokens first.** Define the palette (warm ivory/cream base, deep charcoal/espresso text, a single muted gold/amber accent), a serif display face for headlines, a refined sans for body/UI — all as CSS variables in `globals.css`, consumed by Tailwind config. Never hard-code colors or font sizes in components.
- **Whitespace is a feature.** Generous vertical rhythm on sections (`py-20`+ desktop), max-width prose, large product imagery on neutral backgrounds.
- **Motion is subtle.** Framer Motion for fade/slide-in-on-scroll, hover lift on cards, cart drawer transitions. Durations 200–500 ms, gentle easings. Respect `prefers-reduced-motion` — every animation must have a reduced variant.
- **shadcn/ui is always customized.** If a component still looks like the shadcn docs, it's not done.
- **Accessibility is a launch requirement:** semantic landmarks, visible focus states, alt text, 4.5:1 contrast, full keyboard operability of nav/drawer/dialogs, form labels + inline errors.
- **Mobile-first.** Every page is designed at 375 px first, then scaled up. Sticky add-to-cart on mobile PDP.
- **Copy voice:** premium, human, sensory ("crisp", "velvety", "warm", "inviting"). No exclamation-mark marketing, no clichés. Flagship scent: **Snow Melon**. Brand tagline (reserve for hero, OG/meta, and brand moments): **"Inhale and Feel the Difference."**
- **Trust signals** (FDA Approved, Long-lasting, Nationwide Delivery in Ghana, Premium Support) appear as a quiet, elegant strip/section — never badge-spam.

---

## 4. Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Database tables/columns | `snake_case`, plural tables | `product_variants.price_pesewas` |
| Laravel classes | `PascalCase` | `CheckoutService`, `OrderResource` |
| Laravel methods/vars | `camelCase` | `initializeTransaction()` |
| React components (+files) | `PascalCase` | `ProductCard.tsx` |
| Hooks / TS vars / functions | `camelCase` | `useCart`, `formatPesewas` |
| Non-component TS files | `kebab-case` or `camelCase`, be consistent | `variant-selector.ts` |
| JSON request/response keys | `camelCase` | `"pricePesewas": 24500` |
| API routes | plural kebab-case nouns | `GET /api/v1/products` |
| Env vars | `SCREAMING_SNAKE_CASE` | `PAYSTACK_SECRET_KEY` |

The snake_case→camelCase translation happens in exactly one place per direction: Laravel **API Resources** (out) and **FormRequests** (in). Nothing else renames keys.

---

## 5. API Conventions

- Base path `/api/v1`. Version in the URL from day one.
- Resource routes: `GET /products`, `GET /products/{slug}`, `GET /categories`, `POST /checkout`, `GET /orders`, `GET /orders/{orderNumber}`, admin under `/bo/*` (e.g. `GET|POST /bo/products`, `PATCH /bo/orders/{id}`) — deliberately not `/admin/*`; see §6.
- **Success envelope:** `{ "data": … }`; lists add `{ "meta": { "currentPage", "perPage", "total", "lastPage" } }` (Laravel paginator via Resources).
- **Error envelope:** `{ "message": "…", "errors": { "field": ["…"] } }` (Laravel default). Status codes: 200/201, 401 unauthenticated, 403 unauthorized, 404, 422 validation, 409 business conflict (e.g. insufficient stock at checkout).
- Every endpoint validates input through a FormRequest. **Never trust frontend data** — prices, totals, and stock are always recomputed server-side.
- Timestamps in responses are ISO 8601 UTC strings.
- CORS: allow only the storefront origin (`FRONTEND_URL`), configured in `config/cors.php` from env.

### Frontend data layer (`frontend/src/lib/api/`)
- `client.ts`: a thin typed `fetch` wrapper that adds `Authorization: Bearer <token>` (from the Supabase session) and the JSON headers, and normalizes errors into a typed `ApiError`.
- One module per resource (`products.ts`, `orders.ts`, `checkout.ts`, `admin.ts`) exporting typed functions like `getProducts(params): Promise<Paginated<Product>>`.
- During Phases 2–5 these functions return data from `src/mocks/` (with a small artificial delay). In Phase 10 their bodies are swapped for real `client` calls. **Signatures and types never change.**

---

## 6. Authentication Flow

Supabase Auth handles identity (Email+Password, Google; more OAuth providers are dashboard-only additions). Laravel handles authorization and data.

```
User signs in (email/password or Google)
        ↓
Supabase Auth issues a session (access JWT + refresh token)
        ↓
Frontend Supabase client stores/refreshes the session
        ↓
Every API call: Authorization: Bearer <access JWT>
        ↓
Laravel VerifySupabaseJwt middleware:
  – verifies signature against Supabase's JWKS (ES256; alg allowlist per key)
  – checks exp and aud ("authenticated")
  – finds-or-creates local users row keyed by supabase_id (the `sub` claim),
    syncing email/name on first sight
  – binds the User to the request
        ↓
Route middleware authorizes: auth-only routes, `EnsureAdmin` for /bo/*
```

**Rules**
- Laravel never stores passwords and has no login routes. Password reset, email verification, OAuth — all Supabase. (This also means there is no login form anywhere to brute-force — the admin route naming below is obscurity on top of that, not a substitute for it.)
- Admin status is the `is_admin` boolean on the local `users` table, set manually in the DB for MVP. It is **never** derived from JWT claims or frontend state. The frontend admin shell (`/bo`) reflects this: it renders nothing admin-shaped — no sidebar, no nav, no page content — until an admin-scoped API call confirms access; a non-admin gets redirected to `/shop` before anything is painted, with no "forbidden" messaging. The API middleware (`EnsureAdmin`) is the real gate regardless. The route is named `/bo` rather than `/admin` and is never linked from anywhere in the storefront UI, purely to keep it out of casual discovery/scanners — it is not itself a security control.
- Reject tokens with unexpected `alg`, missing `sub`, or expired `exp`. Never decode-without-verify.
- Supabase's current default signs access tokens asymmetrically (ES256) and publishes public keys at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` — no shared secret lives in `backend/.env`. (Older projects may still use a legacy HS256 shared secret; confirm which your project issues — decode a real token's header — before assuming either.)
- The frontend Supabase client is used for auth **only** — never for table reads/writes.

---

## 7. Database Conventions

- PostgreSQL via Laravel's standard `pgsql` connection. **No Supabase-specific SQL features** (no RLS policies, no Supabase functions) — this is what keeps migration to self-hosted Postgres a config change.
- All schema changes through Laravel migrations. No manual dashboard edits.
- Tables: plural snake_case. Primary keys: `id` bigint auto-increment. Foreign keys: `{table_singular}_id` with DB-level constraints. `created_at`/`updated_at` on everything.
- Public identifiers: products expose a unique `slug`; orders expose a human-readable unique `order_number` (e.g. `BS-2026-000123`). Internal bigint IDs are never used in customer-facing URLs.
- Money columns: `*_pesewas` `bigint`. Quantity/stock: `integer` with `CHECK (stock >= 0)` semantics enforced in code + DB.
- Enum-ish columns (`orders.status`, `payments.status`) are strings backed by PHP `Enum` casts.

### Core schema (MVP)

```
users              id, supabase_id (uuid, unique), email, name, phone, is_admin, timestamps
categories         id, name, slug (unique), description, image_url, sort_order
products           id, category_id → categories, name, slug (unique), tagline,
                   description, scent_notes (text), image_url, gallery (jsonb),
                   is_featured, is_active, timestamps
product_variants   id, product_id → products, label ('50ml'|'100ml'|'Standard'),
                   sku (unique), price_pesewas (bigint), stock (int), is_active
orders             id, order_number (unique), user_id → users, status
                   (pending|paid|processing|delivered|cancelled),
                   subtotal_pesewas, delivery_fee_pesewas, total_pesewas,
                   delivery_name, delivery_phone, delivery_address, delivery_city,
                   delivery_note, timestamps
order_items        id, order_id → orders, product_variant_id → product_variants,
                   product_name, variant_label, unit_price_pesewas, quantity,
                   line_total_pesewas          # denormalized snapshot on purpose
payments           id, order_id → orders, provider ('paystack'),
                   reference (unique), status (pending|success|failed),
                   amount_pesewas, currency ('GHS'), paid_at,
                   raw_payload (jsonb), timestamps
```

`order_items` snapshots name/price at purchase time so later product edits never rewrite order history.

---

## 8. Currency Handling

- **All monetary values are integer minor units (pesewas).** In Postgres (`bigint`), in PHP (`int`), in JSON (`pricePesewas: 24500`), in TS state. Floats for money are forbidden — code review rejects any `float`/`decimal`-as-double money math.
- Currency is `GHS` only for MVP.
- Formatting happens exclusively at render time via `lib/money.ts` → `formatPesewas(24500) === "GH₵ 245.00"` (uses `Intl.NumberFormat('en-GH', { currency: 'GHS' })`). No other formatter may exist.
- Paystack amounts are already minor units — pass pesewas straight through, no ×100/÷100 anywhere.
- Totals are computed server-side only: `sum(line totals) + delivery fee`. The client displays server-confirmed numbers at checkout.

---

## 9. Paystack Integration

### Flow
1. `POST /api/v1/checkout` (authenticated): validates cart items against DB (existence, active, stock, **server-side prices**), creates `orders` row (`pending`) + `order_items` + `payments` row, then calls Paystack **Initialize Transaction** with `amount` (pesewas), `currency: GHS`, customer email, our generated unique `reference`, and `callback_url`. Returns `{ authorizationUrl, reference, orderNumber }`.
2. Frontend redirects the customer to `authorizationUrl`.
3. Paystack redirects back to `/checkout/callback?reference=…`; the page polls `GET /api/v1/orders/{orderNumber}` for status. **The redirect never marks anything paid.**
4. Paystack calls `POST /api/v1/webhooks/paystack`. This is the *only* place an order becomes `paid`.

### Webhook rules (non-negotiable)
- Verify `x-paystack-signature`: `hash_hmac('sha512', $rawBody, PAYSTACK_SECRET_KEY)` compared with `hash_equals()`. Invalid → 401, do nothing. Use the **raw** request body, not re-encoded JSON.
- The webhook route is excluded from any CSRF/auth middleware but rate-limited.
- After signature verification, on `charge.success`: look up `payments` by `reference`; **re-verify via Paystack's Verify Transaction API** (never trust the webhook payload alone); confirm `amount` and `currency` match our record exactly; then in one DB transaction mark payment `success`, order `paid`, and decrement variant stock.
- **Idempotent:** if the payment is already `success`, return 200 and exit. Always return 200 quickly for validly-signed events (even unhandled types) so Paystack stops retrying.
- Store the verified payload in `payments.raw_payload` for audit.
- Amount mismatch or unknown reference → log loudly, do not fulfill.

Keys: test keys (`sk_test_…`) locally, live keys only in Coolify production env. `PAYSTACK_SECRET_KEY` never leaves the backend; the frontend only ever sees the redirect URL.

---

## 10. Security Rules

1. Validate every incoming request (FormRequests backend; Zod or equivalent on checkout forms frontend — UX only, server is the authority).
2. Never trust frontend data: recompute prices, totals, stock server-side at checkout.
3. JWT verification as in §6 — signature, `exp`, `aud`, alg allowlist. No decode-without-verify.
4. Webhook HMAC SHA512 + API re-verification as in §9.
5. Money = integers only (§8).
6. All secrets in environment variables. `.env` files are gitignored; commit `.env.example` per app with placeholder values.
7. Authenticated endpoints behind JWT middleware; admin endpoints additionally behind `EnsureAdmin`. Users can only read their own orders (`where user_id = auth user`).
8. Eloquent/parameterized queries only — no raw string-interpolated SQL. `$fillable` on all models (mass-assignment protection).
9. Rate-limit auth-adjacent and checkout endpoints (Laravel throttle).
10. HTTPS everywhere in production (Coolify-managed Let's Encrypt). Backend `APP_DEBUG=false` in production.
11. Uploaded product images: validate type/size, store outside the webroot or in Supabase Storage, serve via URL — never execute.

---

## 11. Environment Variable Strategy

Each app owns its env file; nothing is shared implicitly. Commit `.env.example` files; never commit real values.

**frontend/.env** (`NEXT_PUBLIC_` = shipped to the browser — public-safe only)
```
NEXT_PUBLIC_API_URL=            # local: https://birchscents.test/api/v1 (Herd) · prod: https://api.birchscents.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # anon key is public by design
NEXT_PUBLIC_SITE_URL=           # for auth redirects & metadata
```

**backend/.env**
```
APP_ENV= APP_KEY= APP_DEBUG= APP_URL=
FRONTEND_URL=                   # CORS origin + Paystack callback base
DB_CONNECTION=pgsql
DB_HOST= DB_PORT= DB_DATABASE= DB_USERNAME= DB_PASSWORD=   # Supabase today,
                                                           # self-hosted later
SUPABASE_URL=                   # project URL; derives the JWKS endpoint used to verify tokens
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
```

Rules: reference env only via `config/*.php` (`config('services.paystack.secret')`), never `env()` outside config files (breaks config caching). Rotating a secret = update in Coolify + redeploy, no code change. The Supabase→self-hosted Postgres migration touches only the `DB_*` block (plus an auth decision at that time — out of MVP scope).

---

## 12. Local Development Environment

Local development does **not** use Docker — Docker is a production-only concern (§13). Run the two apps natively:

- **Backend (Laravel):** served by **Laravel Herd**. Herd bundles PHP + nginx and serves the app at a `.test` domain automatically (`https://birchscents.test`) — no `php artisan serve`, no local Docker. Run Artisan/Composer through Herd's bundled PHP (`herd php artisan …`, `herd composer …`, or add Herd's PHP to your `PATH`). Migrations, seeders, and Pest tests all run through Herd's PHP.
- **Frontend (Next.js):** `npm run dev` on `http://localhost:3000` — Herd does not serve Node apps.
- **Database:** Supabase-hosted Postgres in every environment (§7); Herd runs no local database for this project. Point `backend/.env` `DB_*` at Supabase for local dev too.
- **Local env wiring:** frontend `NEXT_PUBLIC_API_URL=https://<herd-domain>.test/api/v1`; backend `FRONTEND_URL=http://localhost:3000` (CORS origin + Paystack callback base). Herd provisions trusted TLS for `.test` domains, so the local API is HTTPS out of the box.
- **Paystack webhooks locally:** a `.test` domain isn't publicly reachable — expose it with a tunnel (Herd's share feature, `ngrok`, or `cloudflared`) and register that public URL as the **test** webhook in the Paystack dashboard (§9, Phase 9.7).

## 13. Docker Guidelines

- **One Dockerfile per app**, multi-stage:
  - `frontend/Dockerfile`: deps → build (`next build`, `output: 'standalone'`) → slim `node:22-alpine` runtime running `node server.js`. Non-root user, port 3000.
  - `backend/Dockerfile`: composer install (no-dev, optimized autoloader) → `php:8.4-fpm-alpine` + nginx (or FrankenPHP/Octane if preferred — pick one and stay) in a single container for MVP simplicity. Runs `php artisan config:cache`, `route:cache` at container start; migrations run as a deploy step, not on boot. Port 8080.
- Images are self-contained; **all configuration via env vars at runtime** — never bake secrets or `.env` files into images.
- A root `docker-compose.yml` is **optional** — day-to-day local dev uses Herd + `npm run dev` (§12), not Docker. Keep one only for an occasional container-parity smoke test; production containers are managed by Coolify individually.
- `.dockerignore` in each app: `node_modules`, `vendor`, `.env*`, `.next`, `storage/logs`.
- Health checks: frontend `GET /`, backend `GET /api/v1/health` (simple JSON + DB ping) — Coolify uses these.

---

## 14. Coolify Deployment (Hetzner VPS)

- One Hetzner Cloud VPS (CX22/CX32 class is plenty) running Coolify.
- Two Coolify applications from this one repo, using **Base Directory**: `/frontend` and `/backend`, each building its own Dockerfile on push to `main`.
- Domains: `birchscents.com` (or `www`) → frontend; `api.birchscents.com` → backend. Coolify/Traefik provisions Let's Encrypt TLS automatically.
- All env vars entered in each Coolify app's Environment tab (mirroring the `.env.example` keys). Mark secrets as such.
- Deploy order when schema changes: backend (with `php artisan migrate --force` as the pre/post-deploy command in Coolify) → frontend.
- Database stays on Supabase for MVP — the VPS runs no Postgres. When migrating later: provision Postgres (Coolify one-click), `pg_dump`/restore, update `DB_*` env vars, redeploy backend.
- Paystack webhook URL (`https://api.birchscents.com/api/v1/webhooks/paystack`) is configured in the Paystack dashboard per environment (test vs live).
- Logs via Coolify's log viewer; Laravel logs to `stderr` (`LOG_CHANNEL=stderr`) so container logs capture everything.

---

## 15. Testing & Quality Bar

- Backend: Pest/PHPUnit feature tests for the critical paths — JWT middleware (valid/expired/tampered), checkout validation (price tampering, out-of-stock), webhook (bad signature 401, success flow, idempotent replay, amount mismatch). These are the tests that guard money; they are not optional.
- Frontend: TypeScript strict mode, ESLint + Prettier clean. `next build` with zero type errors is the merge bar.
- Lighthouse targets on the storefront: Performance ≥ 90 mobile, Accessibility ≥ 95. Use `next/image` for all imagery, `next/font` for fonts (no layout shift), and keep JS payloads lean (server components by default; `"use client"` only where interaction demands it).
