# Tosion Fashion — Session Handoff

## Objective
Build the Tosion e-commerce admin dashboard + dynamic storefront incrementally,
one commit per step (`feat:` style), recreating `~/Downloads/maison-admin.html`
in a Next.js 16 frontend + Express/MongoDB backend. After each commit: verify,
clean temp data, commit, remind the user to view changes.

## Where we stopped (all committed, tree clean, main branch)

### Admin dashboard — REAL DATA
- `a491898` backend admin stats API: `GET /admin/stats` (revenue/orders/customers
  conversion with month-over-month deltas), `GET /admin/revenue-chart` (8-week
  revenue bars), `GET /admin/top-products` (top 5 by units sold),
  `GET /admin/customers` (all users with order count + total spent).
  All behind requireAuth + requireAdmin.
- `bbfb663` frontend StatCards, RevenueChart, TopProducts, OrdersTable all fetch
  from real API (were 100% hardcoded). Sidebar badge shows dynamic pending order
  count. Dead links (View report, View all orders) fixed to real hrefs.
- `bfde9e7` fixed all admin components to use `http://localhost:2000` instead of
  `process.env.NEXT_PUBLIC_API_URL` (which is undefined — no .env.local file).

### Toast notification system
- `c11d915` installed `sonner`. Toaster added to both `(site)/layout.tsx` and
  `(admin)/admin/layout.tsx`. Toasts wired into: order placed (CheckoutPage),
  promo applied (BagPage + CheckoutPage), logout (Header).

### Customer account page
- `37b0a3b` loading skeletons (ProfileSkeleton, OrdersSkeleton), order status
  timeline (4-step visual: pending → confirmed → shipped → delivered), error
  state with "Try again" button, "View my order" link after checkout confirmation,
  member-since date in profile card.

### Admin pages (3 new)
- `071acd3` `/admin/customers` — table of all users with avatar, email, join
  date, order count, total spent. `/admin/analytics` — summary cards + revenue
  chart + top products (reuses same API endpoints). `/admin/settings` — store
  info form (name, email, currency, shipping threshold, tax rate) with toast
  on save (currently frontend-only, no backend persistence).

### Mobile account + notification bell
- `c62f28b` Header hamburger menu gains: My Account, Wishlist, Sign out (when
  logged in) or Account link (when logged out). Admin Topbar notification bell
  shows unread count badge.

### Persistent notification system (backend + frontend)
- `c38a992` `Notification` model (type, title, message, read, href, timestamps).
  API: `GET /notifications` (returns items + unreadCount), `PUT /notifications/read`
  (mark all), `PUT /notifications/:id/read` (mark one). All behind requireAdmin.
  Notifications auto-created on: order placed (type=new_order), order status
  changed (type=order_status). Topbar polls every 30s, marks individual
  notifications read on click, "Mark all read" button.

### Earlier work (still complete)
- Cart system: `CartContext.tsx` (localStorage + server sync when logged in,
  debounced 500ms), `BagPage.tsx`, `/bag` route, ProductDetail "Add to bag" +
  ProductCard "Quick add", Header dynamic bag count.
- Checkout: `StepsBar.tsx`, `CheckoutPage.tsx` (shipping → payment →
  confirmation), `/checkout` route, requires login, calls `POST /orders`.
- Wishlist: `WishlistContext.tsx`, `WishlistPage.tsx`, `/wishlist` route.
- Search: Backend `q` parameter on `GET /products`, `SearchPage.tsx` with
  debounce + results + sort + pagination.
- Product Reviews: `review.model.ts`, `review.controller.ts`, `review.routes.ts`
  at `/reviews`. Wired into ProductDetail.tsx (fetched, computed stars, list,
  write form).
- Promo Codes: `promo.model.ts`, `promo.controller.ts`, `promo.routes.ts` at
  `/promos`. `WELCOME10` auto-seeded (10% off). `calcTotals.ts` shared utility.
  CartContext promo state. BagPage + CheckoutPage wired. Admin
  `/admin/discounts` page.
- Server-side Cart: `requireAuth.ts`, `cart.model.ts` (per-user, with `_id` ↔
  `product` field mapping), `cart.controller.ts` (GET/PUT), `cart.routes.ts`.
- Orders: `order.model.ts` (user, items, shipping, totals, status, promoCode,
  orderNumber). `order.controller.ts` (POST create, GET mine, GET all admin,
  GET detail, PUT status). Statuses: pending → confirmed → shipped → delivered /
  cancelled. `order.routes.ts` at `/orders`.
- Customer Auth: `CustomerSessionContext.tsx` (fetches `/auth/me`, provides user
  + logout + refresh). CartContext consumes it for server sync.
- Admin Orders: `/admin/orders` page (`OrdersManager.tsx`) — list all orders,
  filter by status, expand for detail, update status.
- Bug fixes: `_id` vs `product` field mismatch in cart sync, `/account` route
  conflict, missing `useEffect` import in Header, Footer duplicate key, hydration
  mismatch suppression.
- Landing page: Hero, featured categories, new arrivals, editorial, newsletter
  — all wired to backend CMS data.
- Admin CMS: HeroManager, CategoryManager, ArrivalManager, EditorialManager,
  NewsletterManager, ProductsManager, DiscountManager.

## Key architecture facts
- Backend: Express on :2000, ESM imports with `.js` extensions, 2-space indent,
  strict TS. MongoDB database: `tosion_fashion`. Mongoose v9. Express sessions
  via `connect.sid` cookie, session typed to `{ _id, firstName, lastName, email,
  role }`.
- Models: User(role user|admin), Product, Category, CategoryHeader singleton,
  Arrival, ArrivalHeader singleton, HeroContent singleton, EditorialContent
  singleton, NewsletterContent singleton, PromoCode, Cart (per-user), Order
  (with embedded items, shipping, status tracking), Review, Notification.
- Auth middleware: `requireAuth` checks `req.session.user`, `requireAdmin`
  additionally checks `role === "admin"`. GET /auth/me reads session.
- Route ordering gotcha: `/header` routes MUST be registered before `/:id`.
  `/related/:slug` must be registered before `/:slug`. `/notifications/read`
  must be registered before `/:id/read`.
- Product slugs auto-generated via pre-save hook (collision-safe: -2, -3 etc).
- Frontend: Next.js 16 App Router, port :3000, Tailwind v4 CSS-first @theme,
  4-space indent, axios hardcoded to `http://localhost:2000` (NOT env var —
  `NEXT_PUBLIC_API_URL` is undefined). Dynamic sections are async server
  components; interactive sections split into server wrapper + `"use client"`
  child. Shop filters/sort/pagination are client-side. React hooks lint rule
  `react-hooks/set-state-in-effect` forbids setState directly in useEffect.
  Next 16: params AND searchParams are Promises, cookies() async. Site layout:
  Header is `fixed h-20` — page content offsets with `mt-20`. Uses `sonner`
  for toast notifications.
- Auth gotcha: sessions snapshot user data at login. DB role promotions only
  take effect after re-login — promote via mongosh BEFORE login.
- Cart sync: frontend `CartItem._id` (product ID string) maps to server
  `product` (ObjectId) — controller handles this. Cart state stored in localStorage
  for guests, synced to server when logged in.
- Cart + Checkout totals: `calcTotals.ts` shared utility used by BagPage and
  CheckoutPage. Free shipping at $150+, 5% tax, promo discount subtraction.
- Admin sidebar links to `/admin/discounts` (not `/admin/promos`).
- Account route: `/account` (site layout, logged-in view), `/login` (auth
  layout, login/register form).
- Backend has 2 PRE-EXISTING tsc errors in auth.controller.ts (~lines 217/222,
  Google audience typing) — leave alone unless asked.

## Database state (at handoff time)
- 4 users (2 admin: kamanzitony@gmail.com, kamanzitony06@gmail.com; 2 user:
  tonylee305460@gmail.com, test@test.com)
- 4 orders, 1 product, 6 categories, 2 reviews, 2 carts, 2 promo codes,
  2 notifications, 4 arrivals, 1 hero, 1 editorial, 1 newsletter, 1 category
  header, 1 arrival header

## Admin credentials (for testing)
- **kamanzitony@gmail.com** / **admin123** (admin)
- **test@test.com** / **password123** (user)

## Environment notes
- Backend runs with tsx watch (auto-restarts on file changes). Frontend runs
  Next.js dev server. Both on localhost.
- If servers are down, restart from their respective folders:
  ```
  # Backend
  cd backend && nohup npm run dev > /tmp/opencode/backend-dev.log 2>&1 &
  # Frontend
  cd frontend && nohup npm run dev > /tmp/opencode/frontend-dev.log 2>&1 &
  ```
- Verification: NEVER run `next build` while dev server runs. Use `npm run lint`
  + `npx tsc --noEmit` + `curl` against :3000/:2000.

## Ideas discussed / possible next steps
- Settings page: currently frontend-only (no backend persistence). Could add a
  Settings model to persist store name, email, currency, shipping threshold,
  tax rate — and wire them into calcTotals/placeOrder.
- Homepage sections still hardcoded (Header/Footer/nav links) — dynamic treatment
  possible.
- Footer still has dead links (/women /men /sales /journal) — untouched by user
  choice.
- Product detail: star rating is visual-only (computed from real reviews now but
  could be richer). Stock/quantity tracking possible.
- The wishlist is localStorage-only — no server-side persistence.
- Customer profile editing (name, email) not yet possible from account page.
- Admin dashboard could add more analytics (revenue over time, customer growth
  charts) with more data.

## How to resume
1. Read this file + `git log --oneline -20`
2. Start servers if down (see Environment notes above)
3. Confirm servers: `curl localhost:2000/categories && curl localhost:3000`
4. Admin login: `kamanzitony@gmail.com` / `admin123`
5. Ask the user what's next
