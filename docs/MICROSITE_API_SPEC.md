# Microsite ↔ POS — Public API Spec

What the customer-facing microsite needs from the Recety POS to go live.

The microsite is fully working on mock data. Every backend call routes through a
single file (`src/lib/api/client.ts`), so once these endpoints exist the mock
bodies are swapped for `fetch()` calls — nothing else changes. The TypeScript
shapes in `src/lib/api/types.ts` are the contract.

---

## Ground rules

- **Public & unauthenticated.** The customer has no login/JWT, so these can't
  reuse the auth-guarded `/api/products` etc. They need their own public,
  rate-limited routes that accept a **public store identifier** (a slug).
- **Money is always a string, 3 decimals** (e.g. `"1.250"`) — same
  `Decimal(10,3)` rule as the rest of the repo. Never serialize to a JS number.
- **Server recomputes all prices** at order time. Never trust amounts from the
  client; the microsite's totals are display-only.
- **Payment is out of scope for now** (see bottom).

---

## Schema additions required

1. **`Tenant.slug`** — a unique, public identifier so a web address maps to a
   store (e.g. `albaraka` → that tenant). `Tenant` has no public id today.
2. **`Order.tableId`** — nullable FK to `Table`, so a dine-in order placed from
   the web can carry the customer's table. The `Order` model has no table link
   yet (confirmed: `orders.service` and `usePOSCart` reference no table).

---

## Endpoints

Names are suggestions; the shapes are what matter.

### 1. Store info
`GET /public/stores/:slug`

```json
{
  "slug": "albaraka",
  "businessName": "Al Baraka Biryani",
  "businessNameAr": "مطعم البركة للبرياني",
  "businessType": "RESTAURANT",
  "tagline": "…",
  "taglineAr": "…",
  "logo": null,
  "coverImage": "https://…",
  "currency": "KWD",
  "rating": 4.8,
  "ratingCount": 1243,
  "hours": "Daily · 12:00 PM – 1:00 AM",
  "hoursAr": "…",
  "isOpenNow": true,
  "orderTypes": ["TAKEAWAY", "DINE_IN", "DELIVERY"],
  "branches": [
    { "id": "br_…", "name": "Salmiya", "nameAr": "السالمية", "area": "Salem Al Mubarak St", "areaAr": "…" }
  ]
}
```

`orderTypes` should reflect the tenant's `orderTypeConfig` (only enabled types).

### 2. Menu
`GET /public/stores/:slug/menu` — active products only.

```json
{
  "categories": [
    { "id": "cat_…", "parentId": null, "name": "From the Grill", "nameAr": "من المشاوي", "slug": "grill", "sortOrder": 3 },
    { "id": "cat_…", "parentId": "cat_drinks", "name": "Hot Drinks", "nameAr": "مشروبات ساخنة", "slug": "hot-drinks", "sortOrder": 1 }
  ],
  "products": [
    {
      "id": "p_…",
      "categoryId": "cat_…",
      "name": "Mixed Grill Platter",
      "nameAr": "مشاوي مشكّلة",
      "description": "…",
      "descriptionAr": "…",
      "basePrice": "4.750",
      "images": [{ "url": "https://…", "isPrimary": true }],
      "hasVariants": true,
      "variants": [
        { "id": "v_…", "name": "For one", "nameAr": "لشخص", "price": "4.750", "isDefault": true }
      ],
      "modifierGroups": [
        {
          "id": "mg_…", "name": "Choose a side", "nameAr": "…",
          "required": true, "minSelect": 1, "maxSelect": 1,
          "modifiers": [
            { "id": "m_…", "name": "Saffron rice", "nameAr": "…", "price": "0.000", "isDefault": true }
          ]
        }
      ],
      "popular": true,
      "vegetarian": false,
      "spicy": false
    }
  ]
}
```

### 3. Tables (dine-in)
`GET /public/branches/:branchId/tables`

```json
[
  {
    "id": "da_…", "name": "Main Hall", "nameAr": "القاعة الرئيسية",
    "tables": [
      { "id": "t_…", "code": "T-01", "seats": 4, "status": "AVAILABLE" }
    ]
  }
]
```

`status` ∈ `AVAILABLE | OCCUPIED | RESERVED | CLEANING | DISABLED`. The microsite
only lets the customer pick `AVAILABLE` tables.

### 4. Delivery areas
`GET /public/stores/:slug/delivery-areas`

```json
[
  { "id": "dz_…", "name": "Salmiya", "nameAr": "السالمية", "fee": "0.750" }
]
```

### 5. Create order ("Fire to kitchen")
`POST /public/stores/:slug/orders`

Request body:

```json
{
  "branchId": "br_…",
  "orderType": "DINE_IN",
  "items": [
    {
      "productId": "p_…",
      "variantId": "v_…",
      "quantity": 2,
      "modifiers": [{ "name": "Garlic toum", "nameAr": "ثومية", "price": "0.150" }],
      "notes": "No onions"
    }
  ],
  "customerName": "…",
  "customerPhone": "+965…",
  "notes": "…",
  "tableId": "t_…",
  "deliveryAreaId": "dz_…",
  "address": "Block, street, building…",
  "locale": "en"
}
```

- `tableId` only for `DINE_IN`; `deliveryAreaId` + `address` only for `DELIVERY`.
- Maps to the existing `CreateOrderDto`. Order lands as **`NEW` / `PAYMENT_PENDING`** for staff to fire to the kitchen.

Response:

```json
{ "orderNumber": "ORD-SAL-1234", "status": "NEW", "estimatedMinutes": 20 }
```

### 6. Live order status (for tracking)
`GET /public/orders/:orderNumber/status`

This is what makes the chef's marks show up on the customer's phone. Easiest is
to return a normalized step:

```json
{ "step": 1 }
```

| step | meaning              | POS OrderStatus / KitchenStatus |
|------|----------------------|---------------------------------|
| 0    | received             | `NEW` / `PENDING`               |
| 1    | preparing            | `IN_PROGRESS` / `PREPARING`     |
| 2    | ready / out-for-delivery | `READY` / `KITCHEN_READY`   |
| 3    | done                 | `COMPLETED` / `SERVED`          |
| -1   | cancelled            | `CANCELLED`                     |

If you'd rather return the raw `OrderStatus` + `KitchenStatus`, that's fine —
the microsite will map it. A websocket/SSE push is also welcome; otherwise the
microsite polls this every few seconds.

---

## Per-branch menus (decision needed)

The microsite has the customer pick their **branch first** (opening screen), so
we can serve a branch-specific menu. Today the POS catalog is **tenant-wide** —
all branches share one menu — so every branch shows the same thing.

If a branch should have a different menu, recommended approach (lighter):

- Keep one catalog, but let the admin mark **which products/categories are
  available per branch** (a product↔branch availability toggle).
- Then the menu endpoint takes a branch:
  `GET /public/stores/:slug/menu?branchId=…` → only the items available at that
  branch. Omit `branchId` → full catalog (current behaviour).

The microsite already passes the chosen branch, so this is the only change on
the storefront side (`getMenu(slug, branchId)` + refetch when the branch
changes). The alternative — fully separate menus per branch — is heavier.

---

## Payment (later)

Out of scope for the first cut. The order fires to the kitchen unpaid; the
customer chooses **Cash** on the site (pay at counter / at table / on delivery).
When the gateway is ready we'll add a pay step — POS `pay` endpoint for cash, or
a gateway redirect (KNET/card) for online payment.

---

## Microsite side (for reference)

- Contract types: `src/lib/api/types.ts`
- The only file that changes when these go live: `src/lib/api/client.ts`
  (`getTenant`, `getMenu`, `getTables`, `getDeliveryAreas`, `createOrder`,
  `getOrderStatus`).
