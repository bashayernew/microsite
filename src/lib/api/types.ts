/**
 * Public, read-facing types for the microsite.
 *
 * These intentionally mirror the POS Prisma models (apps/api/prisma/schema.prisma)
 * but expose ONLY what a public storefront needs, and — critically — every money
 * value is a STRING (KWD, 3 decimal places), never a JS number. The POS stores
 * money as Decimal(10,3); serializing to a JS number would lose precision. The
 * microsite keeps prices as strings end-to-end and lets the POS recompute totals
 * server-side at order time.
 *
 * When the team leader's public API lands, only `lib/api/client.ts` changes —
 * these shapes are the contract.
 */

export type Locale = "en" | "ar";

export type OrderType = "TAKEAWAY" | "DINE_IN" | "DELIVERY";

export type BusinessType =
  | "RESTAURANT"
  | "CAFE"
  | "MARKET"
  | "BAKERY"
  | "GENERAL_RETAIL";

/** A client/store. POS: `Tenant`. `slug` is the public identifier (see note in client.ts). */
export interface Tenant {
  slug: string;
  businessName: string;
  businessNameAr: string;
  businessType: BusinessType;
  tagline: string;
  taglineAr: string;
  logo: string | null;
  coverImage: string;
  currency: string; // "KWD"
  rating: number;
  ratingCount: number;
  priceLevel: 1 | 2 | 3;
  hours: string;
  hoursAr: string;
  isOpenNow: boolean;
  branches: Branch[];
  /** Which order types this store accepts. POS: Tenant.orderTypeConfig */
  orderTypes: OrderType[];
  /** Admin-managed hero offers / featured banners (rotating carousel). */
  offers?: Offer[];
}

/** A promotional / featured banner shown in the hero carousel. POS: future "Offers". */
export interface Offer {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  /** Optional small badge, e.g. "30% OFF". */
  badge?: string;
  badgeAr?: string;
  image: string;
  /** Optional in-site link (e.g. a category page). */
  href?: string;
}

/** POS: `Branch` */
export interface Branch {
  id: string;
  name: string;
  nameAr: string;
  area: string;
  areaAr: string;
}

/** POS: `TableStatus` */
export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "CLEANING"
  | "DISABLED";

/** POS: `Table` — a physical table a dine-in customer can sit at. */
export interface Table {
  id: string;
  code: string; // e.g. "T-01"
  seats: number;
  status: TableStatus;
}

/** POS: `DiningArea` — groups tables within a branch (e.g. "Main", "Terrace"). */
export interface DiningArea {
  id: string;
  name: string;
  nameAr: string;
  tables: Table[];
}

/** POS: `DeliveryArea` — a delivery zone with its fee (KWD string, 3dp). */
export interface DeliveryArea {
  id: string;
  name: string;
  nameAr: string;
  fee: string;
}

/** POS: `Category` (supports a parent → child tree via `parentId`). */
export interface Category {
  id: string;
  /** null for a top-level category; otherwise the parent category id. */
  parentId: string | null;
  name: string;
  nameAr: string;
  slug: string;
  sortOrder: number;
}

/** POS: `ProductImage` */
export interface ProductImage {
  url: string;
  isPrimary: boolean;
}

/** POS: `ProductModifier` */
export interface Modifier {
  id: string;
  name: string;
  nameAr: string;
  /** KWD, 3dp, as a string. May be "0.000". */
  price: string;
  isDefault: boolean;
}

/** POS: `ProductModifierGroup` */
export interface ModifierGroup {
  id: string;
  name: string;
  nameAr: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  modifiers: Modifier[];
}

/** POS: `ProductVariant` (a buyable combination, e.g. "Large"). */
export interface Variant {
  id: string;
  name: string;
  nameAr: string;
  /** KWD, 3dp, as a string. */
  price: string;
  isDefault: boolean;
}

/** POS: `Product` */
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  /** KWD, 3dp, as a string. The base/starting price. */
  basePrice: string;
  images: ProductImage[];
  tags: string[];
  spicy?: boolean;
  vegetarian?: boolean;
  popular?: boolean;
  hasVariants: boolean;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
}

/** Full menu payload for a store. */
export interface Menu {
  categories: Category[];
  products: Product[];
}

/* ── Order submission (POS: CreateOrderDto) ──────────────────────────────── */

export interface NewOrderItemModifier {
  name: string;
  nameAr?: string;
  price: string;
}

export interface NewOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  modifiers?: NewOrderItemModifier[];
  notes?: string;
}

export interface NewOrder {
  branchId: string;
  orderType: OrderType;
  items: NewOrderItem[];
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  /** Dine-in only: the table the customer is seated at. POS `Order` has no
   *  `tableId` column yet — flag this to the backend so dine-in orders can be
   *  routed to the right table. */
  tableId?: string;
  tableCode?: string;
  /** Delivery only: the chosen zone (POS DeliveryArea), its fee, and address. */
  deliveryAreaId?: string;
  deliveryFee?: string;
  address?: string;
  /** Cashier/customer UI language at order time — drives downstream localization. */
  locale: Locale;
}

/** What the POS returns after creating an order (subset). */
export interface OrderConfirmation {
  orderNumber: string;
  status: "NEW";
  estimatedMinutes: number;
}

/**
 * Live progress of an order, polled by the customer's tracking screen.
 * `step` maps the POS order/kitchen status to the customer-facing steps:
 *   0 = received      (POS NEW / kitchen PENDING)
 *   1 = preparing     (POS IN_PROGRESS / kitchen PREPARING)
 *   2 = ready/on-the-way (POS READY / kitchen KITCHEN_READY)
 *   3 = done          (POS COMPLETED / kitchen SERVED, or delivered)
 *  -1 = cancelled     (POS CANCELLED)
 */
export interface OrderProgress {
  step: number;
}

/** An order the customer has placed and is still tracking. */
export interface ActiveOrder {
  orderNumber: string;
  orderType: OrderType;
  tableCode?: string;
  estimatedMinutes: number;
}
