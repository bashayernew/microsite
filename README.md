# Recety Microsite

Public, customer-facing **ordering storefront** for stores running on Recety POS.
A merchant adds products in the POS; this site shows their menu and lets
customers place **takeaway** or **dine-in** orders that land in the POS dashboard
as a new order for staff to fire to the kitchen.

Built as a separate Next.js app (App Router) for performance and SEO, decoupled
from the POS so each ships independently.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a custom design system (`src/app/globals.css`)
- **Arabic / English** with full **RTL** support
- Mock data now; swaps to the real POS API behind one file

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000> — click through to the demo store at
<http://localhost:3000/s/noor>. Toggle العربية / EN in the header to see RTL.

Production build: `npm run build && npm start`.

## How it's structured

```
src/
  app/
    page.tsx                 Marketing root (demo entry → /s/noor)
    s/[tenant]/page.tsx      Store page (server component, SEO metadata)
  components/
    store-provider.tsx       Client state: locale, cart, order type, branch
    ui/                      Icons + primitives (Sheet, QtyStepper, Money…)
    store/
      store-view.tsx         Header, hero, category rail, searchable menu
      product-sheet.tsx      Item detail: variants, modifiers, qty, notes
      order-drawer.tsx       Cart → checkout (takeaway/dine-in) → confirmation
  lib/
    api/
      types.ts               The data contract (mirrors POS Prisma models)
      mock.ts                Sample store + menu (stand-in for the API)
      client.ts              getTenant / getMenu / createOrder  ← swap here
    format.ts                Money helpers (KWD, 3dp, string-safe)
    i18n.ts                  EN/AR dictionaries + helpers
```

## Wiring the real POS API

When the team leader's public endpoints are ready, edit **only**
`src/lib/api/client.ts` — replace the mock returns with `fetch()` calls. The
return types in `types.ts` are the contract; nothing else changes.

Notes for whoever builds the backend:

- **Money stays a string** (KWD, 3 decimals) end-to-end. Never parse it into a
  JS number — that loses precision. The POS recomputes all totals at order time;
  the storefront's totals are display-only.
- **Public store identifier.** The POS resolves a store by `tenantId` from a JWT.
  A public site has no JWT, so the API must accept a public id. This app assumes
  a `slug` (e.g. `noor.recety.com` → `noor`). The `Tenant` model has no `slug`
  column yet — add one.
- **Order creation** maps to the POS `POST /api/orders` (`CreateOrderDto`):
  `branchId`, `orderType` (`TAKEAWAY` | `DINE_IN`), `items[]`. The order lands as
  status `NEW` / `PAYMENT_PENDING`. **Payment is intentionally out of scope** and
  will be added later.
- **Branch is required** by the POS — the checkout includes a branch picker.
- **Dine-in + tables:** the POS `Order` has no `tableId`. If dine-in via the
  microsite should target a specific table (QR on the table), add that field.

## Production upgrades (not in the demo)

- Replace the in-app locale toggle with `[locale]` route segments (per the
  structure doc) for fully localized URLs.
- Add `sitemap.ts`, `robots.ts`, and per-store JSON-LD.
- ISR + an on-demand revalidate webhook from the POS so menus update on change.
