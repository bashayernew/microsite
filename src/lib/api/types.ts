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
  isOpenNow: boolean;
  branches: Branch[];
  /** Which order types this store accepts. POS: Tenant.orderTypeConfig */
  orderTypes: OrderType[];
  /** Admin-managed hero offers / featured banners (rotating carousel). */
  offers?: Offer[];
  /** Hero carousel — multiple slides, each an image + content + one CTA. */
  hero: HeroSection;
  /** Opening hours & location section. */
  hours: HoursSection;
  /** Contact section (address / phone / WhatsApp / directions). */
  contact: ContactSection;
  /** "A glimpse inside" photo gallery. */
  gallery: GallerySection;
  /** Call-to-action banner. */
  cta: CtaSection;
  /** Rich footer (about / browse / visit-us / social). */
  footer: SiteFooter;
  /**
   * Brand colors the merchant picks in the POS microsite-settings page.
   * The site injects these into its CSS variables at runtime, so the whole
   * storefront re-themes from this one object. POS: Tenant.theme
   */
  theme: Theme;
  /**
   * Order of the page blocks on the storefront home, controlled by the merchant
   * in the dashboard. Unknown keys are ignored; missing keys simply don't render.
   * POS: Tenant.sectionOrder
   */
  sectionOrder: SectionKey[];
  /**
   * Customer-function toggles from the published storefront settings. Optional
   * for backward-compat with the mock; consumers treat `undefined` as enabled.
   * `allowCart:false` → browse-only / menu mode (no cart, no checkout).
   * POS: StorefrontSettings.live.toggles
   */
  allowCart?: boolean;
  allowOnlinePayment?: boolean;
  /**
   * Show the EN/AR language switch on the storefront header. Optional for
   * backward-compat with the mock; `undefined` is treated as enabled.
   * POS: StorefrontSettings.live.identity.multiLanguage
   */
  multiLanguage?: boolean;
  /**
   * Show the store name text next to the logo in the header. Optional for
   * backward-compat; `undefined` is treated as enabled.
   * POS: StorefrontSettings.live.identity.showNameInHeader
   */
  showNameInHeader?: boolean;
}

/** One color scheme — brand colors + body text. All values are CSS colors. */
export interface ColorScheme {
  /** Primary brand color. Maps to CSS --saffron. */
  primary: string;
  /** Darker shade for hovers/active. Maps to CSS --saffron-deep. */
  primaryDeep: string;
  /** Secondary accent. Maps to CSS --olive. */
  accent: string;
  /** Body text color. Maps to CSS --ink (applied in both light and dark). */
  text: string;
}

/** Brand theme — a light scheme, an optional dark scheme, and a dark-mode flag. */
export interface Theme {
  light: ColorScheme;
  /** When true the storefront offers a dark-mode toggle using `dark`. */
  darkMode: boolean;
  dark: ColorScheme;
}

/** A reorderable page block on the storefront home. */
export type SectionKey =
  | "hero"
  | "offers"
  | "menu"
  | "hours"
  | "contact"
  | "gallery"
  | "cta";

/* ── Customizable home sections (POS: StorefrontSettings.live.sections) ─────── */

/** One hero carousel slide: a background image + overlaid content + one CTA. */
export interface HeroSlide {
  id: string;
  image: string;
  headline: string;
  headlineAr: string;
  subtitle: string;
  subtitleAr: string;
  button: { enabled: boolean; label: string; labelAr: string; url: string };
}

export interface HeroSection {
  enabled: boolean;
  slides: HeroSlide[];
}

/** A bilingual label + value pair (one contact/info row). */
export interface LabeledValue {
  label: string;
  labelAr: string;
  value: string;
  valueAr: string;
}

export interface HoursDay {
  label: string;
  labelAr: string;
  value: string;
  valueAr: string;
}

export interface HoursSection {
  enabled: boolean;
  title: string;
  titleAr: string;
  note: string;
  noteAr: string;
  /** Optional map pin (strings; '' = no map). */
  latitude: string;
  longitude: string;
  days: HoursDay[];
}

export interface ContactSection {
  enabled: boolean;
  title: string;
  titleAr: string;
  address: LabeledValue;
  phone: { label: string; labelAr: string; value: string };
  whatsapp: { label: string; labelAr: string; value: string };
  note: LabeledValue;
  directions: { label: string; labelAr: string; url: string };
}

export interface GalleryItem {
  id: string;
  image: string;
  /** Optional external video link (YouTube/Vimeo/file). '' = a plain photo frame. */
  videoUrl: string;
  caption: string;
  captionAr: string;
}

export interface GallerySection {
  enabled: boolean;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  items: GalleryItem[];
}

export interface CtaButton {
  enabled: boolean;
  label: string;
  labelAr: string;
  url: string;
}

export interface CtaSection {
  enabled: boolean;
  heading: string;
  headingAr: string;
  subtitle: string;
  subtitleAr: string;
  primary: CtaButton;
  secondary: CtaButton;
}

export interface FooterLink {
  label: string;
  labelAr: string;
  url: string;
}

/** Fixed, always-last block (not part of `sectionOrder`). */
export interface SiteFooter {
  enabled: boolean;
  about: string;
  aboutAr: string;
  browseTitle: string;
  browseTitleAr: string;
  links: FooterLink[];
  visitTitle: string;
  visitTitleAr: string;
  address: string;
  addressAr: string;
  phones: string[];
  social: { phone: string; whatsapp: string; instagram: string };
  copyright: string;
  copyrightAr: string;
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
