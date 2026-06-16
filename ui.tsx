"use client";

/* eslint-disable @next/next/no-img-element */
/**
 * Nuwwar storefront template — the shared, per-tenant-themed storefront.
 *
 * Ported from the Nuwwar reference site (app.jsx + sections.jsx) into the
 * Recety microsite: scroll-condensing Nav, hero slider, tabbed Menu, Gallery
 * with lightbox, Hours/Contact, CTA band and Footer — all styled by the
 * `.nuwwar` design system in nuwwar.css. Content comes from the tenant +
 * live POS catalog; colors come from the tenant theme; ORDERING reuses the
 * existing, proven cart/checkout (store-provider + ProductSheet/OrderDrawer),
 * so add-to-cart and checkout place real orders.
 */

import { useEffect, useMemo, useState } from "react";
import type { Category, Menu, Product } from "@/lib/api/types";
import { pick, makeT } from "@/lib/i18n";
import { localizeNumber } from "@/lib/format";
import { useStore } from "@/components/store-provider";
import { useTheme } from "@/components/store/theme-controller";
import { Money } from "@/components/ui/ui";
import { OrdersTracker } from "../orders-tracker";
import { NuwwarProductModal, NuwwarCartDrawer, NuwwarCheckoutModal } from "./nuwwar-order";
import { Reveal } from "./reveal";
import {
  IcoArrow,
  IcoBag,
  IcoCalendar,
  IcoCar,
  IcoCart,
  IcoClose,
  IcoInstagram,
  IcoMenu,
  IcoMoon,
  IcoPhone,
  IcoPin,
  IcoPlus,
  IcoSun,
  IcoWhatsapp,
} from "./icons";

const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export function NuwwarStoreView({
  menu,
  page = "home",
}: {
  menu: Menu;
  focusCategorySlug?: string;
  /** "contact" renders a dedicated contact page (hours + contact + CTA only). */
  page?: "home" | "contact";
}) {
  const store = useStore();
  const { locale, tenant, count, ordersOpen, activeOrders } = store;
  const { dark, toggleDark, darkAvailable } = useTheme();
  const t = makeT(locale);
  const canOrder = tenant.allowCart !== false;

  const [active, setActive] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Bridge the storefront dark toggle to the Nuwwar `[data-theme]` styling.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const sorted = useMemo(
    () => [...menu.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [menu.categories],
  );
  const childrenOf = useMemo(() => {
    const m: Record<string, Category[]> = {};
    for (const c of sorted) if (c.parentId) (m[c.parentId] ??= []).push(c);
    return m;
  }, [sorted]);
  const topCats = useMemo(() => sorted.filter((c) => !c.parentId), [sorted]);

  const productsInTree = useMemo(() => {
    return (cat: Category): Product[] => {
      const ids = new Set<string>([cat.id]);
      const stack = [...(childrenOf[cat.id] ?? [])];
      while (stack.length) {
        const ch = stack.pop() as Category;
        ids.add(ch.id);
        for (const g of childrenOf[ch.id] ?? []) stack.push(g);
      }
      return menu.products.filter((p) => ids.has(p.categoryId));
    };
  }, [childrenOf, menu.products]);

  function onPick(p: Product) {
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
      setDrawerOpen(true);
    }
  }

  const name = pick(tenant.businessName, tenant.businessNameAr, locale);

  return (
    <div className="nuwwar">
      <div className="app" id="top">
        <Nav
          name={name}
          logo={tenant.logo}
          locale={locale}
          slug={tenant.slug}
          page={page}
          dark={dark}
          darkAvailable={darkAvailable}
          showLocaleSwitch={tenant.multiLanguage !== false}
          canOrder={canOrder}
          cartCount={count}
          ordersCount={activeOrders.length}
          onToggleLocale={store.toggleLocale}
          onToggleDark={toggleDark}
          onCart={() => setDrawerOpen(true)}
          onOpenOrders={() => store.setOrdersOpen(true)}
        />

        {page === "contact" ? (
          <main className="contact-main">
            {tenant.hours?.enabled && <HoursContact />}
            {tenant.cta?.enabled && (
              <CtaBand onOrder={() => { window.location.href = `/${tenant.slug}#menu`; }} />
            )}
          </main>
        ) : (
          <main>
            {tenant.sectionOrder.map((key) => {
              if (key === "hero" && tenant.hero?.slides?.length)
                return <HeroSlider key="hero" />;
              if (key === "menu")
                return (
                  <MenuSection
                    key="menu"
                    topCats={topCats}
                    productsInTree={productsInTree}
                    locale={locale}
                    canOrder={canOrder}
                    onPick={onPick}
                  />
                );
              if (key === "gallery" && tenant.gallery?.enabled && tenant.gallery.items.length)
                return <GallerySection key="gallery" />;
              if (key === "hours" && tenant.hours?.enabled)
                return <HoursContact key="hours" />;
              if (key === "cta" && tenant.cta?.enabled)
                return <CtaBand key="cta" onOrder={() => scrollToId("menu")} />;
              return null;
            })}
          </main>
        )}

        <Footer name={name} locale={locale} />

        {/* Real ordering — Nuwwar-styled popups wired to the store + createOrder. */}
        <NuwwarProductModal product={active} onClose={() => setActive(null)} />
        <NuwwarCartDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onCheckout={() => {
            setDrawerOpen(false);
            setCheckoutOpen(true);
          }}
        />
        <NuwwarCheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        <OrdersTracker open={ordersOpen} onClose={() => store.setOrdersOpen(false)} />

        {/* Mobile sticky order bar */}
        {canOrder && count > 0 && !drawerOpen && (
          <button className="mobile-order-bar" onClick={() => setDrawerOpen(true)}>
            <span className="mob-count num">{localizeNumber(count, locale)}</span>
            <span>{t("your_order")}</span>
            <Money amount={store.subtotal} locale={locale} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Nav ─────────────────────────────────────────────────────────────────── */
function Nav({
  name,
  logo,
  locale,
  slug,
  page,
  dark,
  darkAvailable,
  showLocaleSwitch,
  canOrder,
  cartCount,
  ordersCount,
  onToggleLocale,
  onToggleDark,
  onCart,
  onOpenOrders,
}: {
  name: string;
  logo: string | null;
  locale: "en" | "ar";
  slug: string;
  page: "home" | "contact";
  dark: boolean;
  darkAvailable: boolean;
  showLocaleSwitch: boolean;
  canOrder: boolean;
  cartCount: number;
  ordersCount: number;
  onToggleLocale: () => void;
  onToggleDark: () => void;
  onCart: () => void;
  onOpenOrders: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  type NavLink = { label: string; scroll?: string; href?: string };
  const links: NavLink[] =
    page === "contact"
      ? [
          { label: pick("Menu", "المنيو", locale), href: `/${slug}#menu` },
          { label: pick("Gallery", "المعرض", locale), href: `/${slug}#gallery` },
          { label: pick("Contact", "تواصل", locale), scroll: "top" },
        ]
      : [
          { label: pick("Menu", "المنيو", locale), scroll: "menu" },
          { label: pick("Gallery", "المعرض", locale), scroll: "gallery" },
          { label: pick("Contact", "تواصل", locale), href: `/${slug}/contact` },
        ];
  const initial = name?.charAt(0) || (locale === "ar" ? "نـ" : "N");
  const brandHref = page === "contact" ? `/${slug}` : "#top";

  /** Anchor props: in-page links smooth-scroll; cross-page links navigate. */
  const linkProps = (l: NavLink, after?: () => void) =>
    l.scroll
      ? {
          href: `#${l.scroll}`,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            after?.();
            scrollToId(l.scroll as string);
          },
        }
      : { href: l.href as string, onClick: () => after?.() };

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a
          className="brand"
          href={brandHref}
          onClick={
            page === "contact"
              ? undefined
              : (e) => {
                  e.preventDefault();
                  scrollToId("top");
                }
          }
        >
          {logo ? (
            <img src={logo} alt={name} className="brand-logo" />
          ) : (
            <span className="brand-mark">{initial}</span>
          )}
          <span className="brand-name">{name}</span>
        </a>
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.label}>
              <a className="nav-link" {...linkProps(l)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          {showLocaleSwitch && (
            <button className="lang-btn" onClick={onToggleLocale} aria-label="switch language">
              {locale === "ar" ? "EN" : "ع"}
            </button>
          )}
          {darkAvailable && (
            <button className="icon-btn" onClick={onToggleDark} aria-label="toggle theme">
              {dark ? <IcoSun /> : <IcoMoon />}
            </button>
          )}
          {ordersCount > 0 && (
            <button className="icon-btn" onClick={onOpenOrders} aria-label="orders">
              <IcoBag />
            </button>
          )}
          {canOrder && (
            <button className="icon-btn cart-btn" onClick={onCart} aria-label="cart">
              <IcoCart />
              {cartCount > 0 && <span className="cart-badge num">{cartCount}</span>}
            </button>
          )}
          {canOrder && (
            <button className="btn btn-primary btn-sm nav-cta" onClick={onCart}>
              <IcoCalendar /> {pick("Order now", "اطلب الآن", locale)}
            </button>
          )}
          <button className="icon-btn burger" onClick={() => setOpen((o) => !o)} aria-label="menu">
            {open ? <IcoClose /> : <IcoMenu />}
          </button>
        </div>
      </div>
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {links.map((l) => (
          <a key={l.label} {...linkProps(l, () => setOpen(false))}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ── Hero slider ───────────────────────────────────────────────────────────── */
function HeroSlider() {
  const { tenant, locale } = useStore();
  const slides = tenant.hero.slides;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const ar = locale === "ar";
  const go = (d: number) => setIdx((i) => (i + d + n) % n);

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), 5000);
    return () => clearInterval(id);
  }, [paused, n]);
  useEffect(() => {
    if (idx >= n && n > 0) setIdx(0);
  }, [idx, n]);

  if (!n) return null;
  const prevIco = ar ? <IcoArrow /> : <IcoArrow style={{ transform: "scaleX(-1)" }} />;
  const nextIco = ar ? <IcoArrow style={{ transform: "scaleX(-1)" }} /> : <IcoArrow />;

  return (
    <section
      className="hero-slider"
      id="hero"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="slider-track"
        style={{ transform: `translateX(${ar ? "" : "-"}${idx * 100}%)` }}
      >
        {slides.map((s, i) => {
          const headline = pick(s.headline, s.headlineAr, locale);
          const subtitle = pick(s.subtitle, s.subtitleAr, locale);
          const btnLabel = pick(s.button.label, s.button.labelAr, locale);
          return (
            <div className="slide" key={s.id} aria-hidden={i !== idx}>
              {s.image ? (
                <img className="slide-img" src={s.image} alt={headline || ""} />
              ) : (
                <div className="slide-img" style={{ background: "var(--primary-deep)" }} />
              )}
              <div className="slide-scrim" />
              <div className="section-wrap slide-inner">
                <div className={`slide-copy ${i === idx ? "in" : ""}`}>
                  <span className="eyebrow on-dark">
                    {pick(tenant.tagline, tenant.taglineAr, locale)}
                  </span>
                  {headline && <h2 className="display">{headline}</h2>}
                  {subtitle && <p>{subtitle}</p>}
                  {s.button.enabled && btnLabel && (
                    <a
                      className="btn btn-primary btn-lg"
                      href={s.button.url || "#menu"}
                      onClick={(e) => {
                        if (!s.button.url || s.button.url.startsWith("#")) {
                          e.preventDefault();
                          scrollToId((s.button.url || "#menu").replace("#", ""));
                        }
                      }}
                    >
                      {btnLabel} {nextIco}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <>
          <button className="slider-arrow prev" onClick={() => go(-1)} aria-label="previous">
            {prevIco}
          </button>
          <button className="slider-arrow next" onClick={() => go(1)} aria-label="next">
            {nextIco}
          </button>
          <div className="slider-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`s-dot ${i === idx ? "active" : ""}`}
                onClick={() => setIdx(i)}
                aria-label={`slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ── Section head ──────────────────────────────────────────────────────────── */
function SectionHead({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="section-head" style={{ gap: 20, margin: "0 0 20px" }}>
      <Reveal>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="display">{title}</h2>
        {sub && <p className="sub">{sub}</p>}
      </Reveal>
    </div>
  );
}

/* ── Menu ────────────────────────────────────────────────────────────────── */
function MenuSection({
  topCats,
  productsInTree,
  locale,
  canOrder,
  onPick,
}: {
  topCats: Category[];
  productsInTree: (c: Category) => Product[];
  locale: "en" | "ar";
  canOrder: boolean;
  onPick: (p: Product) => void;
}) {
  const ar = locale === "ar";
  const [active, setActive] = useState(topCats[0]?.id ?? "");
  const [showAll, setShowAll] = useState(false);
  const [zoom, setZoom] = useState<{ src: string; name: string; desc: string } | null>(null);
  const VISIBLE = 10;

  useEffect(() => {
    if (!active && topCats[0]) setActive(topCats[0].id);
  }, [topCats, active]);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const activeCat = topCats.find((c) => c.id === active) ?? topCats[0];
  const items = activeCat ? productsInTree(activeCat) : [];
  const shown = showAll ? items : items.slice(0, VISIBLE);
  const hasMore = items.length > VISIBLE;

  if (!topCats.length) return null;

  return (
    <section className="section" id="menu" style={{ padding: "40px 0" }}>
      <div className="section-wrap">
        <SectionHead
          eyebrow={pick("Our menu", "قائمتنا", locale)}
          title={pick("Made fresh, every plate", "طازج في كل طبق", locale)}
        />
        <Reveal>
          <div className="menu-tabs" role="tablist" style={{ margin: "0 0 25px" }}>
            {topCats.map((c) => (
              <button
                key={c.id}
                className={`menu-tab ${active === c.id ? "active" : ""}`}
                onClick={() => {
                  setActive(c.id);
                  setShowAll(false);
                }}
                role="tab"
                aria-selected={active === c.id}
              >
                {pick(c.name, c.nameAr, locale)}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="menu-grid" key={active}>
          {shown.map((p, i) => {
            const nm = pick(p.name, p.nameAr, locale);
            const desc = pick(p.description, p.descriptionAr, locale);
            const img = p.images.find((x) => x.isPrimary)?.url ?? p.images[0]?.url ?? "";
            return (
              <Reveal key={p.id} className="menu-item" delay={i * 40}>
                {img && (
                  <img
                    className="mi-thumb"
                    src={img}
                    alt={nm}
                    onClick={() => setZoom({ src: img, name: nm, desc })}
                  />
                )}
                <div className="mi-text">
                  <div className="mi-top">
                    <div className="mi-name">
                      {nm}
                      {p.popular && <span className="tag pop">{ar ? "الأكثر طلباً" : "popular"}</span>}
                      {p.vegetarian && <span className="tag veg">{ar ? "نباتي" : "veg"}</span>}
                      {p.spicy && <span className="tag spicy">{ar ? "حار" : "spicy"}</span>}
                    </div>
                    <div className="mi-price num">
                      <Money amount={p.basePrice} locale={locale} />
                    </div>
                  </div>
                  {desc && <div className="mi-desc">{desc}</div>}
                </div>
                {canOrder && (
                  <button
                    className="mi-add"
                    onClick={() => onPick(p)}
                    aria-label={ar ? "أضف للسلة" : "add to cart"}
                  >
                    <IcoPlus />
                  </button>
                )}
              </Reveal>
            );
          })}
        </div>
        {hasMore && (
          <div className="menu-more-wrap">
            <button className="menu-more" onClick={() => setShowAll((s) => !s)}>
              {showAll
                ? ar
                  ? "عرض أقل"
                  : "Show less"
                : ar
                  ? "المزيد من المنتجات"
                  : "More products"}
              <IcoArrow style={{ transform: showAll ? "rotate(-90deg)" : "rotate(90deg)" }} />
            </button>
          </div>
        )}
      </div>
      {zoom && (
        <div className="img-lightbox" onClick={() => setZoom(null)}>
          <button className="lb-close" aria-label="close" onClick={() => setZoom(null)}>
            ×
          </button>
          <figure className="lb-figure" onClick={(e) => e.stopPropagation()}>
            <img src={zoom.src} alt={zoom.name} />
            <figcaption>
              <span className="lb-name">{zoom.name}</span>
              <span className="lb-desc">{zoom.desc}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

/* ── Gallery ───────────────────────────────────────────────────────────────── */
function GallerySection() {
  const { tenant, locale } = useStore();
  const g = tenant.gallery;
  const [lb, setLb] = useState<{ src: string; cap: string; video?: boolean } | null>(null);
  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLb(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lb]);
  const sizeCls = ["g-tall", "g-feat", "", "", "", "", "g-wide", "", ""];

  return (
    <section className="section" id="gallery" style={{ padding: "20px 0 40px" }}>
      <div className="section-wrap">
        <SectionHead
          eyebrow={pick("Gallery", "المعرض", locale)}
          title={pick(g.title, g.titleAr, locale) || pick("A glimpse inside", "لمحة من الداخل", locale)}
          sub={pick(g.subtitle, g.subtitleAr, locale)}
        />
        <Reveal>
          <div className="gallery-grid">
            {g.items.map((it, i) => {
              const cap = pick(it.caption, it.captionAr, locale);
              const cls = sizeCls[i % sizeCls.length];
              if (it.videoUrl) {
                return (
                  <figure
                    key={it.id}
                    className={`g-video ${cls}`.trim()}
                    onClick={() => setLb({ src: it.videoUrl, cap, video: true })}
                  >
                    <video src={it.videoUrl} poster={it.image || undefined} autoPlay muted loop playsInline preload="metadata" />
                    <figcaption>
                      <span className="g-live-dot" />
                      {cap}
                    </figcaption>
                    <span className="g-zoom">
                      <IcoPlus />
                    </span>
                  </figure>
                );
              }
              return (
                <img
                  key={it.id}
                  className={cls}
                  src={it.image}
                  alt={cap}
                  onClick={() => setLb({ src: it.image, cap })}
                />
              );
            })}
          </div>
        </Reveal>
      </div>
      {lb && (
        <div className="img-lightbox" onClick={() => setLb(null)}>
          <button className="lb-close" aria-label="close" onClick={() => setLb(null)}>
            ×
          </button>
          <figure className={`lb-figure ${lb.video ? "video" : ""}`.trim()} onClick={(e) => e.stopPropagation()}>
            {lb.video ? (
              <video src={lb.src} controls autoPlay loop playsInline />
            ) : (
              <img src={lb.src} alt={lb.cap} />
            )}
            {lb.cap && (
              <figcaption>
                <span className="lb-name">{lb.cap}</span>
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}

/* ── Hours + Contact ───────────────────────────────────────────────────────── */
function HoursContact() {
  const { tenant, locale } = useStore();
  const h = tenant.hours;
  const c = tenant.contact;
  const jsDay = new Date().getDay();
  const todayIdx = (jsDay + 1) % 7;

  return (
    <section className="section tight" id="hours" style={{ padding: "20px 0 40px" }}>
      <div className="section-wrap">
        <SectionHead
          eyebrow={pick("Visit us", "زورونا", locale)}
          title={pick(h.title, h.titleAr, locale) || pick("Hours & location", "المواعيد والموقع", locale)}
          sub={pick(h.note, h.noteAr, locale)}
        />
        <div className="split" style={{ gridTemplateColumns: "1fr 1.15fr", alignItems: "stretch" }}>
          <Reveal className="card">
            {h.days.map((day, i) => (
              <div key={i} className={`hours-row ${i === todayIdx ? "today" : ""}`}>
                <span className="day">{pick(day.label, day.labelAr, locale)}</span>
                <span className="time num">{pick(day.value, day.valueAr, locale)}</span>
              </div>
            ))}
          </Reveal>
          {c?.enabled && (
            <Reveal delay={80}>
              <div className="card contact-card">
                <div className="contact-strip">
                  <ContactLine ico={<IcoPin />} k={pick(c.address.label, c.address.labelAr, locale)} v={pick(c.address.value, c.address.valueAr, locale)} />
                  {c.phone.value && (
                    <ContactLine ico={<IcoPhone />} k={pick(c.phone.label, c.phone.labelAr, locale)} v={c.phone.value} href={`tel:${c.phone.value.replace(/[^\d+]/g, "")}`} />
                  )}
                  {c.whatsapp.value && (
                    <ContactLine ico={<IcoWhatsapp />} k={pick(c.whatsapp.label, c.whatsapp.labelAr, locale)} v={c.whatsapp.value} href={`https://wa.me/${c.whatsapp.value.replace(/[^\d]/g, "")}`} />
                  )}
                  {pick(c.note.value, c.note.valueAr, locale) && (
                    <ContactLine ico={<IcoCar />} k={pick(c.note.label, c.note.labelAr, locale)} v={pick(c.note.value, c.note.valueAr, locale)} />
                  )}
                </div>
                {c.directions.url && (
                  <a className="btn btn-primary directions-btn" href={c.directions.url} target="_blank" rel="noopener noreferrer">
                    <IcoPin /> {pick(c.directions.label, c.directions.labelAr, locale) || pick("Get directions", "الاتجاهات", locale)}
                  </a>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactLine({ ico, k, v, href }: { ico: React.ReactNode; k: string; v: string; href?: string }) {
  const inner = (
    <div className="info-line">
      <span className="ico">{ico}</span>
      <div>
        <div className="k">{k}</div>
        <div className="v">{v}</div>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

/* ── CTA band ──────────────────────────────────────────────────────────────── */
function CtaBand({ onOrder }: { onOrder: () => void }) {
  const { tenant, locale } = useStore();
  const c = tenant.cta;
  return (
    <section className="section tight" id="contact" style={{ padding: "40px 0" }}>
      <div className="section-wrap">
        <Reveal>
          <div className="cta-band">
            <div>
              <h2>{pick(c.heading, c.headingAr, locale)}</h2>
              {pick(c.subtitle, c.subtitleAr, locale) && <p>{pick(c.subtitle, c.subtitleAr, locale)}</p>}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {c.primary.enabled && c.primary.label && (
                <button className="btn btn-primary btn-lg" onClick={onOrder}>
                  <IcoBag /> {pick(c.primary.label, c.primary.labelAr, locale)}
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
function Footer({ name, locale }: { name: string; locale: "en" | "ar" }) {
  const { tenant } = useStore();
  const f = tenant.footer;
  if (!f?.enabled)
    return (
      <footer className="footer">
        <div className="section-wrap">
          <div className="footer-bottom">
            <span>{name}</span>
          </div>
        </div>
      </footer>
    );
  return (
    <footer className="footer">
      <div className="section-wrap">
        <div className="footer-grid">
          <div>
            <a className="brand" href="#top">
              <span className="brand-name">{name}</span>
            </a>
            <p style={{ color: "var(--ink-2)", maxWidth: "26em", lineHeight: 1.6, fontSize: 15 }}>
              {pick(f.about, f.aboutAr, locale)}
            </p>
            <div className="socials">
              {f.social.instagram && (
                <a className="social-btn" href={f.social.instagram} aria-label="instagram">
                  <IcoInstagram />
                </a>
              )}
              {f.social.whatsapp && (
                <a className="social-btn" href={`https://wa.me/${f.social.whatsapp.replace(/[^\d]/g, "")}`} aria-label="whatsapp">
                  <IcoWhatsapp />
                </a>
              )}
              {f.social.phone && (
                <a className="social-btn" href={`tel:${f.social.phone.replace(/[^\d+]/g, "")}`} aria-label="phone">
                  <IcoPhone />
                </a>
              )}
            </div>
          </div>
          {f.links.length > 0 && (
            <div>
              <h4>{pick(f.browseTitle, f.browseTitleAr, locale)}</h4>
              {f.links.map((l, i) => (
                <a key={i} href={l.url || "#"}>
                  {pick(l.label, l.labelAr, locale)}
                </a>
              ))}
            </div>
          )}
          <div>
            <h4>{pick(f.visitTitle, f.visitTitleAr, locale)}</h4>
            {pick(f.address, f.addressAr, locale) && <span style={{ color: "var(--ink-2)" }}>{pick(f.address, f.addressAr, locale)}</span>}
            {f.phones.map((p, i) => (
              <a key={i} href={`tel:${p.replace(/[^\d+]/g, "")}`}>
                {p}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>{pick(f.copyright, f.copyrightAr, locale)}</span>
        </div>
      </div>
    </footer>
  );
}
