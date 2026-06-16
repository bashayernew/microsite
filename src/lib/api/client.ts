import type {
  Branch,
  ContactSection,
  CtaSection,
  DeliveryArea,
  DiningArea,
  GallerySection,
  HeroSection,
  HoursSection,
  Menu,
  NewOrder,
  OrderConfirmation,
  OrderProgress,
  Offer,
  SectionKey,
  SiteFooter,
  Tenant,
  Theme,
} from "./types";

/**
 * The single seam between the microsite and the POS public API.
 *
 * Reads (`getTenant`, `getMenu`, `getTables`, `getDeliveryAreas`, `getSettings`)
 * hit the gated public endpoints at `${API_BASE}/public/:slug/*` — they return
 * data ONLY for a tenant with an active storefront add-on AND a published live
 * snapshot, otherwise 404 (→ `notFound()`). Order creation + tracking are still
 * stubbed (Phase 5).
 *
 * Money stays a KWD 3dp string end-to-end — never JSON.parse into a number.
 */

// Browser calls use the public API origin (NEXT_PUBLIC_*, baked at build).
// Server-side rendering on the VPS prefers INTERNAL_POS_API_URL (e.g.
// http://127.0.0.1:3010/api) so SSR hits the API directly instead of looping
// back out through nginx/DNS. Falls back to the public URL, then local dev.
const API_BASE =
  (typeof window === "undefined" ? process.env.INTERNAL_POS_API_URL : undefined) ??
  process.env.NEXT_PUBLIC_POS_API_URL ??
  "http://localhost:3010/api";

/** The published cosmetic snapshot served by `/public/:slug/settings`. */
export interface StorefrontSettings {
  schemaVersion: number;
  identity: {
    name: string;
    nameAr: string;
    tagline: string;
    taglineAr: string;
    logoLight: string | null;
    logoDark: string | null;
    multiLanguage: boolean;
    showNameInHeader: boolean;
  };
  theme: Theme;
  sections: {
    hero: HeroSection;
    offers: { enabled: boolean; banners: Offer[] };
    menu: { enabled: boolean };
    hours: HoursSection;
    contact: ContactSection;
    gallery: GallerySection;
    cta: CtaSection;
  };
  sectionOrder: SectionKey[];
  toggles: {
    allowCart: boolean;
    allowOnlinePayment: boolean;
    orderTypes: Tenant["orderTypes"];
  };
  footer: SiteFooter;
}

/** Intrinsic store fields from `/public/:slug/tenant` (cosmetics come from settings). */
interface IntrinsicTenant {
  slug: string;
  businessName: string;
  businessNameAr: string;
  businessType: Tenant["businessType"];
  currency: string;
  logo: string | null;
  branches: Branch[];
  orderTypes: Tenant["orderTypes"];
}

/**
 * Fetch JSON from the public API. Returns `null` on 404 (unknown / non-entitled
 * / unpublished tenant — the caller maps that to `notFound()`); throws on other
 * failures so a server error surfaces rather than rendering a broken page.
 */
async function fetchJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Public API ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

/** The published cosmetic snapshot (theme/sections/toggles/identity). */
export async function getSettings(
  slug: string,
): Promise<StorefrontSettings | null> {
  return fetchJson<StorefrontSettings>(`/public/${slug}/settings`);
}

/**
 * Resolve a store. Merges intrinsic `/tenant` with the cosmetic `/settings`
 * snapshot into the single `Tenant` shape the rest of the app renders. Returns
 * `null` if either is missing (404).
 */
export async function getTenant(slug: string): Promise<Tenant | null> {
  const [intrinsic, settings] = await Promise.all([
    fetchJson<IntrinsicTenant>(`/public/${slug}/tenant`),
    getSettings(slug),
  ]);
  if (!intrinsic || !settings) return null;

  const { identity, sections, toggles } = settings;
  // Only render sections the merchant left enabled, in their chosen order.
  const sectionOrder = settings.sectionOrder.filter((k) => sections[k]?.enabled);
  const offers = sections.offers.enabled ? sections.offers.banners : [];
  // Storefront order types (merchant's toggle) win over the POS-wide default.
  const orderTypes =
    toggles.orderTypes.length > 0 ? toggles.orderTypes : intrinsic.orderTypes;

  return {
    slug: intrinsic.slug,
    // Name + logo come SOLELY from the Storefront settings page (the identity
    // section) — NOT the POS Business Information tab. The storefront editor is
    // the single source of truth for microsite branding; if a field is empty
    // here the storefront shows it empty rather than borrowing the POS profile.
    businessName: identity.name,
    businessNameAr: identity.nameAr,
    businessType: intrinsic.businessType,
    currency: intrinsic.currency,
    // Prefer the dark-on-light logo for the (light) header; storefront-only.
    logo: identity.logoDark ?? identity.logoLight ?? null,
    tagline: identity.tagline,
    taglineAr: identity.taglineAr,
    // First hero slide's image is the OG/share cover.
    coverImage: sections.hero.slides[0]?.image ?? "",
    // Not modelled by the storefront settings — safe display defaults.
    rating: 0,
    ratingCount: 0,
    priceLevel: 2,
    isOpenNow: true,
    branches: intrinsic.branches,
    orderTypes,
    offers,
    // Full theme (light + dark + dark-mode flag) drives the runtime CSS vars.
    theme: settings.theme,
    // Rich, merchant-configured home sections.
    hero: sections.hero,
    hours: sections.hours,
    contact: sections.contact,
    gallery: sections.gallery,
    cta: sections.cta,
    footer: settings.footer,
    sectionOrder,
    allowCart: toggles.allowCart,
    allowOnlinePayment: toggles.allowOnlinePayment,
    // Show the EN/AR header switch only when the merchant enabled it.
    multiLanguage: identity.multiLanguage,
    // Show the store name text in the header only when the merchant enabled it.
    showNameInHeader: identity.showNameInHeader,
  };
}

export async function getMenu(slug: string): Promise<Menu> {
  const menu = await fetchJson<Menu>(`/public/${slug}/menu`);
  return menu ?? { categories: [], products: [] };
}

// These two run client-side (cart checkout). A transient network/API failure
// must degrade to an empty list, not crash the drawer with an unhandled
// rejection — the UI shows "no areas" rather than blowing up.
export async function getTables(
  slug: string,
  branchId: string,
): Promise<DiningArea[]> {
  try {
    const areas = await fetchJson<DiningArea[]>(
      `/public/${slug}/tables?branchId=${encodeURIComponent(branchId)}`,
    );
    return areas ?? [];
  } catch {
    return [];
  }
}

export async function getDeliveryAreas(slug: string): Promise<DeliveryArea[]> {
  try {
    const zones = await fetchJson<DeliveryArea[]>(
      `/public/${slug}/delivery-areas`,
    );
    return zones ?? [];
  } catch {
    return [];
  }
}

// ── Orders (Phase 5 — still stubbed) ─────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ORDER_STARTS = new Map<string, number>();

export async function createOrder(
  slug: string,
  order: NewOrder,
): Promise<OrderConfirmation> {
  // Phase 5 wires this to a public, tenant-scoped, idempotent create-order
  // endpoint with server-side amount recompute. Stubbed for now.
  void slug;
  await delay(1100);
  const n = Math.floor(1000 + Math.random() * 9000);
  const branchCode = order.branchId.replace("br_", "").slice(0, 3).toUpperCase();
  const orderNumber = `ORD-${branchCode}-${n}`;
  ORDER_STARTS.set(orderNumber, Date.now());
  return {
    orderNumber,
    status: "NEW",
    estimatedMinutes:
      order.orderType === "DINE_IN" ? 20 : order.orderType === "DELIVERY" ? 40 : 25,
  };
}

export async function getOrderStatus(orderNumber: string): Promise<OrderProgress> {
  // Phase 5 wires this to the public order-status endpoint.
  const started = ORDER_STARTS.get(orderNumber) ?? Date.now();
  const elapsed = Date.now() - started;
  const step = elapsed < 4000 ? 0 : elapsed < 11000 ? 1 : elapsed < 18000 ? 2 : 3;
  return { step };
}
