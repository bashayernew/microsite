"use client";

/* eslint-disable @next/next/no-img-element */
/**
 * Nuwwar-styled ordering popups — product modal, cart drawer, and checkout.
 *
 * These use the Nuwwar design-system classes (`.prod-modal`, `.cart-drawer`,
 * `.modal`, …) from nuwwar.css and are wrapped in a `.nuwwar` portal root so
 * they inherit the Nuwwar fonts/tokens. They're wired to the real
 * store-provider cart and to `createOrder`, so they place real orders — only
 * the look/behaviour is Nuwwar.
 */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type {
  DeliveryArea,
  ModifierGroup,
  NewOrder,
  OrderConfirmation,
  OrderType,
  Product,
} from "@/lib/api/types";
import { createOrder, getDeliveryAreas } from "@/lib/api/client";
import { pick } from "@/lib/i18n";
import { addPrices, multiplyPrice } from "@/lib/format";
import {
  useStore,
  lineTotal as calcLineTotal,
  type CartModifier,
} from "@/components/store-provider";
import {
  IcoArrow,
  IcoBag,
  IcoCart,
  IcoCheck,
  IcoClose,
  IcoMinus,
  IcoPlus,
  IcoStore,
  IcoTrash,
  IcoTruck,
} from "./icons";

function unitLabel(locale: "en" | "ar") {
  return locale === "ar" ? "د.ك" : "KWD";
}

/** Portal wrapped in `.nuwwar` so the popup inherits the Nuwwar design system. */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<div className="nuwwar">{children}</div>, document.body);
}

function useModalEffects(onClose: () => void, lock = true) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    if (lock) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (lock) document.body.style.overflow = "";
    };
  }, [onClose, lock]);
}

/* ── Product modal ─────────────────────────────────────────────────────────── */
export function NuwwarProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  if (!product) return null;
  return <ProductModalInner key={product.id} product={product} onClose={onClose} />;
}

function ProductModalInner({ product, onClose }: { product: Product; onClose: () => void }) {
  const { locale, addLine, tenant } = useStore();
  const canOrder = tenant.allowCart !== false;
  useModalEffects(onClose);

  const [variantId, setVariantId] = useState(
    product.variants.find((v) => v.isDefault)?.id ?? product.variants[0]?.id ?? "",
  );
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const g of product.modifierGroups)
      init[g.id] = g.modifiers.filter((m) => m.isDefault).map((m) => m.id);
    return init;
  });
  const [qty, setQty] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  const name = pick(product.name, product.nameAr, locale);
  const desc = pick(product.description, product.descriptionAr, locale);
  const img = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? "";

  const unitBase = useMemo(() => {
    if (product.hasVariants && product.variants.length) {
      return product.variants.find((x) => x.id === variantId)?.price ?? product.basePrice;
    }
    return product.basePrice;
  }, [product, variantId]);

  const chosenModifiers = useMemo<CartModifier[]>(() => {
    const out: CartModifier[] = [];
    for (const g of product.modifierGroups)
      for (const id of selected[g.id] ?? []) {
        const m = g.modifiers.find((x) => x.id === id);
        if (m) out.push({ id: m.id, name: m.name, nameAr: m.nameAr, price: m.price });
      }
    return out;
  }, [product, selected]);

  const unitPrice = addPrices(unitBase, ...chosenModifiers.map((m) => m.price));
  const total = multiplyPrice(unitPrice, qty);
  const missingRequired = product.modifierGroups.some(
    (g) => g.required && (selected[g.id]?.length ?? 0) < g.minSelect,
  );

  function toggleModifier(g: ModifierGroup, id: string) {
    setSelected((prev) => {
      const cur = prev[g.id] ?? [];
      const has = cur.includes(id);
      let next: string[];
      if (g.maxSelect === 1) next = has && !g.required ? [] : [id];
      else if (has) next = cur.filter((x) => x !== id);
      else next = cur.length >= g.maxSelect ? cur : [...cur, id];
      return { ...prev, [g.id]: next };
    });
  }

  function add() {
    if (missingRequired) {
      setShowErrors(true);
      return;
    }
    const v = product.variants.find((x) => x.id === variantId);
    addLine({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      image: img || null,
      variantId: v?.id,
      variantName: v?.name,
      variantNameAr: v?.nameAr,
      unitBase,
      modifiers: chosenModifiers,
      quantity: qty,
    });
    onClose();
  }

  return (
    <Portal>
      <div className="modal-scrim" onClick={onClose}>
        <div className="prod-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <div className="prod-hero">
            {img && <img src={img} alt={name} />}
            <button className="icon-btn prod-close" onClick={onClose} aria-label="close">
              <IcoClose />
            </button>
          </div>
          <div className="prod-body">
            <div className="prod-title">
              <h3>{name}</h3>
              <span className="prod-base num">
                {unitBase} <small>{unitLabel(locale)}</small>
              </span>
            </div>
            {desc && <p className="prod-desc">{desc}</p>}

            {product.hasVariants && product.variants.length > 0 && (
              <div className="opt-group">
                <div className="opt-head">
                  <span className="opt-label">{pick("Size", "الحجم", locale)}</span>
                  <span className="opt-tag req">{pick("Required", "إلزامي", locale)}</span>
                </div>
                <div className="opt-choices">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`opt-pill ${variantId === v.id ? "active" : ""}`}
                      onClick={() => setVariantId(v.id)}
                    >
                      <span>{pick(v.name, v.nameAr, locale)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.modifierGroups.map((g) => {
              const err = showErrors && g.required && (selected[g.id]?.length ?? 0) < g.minSelect;
              return (
                <div className="opt-group" key={g.id}>
                  <div className="opt-head">
                    <span className="opt-label">{pick(g.name, g.nameAr, locale)}</span>
                    <span className={`opt-tag ${g.required ? "req" : ""}`}>
                      {g.required ? pick("Required", "إلزامي", locale) : pick("Optional", "اختياري", locale)}
                    </span>
                  </div>
                  {err && (
                    <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 6px" }}>
                      {pick("Please choose an option", "الرجاء الاختيار", locale)}
                    </p>
                  )}
                  <div className="addon-list">
                    {g.modifiers.map((m) => {
                      const on = (selected[g.id] ?? []).includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={`addon-row ${on ? "active" : ""}`}
                          onClick={() => toggleModifier(g, m.id)}
                        >
                          <span className={`addon-check ${on ? "on" : ""}`}>{on && <IcoCheck />}</span>
                          <span className="addon-name">{pick(m.name, m.nameAr, locale)}</span>
                          <span className="addon-price num">
                            {m.price === "0.000" ? pick("Free", "مجاناً", locale) : `+${m.price}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {canOrder && (
            <div className="prod-foot">
              <div className="qty-step">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="less">
                  <IcoMinus />
                </button>
                <span className="qv num">{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="more">
                  <IcoPlus />
                </button>
              </div>
              <button className="btn btn-primary btn-lg prod-add" onClick={add}>
                <IcoBag /> {pick("Add to order", "أضف للطلب", locale)}
                <span className="prod-add-total num">
                  {total} {unitLabel(locale)}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/* ── Cart drawer ───────────────────────────────────────────────────────────── */
export function NuwwarCartDrawer({
  open,
  onClose,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const { locale, lines, subtotal, setQuantity, removeLine } = useStore();
  useModalEffects(onClose, open);
  if (!open) return null;

  return (
    <Portal>
      <div className="cart-overlay open" onClick={onClose}>
        <aside
          className="cart-drawer open"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="cart-head">
            <h3>{pick("Your order", "طلبك", locale)}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="close">
              <IcoClose />
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-ico">
                <IcoCart />
              </span>
              <p className="cart-empty-title">{pick("Your order is empty", "طلبك فارغ", locale)}</p>
              <p className="cart-empty-hint">
                {pick("Add a few dishes from the menu to get started.", "أضف بعض الأطباق من القائمة للبدء.", locale)}
              </p>
            </div>
          ) : (
            <>
              <div className="cart-lines">
                {lines.map((l) => {
                  const modSummary = [
                    l.variantName ? pick(l.variantName, l.variantNameAr ?? l.variantName, locale) : "",
                    ...l.modifiers.map((m) => pick(m.name, m.nameAr, locale)),
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <div className="cart-line" key={l.lineId}>
                      {l.image && <img className="cl-thumb" src={l.image} alt={pick(l.name, l.nameAr, locale)} />}
                      <div className="cl-main">
                        <div className="cl-top">
                          <span className="cl-name">{pick(l.name, l.nameAr, locale)}</span>
                          <button className="cl-remove" onClick={() => removeLine(l.lineId)} aria-label="remove">
                            <IcoTrash />
                          </button>
                        </div>
                        {modSummary && <div className="cl-meta">{modSummary}</div>}
                        <div className="cl-bottom">
                          <div className="qty-step sm">
                            <button type="button" onClick={() => setQuantity(l.lineId, l.quantity - 1)} aria-label="less">
                              <IcoMinus />
                            </button>
                            <span className="qv num">{l.quantity}</span>
                            <button type="button" onClick={() => setQuantity(l.lineId, l.quantity + 1)} aria-label="more">
                              <IcoPlus />
                            </button>
                          </div>
                          <span className="cl-price num">
                            {calcLineTotal(l)} <small>{unitLabel(locale)}</small>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-foot">
                <div className="cart-row total">
                  <span>{pick("Subtotal", "المجموع", locale)}</span>
                  <span className="num">
                    {subtotal} {unitLabel(locale)}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", marginTop: 6 }}
                  onClick={onCheckout}
                >
                  {pick("Checkout", "إتمام الطلب", locale)}{" "}
                  <IcoArrow style={locale === "ar" ? { transform: "scaleX(-1)" } : {}} />
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </Portal>
  );
}

/* ── Checkout modal (real order placement, Nuwwar reserve-modal styling) ─────── */
const TYPE_META: Record<OrderType, { icon: React.ReactNode; en: string; ar: string }> = {
  DINE_IN: { icon: <IcoStore />, en: "Dine in", ar: "في المطعم" },
  TAKEAWAY: { icon: <IcoBag />, en: "Pickup", ar: "استلام" },
  DELIVERY: { icon: <IcoTruck />, en: "Delivery", ar: "توصيل" },
};

export function NuwwarCheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const { locale, lines, subtotal, tenant, branch } = store;
  useModalEffects(onClose, open);

  const [type, setType] = useState<OrderType>(store.orderType);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [zones, setZones] = useState<DeliveryArea[]>([]);
  const [zone, setZone] = useState<DeliveryArea | null>(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    if (type === "DELIVERY") getDeliveryAreas(tenant.slug).then(setZones).catch(() => setZones([]));
  }, [type, tenant.slug]);

  if (!open) return null;
  const fee = type === "DELIVERY" && zone ? zone.fee : "0.000";
  const total = addPrices(subtotal, fee);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (type === "DELIVERY" && (!zone || !address.trim())) {
      setError(pick("Please choose a delivery area and address.", "الرجاء اختيار منطقة التوصيل والعنوان.", locale));
      return;
    }
    setError("");
    setSubmitting(true);
    const payload: NewOrder = {
      branchId: branch.id,
      orderType: type,
      items: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        modifiers: l.modifiers.map((m) => ({ name: m.name, nameAr: m.nameAr, price: m.price })),
        notes: l.notes,
      })),
      notes: notes.trim() || undefined,
      customerName: name.trim() || undefined,
      customerPhone: phone.trim() || undefined,
      deliveryAreaId: type === "DELIVERY" ? zone?.id : undefined,
      deliveryFee: type === "DELIVERY" ? zone?.fee : undefined,
      address: type === "DELIVERY" ? address.trim() : undefined,
      locale,
    };
    try {
      const res = await createOrder(tenant.slug, payload);
      setDone(res);
      store.addActiveOrder({ orderNumber: res.orderNumber, orderType: type, estimatedMinutes: res.estimatedMinutes });
    } catch {
      setError(pick("Something went wrong. Please try again.", "حدث خطأ ما. حاول مرة أخرى.", locale));
    } finally {
      setSubmitting(false);
    }
  }

  function finish() {
    store.clear();
    setDone(null);
    setName("");
    setPhone("");
    setNotes("");
    setAddress("");
    setZone(null);
    store.setOrdersOpen(true);
    onClose();
  }

  const types = tenant.orderTypes.length ? tenant.orderTypes : (["TAKEAWAY"] as OrderType[]);

  return (
    <Portal>
      <div className="modal-scrim" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          {done ? (
            <div className="modal-success">
              <span className="check">
                <IcoCheck />
              </span>
              <h3>{pick("Order placed!", "تم استلام طلبك!", locale)}</h3>
              <p style={{ color: "var(--ink-2)", maxWidth: "26em", margin: 0 }}>
                {pick("We've sent it to the kitchen.", "أرسلناه إلى المطبخ.", locale)} #{done.orderNumber}
              </p>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={finish}>
                {pick("Track my order", "تتبّع طلبي", locale)}
              </button>
            </div>
          ) : (
            <>
              <div className="modal-head">
                <div>
                  <h3>{pick("Complete your order", "أكمل طلبك", locale)}</h3>
                  <p>
                    {subtotal} {unitLabel(locale)} · {pick("ready in ~20 min", "جاهز خلال ٢٠ دقيقة تقريباً", locale)}
                  </p>
                </div>
                <button className="icon-btn" onClick={onClose} aria-label="close">
                  <IcoClose />
                </button>
              </div>
              <form className="modal-body" onSubmit={submit}>
                <div className="field">
                  <label>{pick("Order type", "نوع الطلب", locale)}</label>
                  <div className="chip-group">
                    {types.map((ot) => (
                      <button
                        key={ot}
                        type="button"
                        className={`chip ${type === ot ? "active" : ""}`}
                        onClick={() => setType(ot)}
                      >
                        {TYPE_META[ot].icon} {pick(TYPE_META[ot].en, TYPE_META[ot].ar, locale)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>{pick("Full name", "الاسم الكامل", locale)}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={pick("e.g. Sara Al-Rashid", "مثال: سارة الراشد", locale)} />
                </div>
                <div className="field">
                  <label>{pick("Phone number", "رقم الهاتف", locale)}</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" dir="ltr" placeholder="+965 …" />
                </div>

                {type === "DELIVERY" && (
                  <>
                    <div className="field">
                      <label>{pick("Delivery area", "منطقة التوصيل", locale)}</label>
                      <div className="chip-group">
                        {zones.map((z) => (
                          <button
                            key={z.id}
                            type="button"
                            className={`chip ${zone?.id === z.id ? "active" : ""}`}
                            onClick={() => setZone(z)}
                          >
                            {pick(z.name, z.nameAr, locale)} (+{z.fee})
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="field">
                      <label>{pick("Delivery address", "عنوان التوصيل", locale)}</label>
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={pick("Block, street, building…", "القطعة، الشارع، المبنى…", locale)}
                      />
                    </div>
                  </>
                )}

                <div className="field">
                  <label>{pick("Notes", "ملاحظات", locale)}</label>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={pick("Anything we should know?", "أي ملاحظات؟", locale)} />
                </div>

                {error && <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>{error}</p>}

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 4 }} disabled={submitting}>
                  {submitting
                    ? pick("Placing…", "جارٍ الإرسال…", locale)
                    : `${pick("Place order", "إرسال الطلب", locale)} · ${total} ${unitLabel(locale)}`}
                  <IcoArrow style={locale === "ar" ? { transform: "scaleX(-1)" } : {}} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
