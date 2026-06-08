"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ModifierGroup, Product } from "@/lib/api/types";
import { addPrices, multiplyPrice } from "@/lib/format";
import { pick, makeT } from "@/lib/i18n";
import { useStore, type CartModifier } from "@/components/store-provider";
import { Sheet, SheetHeader, QtyStepper, Money, Badge } from "@/components/ui/ui";
import { IconLeaf, IconFlame, IconCheck } from "@/components/ui/icons";

export function ProductSheet({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { locale, addLine } = useStore();
  const t = makeT(locale);

  const [variantId, setVariantId] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  // (Re)initialise whenever a new product opens.
  useEffect(() => {
    if (!product) return;
    const dv =
      product.variants.find((v) => v.isDefault)?.id ??
      product.variants[0]?.id ??
      "";
    setVariantId(dv);
    const init: Record<string, string[]> = {};
    for (const g of product.modifierGroups) {
      init[g.id] = g.modifiers.filter((m) => m.isDefault).map((m) => m.id);
    }
    setSelected(init);
    setQty(1);
    setNotes("");
    setShowErrors(false);
  }, [product]);

  const unitBase = useMemo(() => {
    if (!product) return "0.000";
    if (product.hasVariants && product.variants.length) {
      const v = product.variants.find((x) => x.id === variantId);
      return v?.price ?? product.basePrice;
    }
    return product.basePrice;
  }, [product, variantId]);

  const chosenModifiers = useMemo<CartModifier[]>(() => {
    if (!product) return [];
    const out: CartModifier[] = [];
    for (const g of product.modifierGroups) {
      for (const id of selected[g.id] ?? []) {
        const m = g.modifiers.find((x) => x.id === id);
        if (m) out.push({ id: m.id, name: m.name, nameAr: m.nameAr, price: m.price });
      }
    }
    return out;
  }, [product, selected]);

  const unitPrice = addPrices(unitBase, ...chosenModifiers.map((m) => m.price));
  const lineTotal = multiplyPrice(unitPrice, qty);

  const missingRequired = useMemo(() => {
    if (!product) return false;
    return product.modifierGroups.some(
      (g) => g.required && (selected[g.id]?.length ?? 0) < g.minSelect,
    );
  }, [product, selected]);

  function toggleModifier(g: ModifierGroup, id: string) {
    setSelected((prev) => {
      const cur = prev[g.id] ?? [];
      const has = cur.includes(id);
      let next: string[];
      if (g.maxSelect === 1) {
        next = has && !g.required ? [] : [id];
      } else if (has) {
        next = cur.filter((x) => x !== id);
      } else {
        next = cur.length >= g.maxSelect ? cur : [...cur, id];
      }
      return { ...prev, [g.id]: next };
    });
  }

  function handleAdd() {
    if (!product) return;
    if (missingRequired) {
      setShowErrors(true);
      return;
    }
    const v = product.variants.find((x) => x.id === variantId);
    addLine({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      image: product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? null,
      variantId: v?.id,
      variantName: v?.name,
      variantNameAr: v?.nameAr,
      unitBase,
      modifiers: chosenModifiers,
      notes: notes.trim() || undefined,
      quantity: qty,
    });
    onClose();
  }

  const heroImg =
    product?.images.find((i) => i.isPrimary)?.url ?? product?.images[0]?.url ?? null;

  return (
    <Sheet open={!!product} onClose={onClose} ariaLabel="Product" placement="modal">
      {product && (
        <>
          <SheetHeader title={pick(product.name, product.nameAr, locale)} onClose={onClose} />
          <div className="flex-1 overflow-y-auto">
            {heroImg && (
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={heroImg}
                  alt={pick(product.name, product.nameAr, locale)}
                  fill
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 inline-flex gap-2 px-4 ltr:left-0 rtl:right-0">
                  {product.vegetarian && (
                    <Badge tone="olive">
                      <IconLeaf width={13} height={13} /> {t("vegetarian")}
                    </Badge>
                  )}
                  {product.spicy && (
                    <Badge tone="saffron">
                      <IconFlame width={13} height={13} /> {t("spicy")}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6 px-5 py-5">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                {pick(product.description, product.descriptionAr, locale)}
              </p>

              {/* Variants */}
              {product.hasVariants && product.variants.length > 0 && (
                <Group label={pick("Size", "الحجم", locale)} required>
                  <div className="grid gap-2">
                    {product.variants.map((v) => {
                      const active = v.id === variantId;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setVariantId(v.id)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-start transition ${
                            active
                              ? "border-saffron bg-saffron-tint"
                              : "border-line bg-paper-raised hover:border-ink-faint"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Radio active={active} />
                            <span className="text-sm font-medium text-ink">
                              {pick(v.name, v.nameAr, locale)}
                            </span>
                          </span>
                          <Money amount={v.price} locale={locale} className="text-sm font-semibold" />
                        </button>
                      );
                    })}
                  </div>
                </Group>
              )}

              {/* Modifier groups */}
              {product.modifierGroups.map((g) => {
                const err = showErrors && g.required && (selected[g.id]?.length ?? 0) < g.minSelect;
                return (
                  <Group
                    key={g.id}
                    label={pick(g.name, g.nameAr, locale)}
                    required={g.required}
                    hint={
                      g.maxSelect > 1
                        ? `${t("choose_up_to")} ${g.maxSelect}`
                        : g.required
                          ? t("required")
                          : t("optional")
                    }
                    error={err ? t("select_required") : undefined}
                  >
                    <div className="grid gap-2">
                      {g.modifiers.map((m) => {
                        const active = (selected[g.id] ?? []).includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => toggleModifier(g, m.id)}
                            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-start transition ${
                              active
                                ? "border-saffron bg-saffron-tint"
                                : "border-line bg-paper-raised hover:border-ink-faint"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              {g.maxSelect === 1 ? (
                                <Radio active={active} />
                              ) : (
                                <Check active={active} />
                              )}
                              <span className="text-sm font-medium text-ink">
                                {pick(m.name, m.nameAr, locale)}
                              </span>
                            </span>
                            {m.price !== "0.000" && (
                              <span className="text-sm text-ink-soft">
                                + <Money amount={m.price} locale={locale} showCurrency={false} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Group>
                );
              })}

              {/* Notes */}
              <Group label={t("special_instructions")} hint={t("optional")}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("notes_placeholder")}
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-line bg-paper-raised px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-ink"
                />
              </Group>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-line bg-paper-raised px-5 py-4">
            <QtyStepper value={qty} onChange={setQty} locale={locale} />
            <button
              onClick={handleAdd}
              className="flex flex-1 items-center justify-between rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-paper transition hover:bg-saffron disabled:cursor-not-allowed"
            >
              <span>{t("add_to_order")}</span>
              <Money amount={lineTotal} locale={locale} />
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

function Group({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">
          {label}
          {required && <span className="text-saffron"> *</span>}
        </h3>
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </div>
      {error && <p className="mb-2 text-xs font-medium text-saffron">{error}</p>}
      {children}
    </div>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
        active ? "border-saffron" : "border-ink-faint"
      }`}
    >
      {active && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
    </span>
  );
}

function Check({ active }: { active: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 place-items-center rounded-md border-2 transition ${
        active ? "border-saffron bg-saffron text-paper" : "border-ink-faint text-transparent"
      }`}
    >
      <IconCheck width={13} height={13} />
    </span>
  );
}
