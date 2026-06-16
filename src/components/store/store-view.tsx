"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category, Menu, Product } from "@/lib/api/types";
import { pick, makeT } from "@/lib/i18n";
import { localizeNumber } from "@/lib/format";
import { useStore } from "@/components/store-provider";
import { useTheme } from "@/components/store/theme-controller";
import { Money, Badge } from "@/components/ui/ui";
import {
  IconBag,
  IconClock,
  IconSearch,
  IconGlobe,
  IconLeaf,
  IconFlame,
  IconBack,
  IconMoon,
  IconSun,
} from "@/components/ui/icons";
import { ProductSheet } from "./product-sheet";
import { OrderDrawer } from "./order-drawer";
import { EntryGate } from "./entry-gate";
import { OrdersTracker } from "./orders-tracker";
import { OffersCarousel } from "./offers-carousel";
import { HeroSlider } from "./hero-slider";
import { GalleryBlock } from "./gallery-section";
import { HoursBlock, ContactBlock, CtaBlock } from "./info-sections";
import { SiteFooter } from "./site-footer";

/** Products shown per category on the home view before "See all". */
const SECTION_LIMIT = 4;

export function StoreView({
  menu,
  focusCategorySlug,
}: {
  menu: Menu;
  focusCategorySlug?: string;
}) {
  const store = useStore();
  const { locale, tenant, count, entryComplete, activeOrders, ordersOpen } = store;
  const { dark, toggleDark, darkAvailable } = useTheme();
  const t = makeT(locale);
  // Browse-only / menu mode: the merchant disabled the cart → no add buttons,
  // no cart drawer, no order-type entry gate.
  const canOrder = tenant.allowCart !== false;

  const [active, setActive] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");

  const sorted = useMemo(
    () => [...menu.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [menu.categories],
  );

  // Category tree (POS Category.parentId).
  const childrenOf = useMemo(() => {
    const m: Record<string, Category[]> = {};
    for (const c of sorted) if (c.parentId) (m[c.parentId] ??= []).push(c);
    return m;
  }, [sorted]);

  const topCats = useMemo(() => sorted.filter((c) => !c.parentId), [sorted]);

  useEffect(() => {
    if (!activeCat && topCats[0]) setActiveCat(topCats[0].id);
  }, [topCats, activeCat]);

  /** All products in a category, including those in its sub-categories. */
  function productsInTree(cat: Category): Product[] {
    const ids = new Set<string>([cat.id]);
    const stack = [...(childrenOf[cat.id] ?? [])];
    while (stack.length) {
      const ch = stack.pop() as Category;
      ids.add(ch.id);
      for (const g of childrenOf[ch.id] ?? []) stack.push(g);
    }
    return menu.products.filter((p) => ids.has(p.categoryId));
  }

  const focusCategory = focusCategorySlug
    ? sorted.find((c) => c.slug === focusCategorySlug) ?? null
    : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return menu.products.filter((p) =>
      [p.name, p.nameAr, p.description, p.descriptionAr]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query, menu.products]);

  function onAdd(p: Product) {
    if (p.hasVariants || p.modifierGroups.length > 0) {
      setActive(p);
    } else {
      store.addLine({
        productId: p.id,
        name: p.name,
        nameAr: p.nameAr,
        image: p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? null,
        unitBase: p.basePrice,
        modifiers: [],
        quantity: 1,
      });
    }
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0">
      <Header
        name={pick(tenant.businessName, tenant.businessNameAr, locale)}
        showName={tenant.showNameInHeader !== false}
        logo={tenant.logo}
        count={count}
        subtotal={store.subtotal}
        locale={locale}
        canOrder={canOrder}
        ordersCount={activeOrders.length}
        dark={dark}
        darkAvailable={darkAvailable}
        showLocaleSwitch={tenant.multiLanguage !== false}
        onToggleDark={toggleDark}
        onOpenOrders={() => store.setOrdersOpen(true)}
        onToggleLocale={store.toggleLocale}
        onOpenCart={() => setDrawerOpen(true)}
      />

      {focusCategory ? (
        /* ── Single-category page (with sub-categories) ─────────────────── */
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Link
            href={`/${tenant.slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-saffron"
          >
            <IconBack width={18} height={18} className="rtl:rotate-180" />
            {pick("All categories", "كل الأقسام", locale)}
          </Link>
          <h1 className="mb-5 font-display text-2xl text-ink sm:text-3xl">
            {pick(focusCategory.name, focusCategory.nameAr, locale)}
            <span className="ms-2 text-base font-medium text-ink-faint">
              {localizeNumber(productsInTree(focusCategory).length, locale)}
            </span>
          </h1>

          {(() => {
            const children = childrenOf[focusCategory.id] ?? [];
            const direct = menu.products.filter((p) => p.categoryId === focusCategory.id);
            if (children.length === 0) {
              return (
                <Grid
                  products={productsInTree(focusCategory)}
                  locale={locale}
                  onAdd={onAdd}
                  onOpen={setActive}
                  t={t}
                />
              );
            }
            return (
              <div className="space-y-2">
                {direct.length > 0 && (
                  <Grid products={direct} locale={locale} onAdd={onAdd} onOpen={setActive} t={t} />
                )}
                {children.map((child) => {
                  const items = menu.products.filter((p) => p.categoryId === child.id);
                  if (!items.length) return null;
                  return (
                    <section key={child.id} className="py-3">
                      <h2 className="mb-3 font-display text-lg text-ink sm:text-xl">
                        {pick(child.name, child.nameAr, locale)}
                      </h2>
                      <Grid products={items} locale={locale} onAdd={onAdd} onOpen={setActive} t={t} />
                    </section>
                  );
                })}
              </div>
            );
          })()}
        </main>
      ) : (
        /* ── Home ───────────────────────────────────────────────────────── */
        (() => {
          // Page blocks rendered in the merchant-controlled order (tenant.sectionOrder).
          const heroBlock = (
            <HeroSlider
              key="hero"
              slides={tenant.hero.slides}
              locale={locale}
              businessName={tenant.businessName}
              businessNameAr={tenant.businessNameAr}
              tagline={tenant.tagline}
              taglineAr={tenant.taglineAr}
            />
          );
          const offersBlock =
            tenant.offers && tenant.offers.length > 0 ? (
              <div key="offers" className="mx-auto max-w-6xl px-4 pt-4">
                <OffersCarousel offers={tenant.offers} locale={locale} />
              </div>
            ) : null;
          const hoursBlock = <HoursBlock key="hours" data={tenant.hours} locale={locale} />;
          const contactBlock = (
            <ContactBlock key="contact" data={tenant.contact} locale={locale} />
          );
          const galleryBlock = (
            <GalleryBlock key="gallery" data={tenant.gallery} locale={locale} />
          );
          const ctaBlock = <CtaBlock key="cta" data={tenant.cta} locale={locale} />;
          const menuBlock = (
            <div key="menu">
          <div className="sticky top-[61px] z-30 border-b border-line bg-paper/85 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4">
              <div className="flex items-center gap-3 py-3">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 grid place-items-center text-ink-faint ltr:left-4 rtl:right-4">
                    <IconSearch width={18} height={18} />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("search_placeholder")}
                    className="w-full rounded-lg border border-line bg-paper-raised py-2.5 text-sm outline-none transition placeholder:text-ink-faint focus:border-saffron focus:ring-2 focus:ring-saffron/15 ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4"
                  />
                </div>
              </div>
              {!filtered && (
                <CategoryRail
                  categories={topCats}
                  active={activeCat}
                  locale={locale}
                  onPick={(id) => {
                    setActiveCat(id);
                    document
                      .getElementById(`cat-${id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              )}
            </div>
          </div>

          <main className="mx-auto max-w-6xl px-4 py-6">
            {filtered ? (
              <Section
                id="search"
                title={`${localizeNumber(filtered.length, locale)} ${t("items")}`}
              >
                <Grid products={filtered} locale={locale} onAdd={onAdd} onOpen={setActive} t={t} />
              </Section>
            ) : (
              topCats.map((cat) => {
                const items = productsInTree(cat);
                if (!items.length) return null;
                const shown = items.slice(0, SECTION_LIMIT);
                const more = items.length - shown.length;
                const href = `/${tenant.slug}/c/${cat.slug}`;
                return (
                  <Section
                    key={cat.id}
                    id={`cat-${cat.id}`}
                    title={pick(cat.name, cat.nameAr, locale)}
                    onVisible={() => setActiveCat(cat.id)}
                    action={
                      more > 0 ? (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-saffron transition hover:underline"
                        >
                          {pick("See all", "عرض الكل", locale)} ({localizeNumber(items.length, locale)})
                          <span aria-hidden className="rtl:rotate-180">
                            →
                          </span>
                        </Link>
                      ) : undefined
                    }
                  >
                    <Grid products={shown} locale={locale} onAdd={onAdd} onOpen={setActive} t={t} />
                    {more > 0 && (
                      <Link
                        href={href}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-paper-raised py-3 text-sm font-semibold text-saffron transition hover:border-saffron sm:hidden"
                      >
                        {pick("See all", "عرض الكل", locale)}{" "}
                        {pick(cat.name, cat.nameAr, locale)} ({localizeNumber(items.length, locale)})
                      </Link>
                    )}
                  </Section>
                );
              })
            )}
          </main>
            </div>
          );
          return (
            <>
              {tenant.sectionOrder.map((key) => {
                if (key === "hero") return heroBlock;
                if (key === "offers") return offersBlock;
                if (key === "menu") return menuBlock;
                if (key === "hours") return hoursBlock;
                if (key === "contact") return contactBlock;
                if (key === "gallery") return galleryBlock;
                if (key === "cta") return ctaBlock;
                return null;
              })}
            </>
          );
        })()
      )}

      {tenant.footer.enabled ? (
        <SiteFooter
          data={tenant.footer}
          locale={locale}
          businessName={tenant.businessName}
          businessNameAr={tenant.businessNameAr}
        />
      ) : (
        <footer className="border-t border-line py-8 text-center">
          <p className="text-xs text-ink-faint">
            {t("powered_by")} · {pick(tenant.businessName, tenant.businessNameAr, locale)}
          </p>
        </footer>
      )}

      {/* Mobile order bar */}
      {canOrder && count > 0 && !drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-xl bg-saffron px-5 py-3.5 text-paper shadow-lg animate-float-up sm:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-xs">
              {localizeNumber(count, locale)}
            </span>
            {t("your_order")}
          </span>
          <Money amount={store.subtotal} locale={locale} className="text-sm font-semibold" />
        </button>
      )}

      <ProductSheet product={active} onClose={() => setActive(null)} />
      <OrderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <OrdersTracker open={ordersOpen} onClose={() => store.setOrdersOpen(false)} />

      {/* Opening "How would you like it?" gate, shown before the menu.
          Skipped entirely in browse-only mode (no ordering). */}
      {canOrder && !focusCategory && !entryComplete && <EntryGate />}
    </div>
  );
}

/* ── Header ──────────────────────────────────────────────────────────────── */

function Header({
  name,
  showName,
  logo,
  count,
  subtotal,
  locale,
  canOrder,
  ordersCount,
  dark,
  darkAvailable,
  showLocaleSwitch,
  onToggleDark,
  onOpenOrders,
  onToggleLocale,
  onOpenCart,
}: {
  name: string;
  showName: boolean;
  logo: string | null;
  count: number;
  subtotal: string;
  locale: "en" | "ar";
  canOrder: boolean;
  ordersCount: number;
  dark: boolean;
  darkAvailable: boolean;
  showLocaleSwitch: boolean;
  onToggleDark: () => void;
  onOpenOrders: () => void;
  onToggleLocale: () => void;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={name}
              className="h-9 w-9 rounded-xl object-contain"
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-saffron font-display text-base text-paper">
              {name.charAt(0)}
            </span>
          )}
          {showName && (
            <span className="font-display text-lg text-ink">{name}</span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          {ordersCount > 0 && (
            <button
              onClick={onOpenOrders}
              className="inline-flex items-center gap-1.5 rounded-lg border border-saffron bg-saffron-tint px-3 py-2 text-xs font-bold text-saffron transition hover:bg-saffron hover:text-paper"
            >
              <IconClock width={15} height={15} />
              {pick("Orders", "الطلبات", locale)} · {localizeNumber(ordersCount, locale)}
            </button>
          )}
          {darkAvailable && (
            <button
              onClick={onToggleDark}
              aria-label={dark ? "Light mode" : "Dark mode"}
              className="inline-flex items-center justify-center rounded-lg border border-line bg-paper-raised p-2 text-ink-soft transition hover:border-saffron hover:text-saffron"
            >
              {dark ? <IconSun width={16} height={16} /> : <IconMoon width={16} height={16} />}
            </button>
          )}
          {showLocaleSwitch && (
            <button
              onClick={onToggleLocale}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper-raised px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-saffron hover:text-saffron"
            >
              <IconGlobe width={16} height={16} />
              {locale === "en" ? "العربية" : "EN"}
            </button>
          )}
          {canOrder && (
            <button
              onClick={onOpenCart}
              aria-label="Cart"
              className="relative inline-flex items-center gap-2 rounded-lg bg-saffron px-3.5 py-2 text-sm font-semibold text-paper shadow-sm transition hover:bg-saffron-deep"
            >
              <IconBag width={18} height={18} />
              <Money amount={subtotal} locale={locale} className="hidden sm:inline" showCurrency={false} />
              {count > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/25 px-1 text-[11px] font-bold">
                  {localizeNumber(count, locale)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Category rail ───────────────────────────────────────────────────────── */

function CategoryRail({
  categories,
  active,
  locale,
  onPick,
}: {
  categories: Category[];
  active: string;
  locale: "en" | "ar";
  onPick: (id: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
      {categories.map((c) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              on
                ? "bg-saffron text-paper shadow-sm"
                : "border border-line bg-paper-raised text-ink-soft hover:border-saffron hover:text-saffron"
            }`}
          >
            {pick(c.name, c.nameAr, locale)}
          </button>
        );
      })}
    </div>
  );
}

/* ── Sections + Grid ─────────────────────────────────────────────────────── */

function Section({
  id,
  title,
  children,
  onVisible,
  action,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  onVisible?: () => void;
  action?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!onVisible || !ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) onVisible();
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);

  return (
    <section id={id} ref={ref} className="scroll-mt-36 py-4">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl text-ink sm:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Grid({
  products,
  locale,
  onAdd,
  onOpen,
  t,
}: {
  products: Product[];
  locale: "en" | "ar";
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
  t: ReturnType<typeof makeT>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} locale={locale} onAdd={onAdd} onOpen={onOpen} t={t} />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  locale,
  onAdd,
  onOpen,
  t,
}: {
  product: Product;
  locale: "en" | "ar";
  onAdd: (p: Product) => void;
  onOpen: (p: Product) => void;
  t: ReturnType<typeof makeT>;
}) {
  const { tenant } = useStore();
  const canOrder = tenant.allowCart !== false;
  const img = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? null;
  const configurable = product.hasVariants || product.modifierGroups.length > 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-sm transition hover:shadow-md">
      <button onClick={() => onOpen(product)} className="relative block aspect-[5/4] w-full overflow-hidden">
        {img && (
          <Image
            src={img}
            alt={pick(product.name, product.nameAr, locale)}
            fill
            sizes="(max-width: 1024px) 50vw, 280px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute top-3 flex flex-wrap gap-1.5 ltr:left-3 rtl:right-3">
          {product.popular && <Badge tone="saffron">{t("popular")}</Badge>}
          {product.vegetarian && (
            <span className="grid h-6 w-6 place-items-center rounded-full bg-paper-raised text-olive shadow-sm" title={t("vegetarian")}>
              <IconLeaf width={13} height={13} />
            </span>
          )}
          {product.spicy && (
            <span className="grid h-6 w-6 place-items-center rounded-full bg-paper-raised text-[#e1483a] shadow-sm" title={t("spicy")}>
              <IconFlame width={13} height={13} />
            </span>
          )}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <button onClick={() => onOpen(product)} className="text-start">
          <h3 className="text-[15px] font-semibold text-ink">
            {pick(product.name, product.nameAr, locale)}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-soft">
            {pick(product.description, product.descriptionAr, locale)}
          </p>
        </button>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="font-display text-base text-ink">
            {configurable && (
              <span className="text-xs font-medium text-ink-faint">{t("from")} </span>
            )}
            <Money amount={product.basePrice} locale={locale} showCurrency={false} />
            <span className="text-xs font-medium text-ink-faint"> {locale === "ar" ? "د.ك" : "KWD"}</span>
          </p>
          {canOrder && (
            <button
              onClick={() => onAdd(product)}
              aria-label={t("add")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-saffron-tint px-3 py-2 text-sm font-semibold text-saffron transition hover:bg-saffron hover:text-paper"
            >
              <IconBag width={16} height={16} />
              {t("add")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
