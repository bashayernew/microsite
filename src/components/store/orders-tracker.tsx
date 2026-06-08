"use client";

import { useEffect, useState } from "react";
import type { ActiveOrder, OrderType } from "@/lib/api/types";
import { getOrderStatus } from "@/lib/api/client";
import { localizeNumber } from "@/lib/format";
import { makeT, pick } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";
import { Sheet, SheetHeader } from "@/components/ui/ui";
import { IconCheck, IconBag } from "@/components/ui/icons";

function stepLabels(orderType: OrderType): { en: string; ar: string }[] {
  const ready =
    orderType === "DELIVERY"
      ? { en: "Out for delivery", ar: "خرج للتوصيل" }
      : { en: "Ready", ar: "جاهز" };
  const done =
    orderType === "DINE_IN"
      ? { en: "Served", ar: "تم التقديم" }
      : orderType === "DELIVERY"
        ? { en: "Delivered", ar: "تم التوصيل" }
        : { en: "Completed", ar: "اكتمل" };
  return [
    { en: "Received", ar: "تم الاستلام" },
    { en: "Preparing", ar: "قيد التحضير" },
    ready,
    done,
  ];
}

export function OrdersTracker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const { locale, activeOrders } = store;

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Your orders" placement="drawer">
      <SheetHeader
        title={`${pick("Your orders", "طلباتك", locale)} · ${localizeNumber(activeOrders.length, locale)}`}
        onClose={onClose}
      />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {activeOrders.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-paper-sunk text-ink-faint">
              <IconBag width={24} height={24} />
            </span>
            <p className="mt-3 text-sm text-ink-soft">
              {pick("No active orders yet.", "لا توجد طلبات نشطة بعد.", locale)}
            </p>
          </div>
        ) : (
          activeOrders.map((o) => <OrderTrackCard key={o.orderNumber} order={o} locale={locale} />)
        )}
      </div>
      <div className="border-t border-line bg-paper-raised px-5 py-4">
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-saffron py-3.5 text-sm font-semibold text-paper transition hover:bg-saffron-deep"
        >
          {pick("Add another order", "أضف طلباً آخر", locale)}
        </button>
      </div>
    </Sheet>
  );
}

function OrderTrackCard({ order, locale }: { order: ActiveOrder; locale: "en" | "ar" }) {
  const t = makeT(locale);
  const labels = stepLabels(order.orderType);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let alive = true;
    const last = labels.length - 1;
    let id: ReturnType<typeof setInterval> | undefined;
    const tick = async () => {
      const res = await getOrderStatus(order.orderNumber);
      if (!alive) return;
      setCurrent(res.step);
      if (res.step >= last && id) clearInterval(id);
    };
    tick();
    id = setInterval(tick, 3000);
    return () => {
      alive = false;
      if (id) clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.orderNumber]);

  const finished = current >= labels.length - 1;
  const typeText =
    order.orderType === "TAKEAWAY"
      ? t("takeaway")
      : order.orderType === "DINE_IN"
        ? t("dine_in")
        : pick("Delivery", "توصيل", locale);

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-base text-ink" dir="ltr">
            {order.orderNumber}
          </p>
          <p className="text-xs text-ink-faint">
            {typeText}
            {order.orderType === "DINE_IN" && order.tableCode ? ` · ${order.tableCode}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            finished ? "bg-ok-tint text-ok" : "bg-saffron-tint text-saffron"
          }`}
        >
          {pick(labels[current].en, labels[current].ar, locale)}
        </span>
      </div>

      <div className="mt-4 flex items-start">
        {labels.map((l, i) => {
          const done = i < current;
          const isCurrent = i === current;
          return (
            <div key={i} className="flex flex-1 flex-col items-center">
              <span
                className={`relative grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                  done || isCurrent ? "bg-saffron text-paper" : "bg-paper-sunk text-ink-faint"
                }`}
              >
                {done ? <IconCheck width={13} height={13} /> : localizeNumber(i + 1, locale)}
                {isCurrent && !finished && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-saffron/40" />
                )}
              </span>
              <span
                className={`mt-1 text-center text-[10px] leading-tight ${
                  isCurrent ? "font-semibold text-ink" : "text-ink-faint"
                }`}
              >
                {pick(l.en, l.ar, locale)}
              </span>
            </div>
          );
        })}
      </div>

      {!finished && (
        <p className="mt-3 text-center text-[11px] text-ink-faint">
          {pick("Est. ready in", "الوقت المتوقع", locale)}{" "}
          {localizeNumber(order.estimatedMinutes, locale)} {t("minutes")}
        </p>
      )}
    </div>
  );
}
