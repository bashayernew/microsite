"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type {
  DeliveryArea,
  DiningArea,
  NewOrder,
  OrderConfirmation,
  OrderType,
  Table,
  TableStatus,
} from "@/lib/api/types";
import { createOrder, getDeliveryAreas, getTables } from "@/lib/api/client";
import { pick, makeT } from "@/lib/i18n";
import { addPrices, localizeNumber } from "@/lib/format";
import {
  useStore,
  lineTotal as calcLineTotal,
  lineUnitPrice,
  type CartLine,
} from "@/components/store-provider";
import { Sheet, SheetHeader, QtyStepper, Money } from "@/components/ui/ui";
import { IconBack, IconPin, IconBag, IconCheck } from "@/components/ui/icons";

type Step = "cart" | "arrange" | "payment";
type PayMethod = "CASH" | "CARD";

function typeLabel(ot: OrderType, t: ReturnType<typeof makeT>, locale: "en" | "ar") {
  return ot === "TAKEAWAY"
    ? t("takeaway")
    : ot === "DINE_IN"
      ? t("dine_in")
      : pick("Delivery", "توصيل", locale);
}

export function OrderDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const { locale, lines, subtotal, count, tenant, table, setTable } = store;
  const t = makeT(locale);

  const [step, setStep] = useState<Step>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [pay, setPay] = useState<PayMethod>("CASH");

  // Editable order-type summary at checkout
  const [pendingType, setPendingType] = useState<OrderType | null>(null);
  const [branchOpen, setBranchOpen] = useState(false);

  // Dine-in tables (table itself lives in the shared store, set at the entry gate)
  const [areas, setAreas] = useState<DiningArea[]>([]);

  // Delivery
  const [zones, setZones] = useState<DeliveryArea[]>([]);
  const [zone, setZone] = useState<DeliveryArea | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryError, setDeliveryError] = useState(false);

  const isDelivery = store.orderType === "DELIVERY";
  const isDineIn = store.orderType === "DINE_IN";
  const fee = isDelivery && zone ? zone.fee : "0.000";
  const total = addPrices(subtotal, fee);

  useEffect(() => {
    let alive = true;
    if (isDineIn) getTables(tenant.slug, store.branch.id).then((a) => alive && setAreas(a));
    return () => {
      alive = false;
    };
  }, [isDineIn, tenant.slug, store.branch.id]);

  useEffect(() => {
    let alive = true;
    if (isDelivery) getDeliveryAreas(tenant.slug).then((z) => alive && setZones(z));
    return () => {
      alive = false;
    };
  }, [isDelivery, tenant.slug]);

  useEffect(() => {
    setZone(null);
    setDeliveryError(false);
  }, [store.orderType]);

  function close() {
    onClose();
  }

  function restart() {
    store.clear();
    setConfirmation(null);
    setName("");
    setPhone("");
    setOrderNotes("");
    setTable(null);
    setZone(null);
    setAddress("");
    setDeliveryError(false);
    setPay("CASH");
    setBranchOpen(false);
    setStep("cart");
    onClose();
  }

  function confirmTypeChange() {
    if (pendingType) {
      store.setOrderType(pendingType); // provider releases any held table
      setBranchOpen(false);
    }
    setPendingType(null);
  }

  async function fireToKitchen() {
    if (isDelivery && (!zone || !address.trim())) {
      setDeliveryError(true);
      return;
    }
    setSubmitting(true);
    const payload: NewOrder = {
      branchId: store.branch.id,
      orderType: store.orderType,
      items: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        modifiers: l.modifiers.map((m) => ({ name: m.name, nameAr: m.nameAr, price: m.price })),
        notes: l.notes,
      })),
      notes: orderNotes.trim() || undefined,
      customerName: name.trim() || undefined,
      customerPhone: phone.trim() || undefined,
      tableId: isDineIn ? table?.id : undefined,
      tableCode: isDineIn ? table?.code : undefined,
      deliveryAreaId: isDelivery ? zone?.id : undefined,
      deliveryFee: isDelivery ? zone?.fee : undefined,
      address: isDelivery ? address.trim() : undefined,
      locale,
    };
    try {
      const res = await createOrder(tenant.slug, payload);
      setConfirmation(res);
      store.addActiveOrder({
        orderNumber: res.orderNumber,
        orderType: store.orderType,
        tableCode: isDineIn ? table?.code : undefined,
        estimatedMinutes: res.estimatedMinutes,
      });
      setStep("payment");
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    step === "cart"
      ? t("your_order")
      : step === "payment"
        ? pick("Payment", "الدفع", locale)
        : t("checkout");

  const branchLabel =
    store.orderType === "TAKEAWAY"
      ? t("pickup_branch")
      : isDineIn
        ? t("dinein_branch")
        : pick("Delivering from", "التوصيل من", locale);

  return (
    <Sheet open={open} onClose={close} ariaLabel="Your order" placement="drawer">
      <SheetHeader
        title={
          <span className="flex items-center gap-2">
            {step === "arrange" && (
              <button
                onClick={() => setStep("cart")}
                aria-label={t("back_to_menu")}
                className="grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:bg-paper-sunk rtl:rotate-180"
              >
                <IconBack />
              </button>
            )}
            {title}
          </span>
        }
        onClose={close}
      />

      {/* 1 · CART */}
      {step === "cart" && (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {lines.length === 0 ? (
              <EmptyCart t={t} onBrowse={close} />
            ) : (
              <ul className="space-y-3">
                {lines.map((l) => (
                  <CartRow key={l.lineId} line={l} />
                ))}
              </ul>
            )}
          </div>
          {lines.length > 0 && (
            <Footer>
              <SubtotalRow
                label={`${t("subtotal")} · ${localizeNumber(count, locale)} ${count === 1 ? t("item") : t("items")}`}
                amount={subtotal}
                locale={locale}
              />
              <PrimaryButton onClick={() => setStep("arrange")}>{t("checkout")}</PrimaryButton>
            </Footer>
          )}
        </>
      )}

      {/* 2 · ARRANGE — chosen type summary (editable) + table/delivery + details */}
      {step === "arrange" && (
        <>
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {/* Order type — chosen one is dominant; changing asks to confirm */}
            <section>
              <h3 className="mb-2 text-sm font-semibold text-ink">{t("order_type")}</h3>
              <div className="grid grid-cols-3 gap-2">
                {tenant.orderTypes.map((ot) => (
                  <TypeChip
                    key={ot}
                    type={ot}
                    active={store.orderType === ot}
                    label={typeLabel(ot, t, locale)}
                    onClick={() => {
                      if (ot !== store.orderType) setPendingType(ot);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Branch — collapsed summary, expand to change */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">{branchLabel}</h3>
                <button
                  onClick={() => setBranchOpen((o) => !o)}
                  className="text-xs font-semibold text-saffron"
                >
                  {branchOpen ? pick("Done", "تم", locale) : pick("Change", "تغيير", locale)}
                </button>
              </div>
              {branchOpen ? (
                <div className="grid gap-2">
                  {tenant.branches.map((b) => {
                    const activeB = store.branch.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          store.setBranch(b);
                          setBranchOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-start transition ${
                          activeB ? "border-saffron bg-saffron-tint" : "border-line bg-paper-raised hover:border-ink-faint"
                        }`}
                      >
                        <IconPin className={activeB ? "text-saffron" : "text-ink-faint"} />
                        <span>
                          <span className="block text-sm font-medium text-ink">
                            {pick(b.name, b.nameAr, locale)}
                          </span>
                          <span className="block text-xs text-ink-faint">
                            {pick(b.area, b.areaAr, locale)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-paper-raised px-4 py-3">
                  <IconPin className="text-saffron" />
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {pick(store.branch.name, store.branch.nameAr, locale)}
                    </span>
                    <span className="block text-xs text-ink-faint">
                      {pick(store.branch.area, store.branch.areaAr, locale)}
                    </span>
                  </span>
                </div>
              )}
            </section>

            {/* Tables — dine-in */}
            {isDineIn && areas.length > 0 && (
              <section>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-ink">
                    {pick("Your table", "طاولتك", locale)}
                  </h3>
                  <span className="text-xs text-ink-faint">{t("optional")}</span>
                </div>
                <div className="space-y-4">
                  {areas.map((area) => (
                    <div key={area.id}>
                      <p className="mb-1.5 text-xs font-medium text-ink-faint">
                        {pick(area.name, area.nameAr, locale)}
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {area.tables.map((tb) => (
                          <TableChip
                            key={tb.id}
                            table={tb}
                            active={table?.id === tb.id}
                            locale={locale}
                            onPick={() => setTable(table?.id === tb.id ? null : tb)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Delivery — area + address */}
            {isDelivery && (
              <>
                <section>
                  <h3 className="mb-2 text-sm font-semibold text-ink">
                    {pick("Delivery area", "منطقة التوصيل", locale)}
                    <span className="text-saffron"> *</span>
                  </h3>
                  {deliveryError && !zone && (
                    <p className="mb-2 text-xs font-medium text-saffron">
                      {pick("Please choose a delivery area", "الرجاء اختيار منطقة التوصيل", locale)}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((z) => {
                      const activeZ = zone?.id === z.id;
                      return (
                        <button
                          key={z.id}
                          onClick={() => {
                            setZone(z);
                            setDeliveryError(false);
                          }}
                          className={`flex items-center justify-between rounded-xl border px-3 py-3 text-start transition ${
                            activeZ ? "border-saffron bg-saffron-tint" : "border-line bg-paper-raised hover:border-ink-faint"
                          }`}
                        >
                          <span className="text-sm font-medium text-ink">
                            {pick(z.name, z.nameAr, locale)}
                          </span>
                          <span className="text-xs font-semibold text-ink-soft">
                            +<Money amount={z.fee} locale={locale} showCurrency={false} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <Field label={`${pick("Delivery address", "عنوان التوصيل", locale)} *`}>
                    <textarea
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (e.target.value.trim()) setDeliveryError(false);
                      }}
                      rows={3}
                      placeholder={pick(
                        "Block, street, building, floor, apartment…",
                        "القطعة، الشارع، المبنى، الدور، الشقة…",
                        locale,
                      )}
                      className="w-full resize-none rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-saffron"
                    />
                  </Field>
                  {deliveryError && !address.trim() && (
                    <p className="mt-1 text-xs font-medium text-saffron">
                      {pick("Please add your address", "الرجاء إضافة عنوانك", locale)}
                    </p>
                  )}
                </section>
              </>
            )}

            {/* Details */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-ink">{t("your_details")}</h3>
              <Field label={t("name")}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("name_placeholder")}
                  className="w-full rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-saffron"
                />
              </Field>
              <Field label={t("phone")}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  dir="ltr"
                  placeholder={t("phone_placeholder")}
                  className="w-full rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-saffron"
                />
              </Field>
              <Field label={t("order_notes")}>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  placeholder={t("notes_placeholder")}
                  className="w-full resize-none rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-saffron"
                />
              </Field>
            </section>
          </div>
          <Footer>
            {isDelivery && zone ? (
              <div className="space-y-1.5">
                <LineRow label={t("subtotal")} amount={subtotal} locale={locale} />
                <LineRow label={pick("Delivery fee", "رسوم التوصيل", locale)} amount={fee} locale={locale} />
                <div className="my-1 h-px bg-line" />
                <SubtotalRow label={t("total")} amount={total} locale={locale} />
              </div>
            ) : (
              <SubtotalRow label={t("subtotal")} amount={subtotal} locale={locale} />
            )}
            <PrimaryButton onClick={fireToKitchen} disabled={submitting}>
              {submitting ? t("placing") : `🔥 ${pick("Fire to kitchen", "إرسال إلى المطبخ", locale)}`}
            </PrimaryButton>
          </Footer>

          {/* Confirm order-type change */}
          {pendingType && (
            <ConfirmChange
              fromDineInWithTable={isDineIn && !!table}
              tableCode={table?.code}
              toLabel={typeLabel(pendingType, t, locale)}
              locale={locale}
              onCancel={() => setPendingType(null)}
              onConfirm={confirmTypeChange}
            />
          )}
        </>
      )}

      {/* 3 · PAYMENT */}
      {step === "payment" && confirmation && (
        <>
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <div className="flex items-center gap-3 rounded-xl bg-ok-tint px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ok text-paper">
                <IconCheck width={18} height={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  🔥 {pick("Fired to the kitchen", "تم الإرسال إلى المطبخ", locale)}
                </p>
                <p className="text-xs text-ink-soft" dir="ltr">
                  {confirmation.orderNumber}
                </p>
              </div>
            </div>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-ink">
                {pick("How would you like to pay?", "كيف تريد الدفع؟", locale)}
              </h3>
              <div className="space-y-2">
                <PayOption
                  active={pay === "CASH"}
                  emoji="💵"
                  title={pick("Cash", "نقداً", locale)}
                  sub={
                    store.orderType === "TAKEAWAY"
                      ? pick("Pay at the counter", "ادفع عند الكاونتر", locale)
                      : isDelivery
                        ? pick("Pay on delivery", "ادفع عند الاستلام", locale)
                        : pick("Pay at your table", "ادفع عند طاولتك", locale)
                  }
                  onClick={() => setPay("CASH")}
                />
                <PayOption
                  active={false}
                  disabled
                  emoji="💳"
                  title={pick("Card / KNET", "بطاقة / كي نت", locale)}
                  sub={pick("Online payment — coming soon", "الدفع الإلكتروني — قريباً", locale)}
                  onClick={() => {}}
                />
              </div>
              <p className="mt-3 rounded-xl bg-paper-sunk px-3 py-2 text-center text-[11px] text-ink-faint">
                {pick(
                  "Online card payment will be enabled once the gateway is connected.",
                  "سيتم تفعيل الدفع بالبطاقة بعد ربط بوابة الدفع.",
                  locale,
                )}
              </p>
            </section>
          </div>
          <Footer>
            <SubtotalRow label={t("total")} amount={total} locale={locale} />
            <PrimaryButton
              onClick={() => {
                store.setOrdersOpen(true);
                restart();
              }}
            >
              {pick("Track my order", "تتبّع طلبي", locale)}
            </PrimaryButton>
          </Footer>
        </>
      )}
    </Sheet>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function ConfirmChange({
  fromDineInWithTable,
  tableCode,
  toLabel,
  locale,
  onCancel,
  onConfirm,
}: {
  fromDineInWithTable: boolean;
  tableCode?: string;
  toLabel: string;
  locale: "en" | "ar";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <button aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-ink/45" />
      <div className="relative z-10 w-full max-w-xs rounded-2xl bg-paper p-5 text-center shadow-lg animate-float-up">
        <h4 className="font-display text-lg text-ink">
          {pick("Change order type?", "تغيير نوع الطلب؟", locale)}
        </h4>
        <p className="mt-1.5 text-sm text-ink-soft">
          {pick(`Switch to ${toLabel}?`, `التغيير إلى ${toLabel}؟`, locale)}
          {fromDineInWithTable && tableCode
            ? " " +
              pick(
                `Your table ${tableCode} will be released.`,
                `سيتم تحرير طاولتك ${tableCode}.`,
                locale,
              )
            : ""}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink transition hover:bg-paper-sunk"
          >
            {pick("Cancel", "إلغاء", locale)}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-saffron py-2.5 text-sm font-semibold text-paper transition hover:bg-saffron-deep"
          >
            {pick("Change", "تغيير", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeChip({
  type,
  active,
  label,
  onClick,
}: {
  type: OrderType;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const emoji = type === "TAKEAWAY" ? "🥡" : type === "DINE_IN" ? "🍽️" : "🛵";
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-2 py-3 text-center transition ${
        active
          ? "border-saffron bg-saffron-tint shadow-sm"
          : "border-line bg-paper-raised opacity-70 hover:opacity-100"
      }`}
    >
      <span className="block text-xl">{emoji}</span>
      <span className={`mt-1 block text-xs font-semibold ${active ? "text-saffron" : "text-ink-soft"}`}>
        {label}
      </span>
    </button>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-saffron py-3.5 text-sm font-semibold text-paper transition hover:bg-saffron-deep disabled:opacity-70"
    >
      {children}
    </button>
  );
}

function PayOption({
  active,
  disabled,
  emoji,
  title,
  sub,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  emoji: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start transition ${
        active
          ? "border-saffron bg-saffron-tint"
          : disabled
            ? "cursor-not-allowed border-line bg-paper-sunk opacity-60"
            : "border-line bg-paper-raised hover:border-saffron"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block text-xs text-ink-faint">{sub}</span>
      </span>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
          active ? "border-saffron" : "border-ink-faint"
        }`}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
      </span>
    </button>
  );
}

function TableChip({
  table,
  active,
  locale,
  onPick,
}: {
  table: Table;
  active: boolean;
  locale: "en" | "ar";
  onPick: () => void;
}) {
  const available = table.status === "AVAILABLE";
  const statusLabel: Record<TableStatus, [string, string]> = {
    AVAILABLE: ["Available", "متاحة"],
    OCCUPIED: ["Occupied", "مشغولة"],
    RESERVED: ["Reserved", "محجوزة"],
    CLEANING: ["Cleaning", "تنظيف"],
    DISABLED: ["Unavailable", "غير متاحة"],
  };
  return (
    <button
      onClick={onPick}
      disabled={!available}
      className={`flex flex-col items-center rounded-xl border px-2 py-2.5 transition ${
        active
          ? "border-saffron bg-saffron-tint"
          : available
            ? "border-line bg-paper-raised hover:border-saffron"
            : "cursor-not-allowed border-line bg-paper-sunk opacity-55"
      }`}
    >
      <span className="font-display text-sm text-ink" dir="ltr">
        {table.code}
      </span>
      <span className="mt-0.5 text-[11px] text-ink-faint">
        {localizeNumber(table.seats, locale)} {pick("seats", "مقاعد", locale)}
      </span>
      {!available && (
        <span className="mt-1 text-[10px] font-medium text-ink-faint">
          {pick(statusLabel[table.status][0], statusLabel[table.status][1], locale)}
        </span>
      )}
    </button>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const { locale, setQuantity } = useStore();
  const modSummary = line.modifiers.map((m) => pick(m.name, m.nameAr, locale)).join(" · ");
  return (
    <li className="flex gap-3 rounded-xl border border-line bg-paper-raised p-3">
      {line.image && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-ink">
            {pick(line.name, line.nameAr, locale)}
          </p>
          <Money amount={calcLineTotal(line)} locale={locale} className="text-sm font-semibold" />
        </div>
        {line.variantName && (
          <p className="text-xs text-ink-soft">
            {pick(line.variantName, line.variantNameAr ?? line.variantName, locale)}
          </p>
        )}
        {modSummary && <p className="truncate text-xs text-ink-faint">{modSummary}</p>}
        {line.notes && <p className="truncate text-xs italic text-ink-faint">“{line.notes}”</p>}
        <div className="mt-2 flex items-center justify-between">
          <QtyStepper
            value={line.quantity}
            onChange={(v) => setQuantity(line.lineId, v)}
            locale={locale}
            min={0}
          />
          <span className="text-xs text-ink-faint">
            <Money amount={lineUnitPrice(line)} locale={locale} showCurrency={false} /> {makeT(locale)("each")}
          </span>
        </div>
      </div>
    </li>
  );
}

function EmptyCart({ t, onBrowse }: { t: ReturnType<typeof makeT>; onBrowse: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-paper-sunk text-ink-faint">
        <IconBag width={28} height={28} />
      </span>
      <h3 className="mt-4 font-display text-xl text-ink">{t("cart_empty")}</h3>
      <p className="mt-1 max-w-[16rem] text-sm text-ink-soft">{t("cart_empty_hint")}</p>
      <button
        onClick={onBrowse}
        className="mt-5 rounded-xl border border-saffron px-5 py-2.5 text-sm font-semibold text-saffron transition hover:bg-saffron hover:text-paper"
      >
        {t("browse_menu")}
      </button>
    </div>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-line bg-paper-raised px-5 py-4">{children}</div>
  );
}

function SubtotalRow({ label, amount, locale }: { label: string; amount: string; locale: "en" | "ar" }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-ink-soft">{label}</span>
      <Money amount={amount} locale={locale} className="font-display text-lg text-ink" />
    </div>
  );
}

function LineRow({ label, amount, locale }: { label: string; amount: string; locale: "en" | "ar" }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-ink-soft">{label}</span>
      <Money amount={amount} locale={locale} className="text-sm font-medium text-ink" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
