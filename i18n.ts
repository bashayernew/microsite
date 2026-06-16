"use client";

import { useEffect, useState } from "react";
import type { Locale, OrderType } from "@/lib/api/types";
import { getOrderStatus } from "@/lib/api/client";
import { localizeNumber } from "@/lib/format";
import { makeT, pick } from "@/lib/i18n";
import { IconCheck, IconClock } from "@/components/ui/icons";

/**
 * Customer-facing live order tracking. Mirrors the POS order lifecycle the
 * waiter/kitchen drive:
 *   OrderStatus   NEW → IN_PROGRESS → READY → COMPLETED
 *   KitchenStatus PENDING → PREPARING → KITCHEN_READY → SERVED
 *
 * For the demo it advances on timers so you can see the progression. When the
 * POS exposes an order-status endpoint, swap the timers for a poll of
 * `getOrderStatus(orderNumber)` (or a websocket push) — the step model below is
 * the same.
 */

interface Step {
  key: string;
  en: string;
  ar: string;
  subEn: string;
  subAr: string;
}

function steps(orderType: OrderType): Step[] {
  const ready: Step =
    orderType === "DINE_IN"
      ? {
          key: "ready",
          en: "Ready",
          ar: "جاهز",
          subEn: "Ready to be served",
          subAr: "جاهز للتقديم",
        }
      : orderType === "DELIVERY"
        ? {
            key: "ready",
            en: "Out for delivery",
            ar: "خرج للتوصيل",
            subEn: "On its way to you",
            subAr: "في طريقه إليك",
          }
        : {
            key: "ready",
            en: "Ready for pickup",
            ar: "جاهز للاستلام",
            subEn: "Collect it at the counter",
            subAr: "استلمه من الكاونتر",
          };
  const done: Step =
    orderType === "DINE_IN"
      ? { key: "done", en: "Served", ar: "تم التقديم", subEn: "Enjoy your meal", subAr: "بالهناء والشفاء" }
      : orderType === "DELIVERY"
        ? { key: "done", en: "Delivered", ar: "تم التوصيل", subEn: "Enjoy your meal", subAr: "بالهناء والشفاء" }
        : { key: "done", en: "Completed", ar: "اكتمل", subEn: "Enjoy your meal", subAr: "بالهناء والشفاء" };
  return [
    {
      key: "received",
      en: "Order received",
      ar: "تم استلام الطلب",
      subEn: "Sent to the kitchen",
      subAr: "تم الإرسال إلى المطبخ",
    },
    {
      key: "preparing",
      en: "Preparing",
      ar: "قيد التحضير",
      subEn: "The kitchen is on it",
      subAr: "المطبخ يعمل على طلبك",
    },
    ready,
    done,
  ];
}

export function OrderTracking({
  orderNumber,
  orderType,
  tableCode,
  estimatedMinutes,
  locale,
  onNewOrder,
}: {
  orderNumber: string;
  orderType: OrderType;
  tableCode?: string;
  estimatedMinutes: number;
  locale: Locale;
  onNewOrder: () => void;
}) {
  const t = makeT(locale);
  const list = steps(orderType);
  const [current, setCurrent] = useState(0);

  // Poll the live kitchen/order status so the chef's marks (received →
  // preparing → ready → served) drive these steps. Demo: getOrderStatus
  // advances by elapsed time; in production it reflects the actual status.
  useEffect(() => {
    let alive = true;
    const lastStep = steps(orderType).length - 1;
    let id: ReturnType<typeof setInterval> | undefined;
    const tick = async () => {
      const res = await getOrderStatus(orderNumber);
      if (!alive) return;
      setCurrent(res.step);
      if (res.step >= lastStep && id) clearInterval(id);
    };
    tick();
    id = setInterval(tick, 3000);
    return () => {
      alive = false;
      if (id) clearInterval(id);
    };
  }, [orderNumber, orderType]);

  const active = list[current];
  const finished = current >= list.length - 1;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="px-6 pt-8 text-center">
        <span
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full transition ${
            finished ? "bg-ok-tint text-ok" : "bg-saffron-tint text-saffron"
          }`}
        >
          {finished ? <IconCheck width={32} height={32} /> : <IconClock width={30} height={30} />}
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink">
          {pick(active.en, active.ar, locale)}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{pick(active.subEn, active.subAr, locale)}</p>
      </div>

      {/* Order meta */}
      <div className="mx-6 mt-6 grid grid-cols-2 gap-3">
        <Meta label={t("order_number")}>
          <span dir="ltr" className="font-display text-base text-ink">
            {orderNumber}
          </span>
        </Meta>
        {tableCode ? (
          <Meta label={pick("Table", "الطاولة", locale)}>
            <span dir="ltr" className="font-display text-base text-ink">
              {tableCode}
            </span>
          </Meta>
        ) : (
          <Meta label={t("est_ready")}>
            <span className="text-sm font-semibold text-ink">
              {finished ? "—" : `${localizeNumber(estimatedMinutes, locale)} ${t("minutes")}`}
            </span>
          </Meta>
        )}
      </div>

      {/* Stepper */}
      <div className="mx-6 mt-7">
        {list.map((s, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const last = i === list.length - 1;
          return (
            <div key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`relative grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition ${
                    done
                      ? "bg-saffron text-paper"
                      : isCurrent
                        ? "bg-saffron text-paper"
                        : "bg-paper-sunk text-ink-faint"
                  }`}
                >
                  {done ? (
                    <IconCheck width={16} height={16} />
                  ) : (
                    localizeNumber(i + 1, locale)
                  )}
                  {isCurrent && !finished && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-saffron/40" />
                  )}
                </span>
                {!last && (
                  <span
                    className={`my-1 w-0.5 flex-1 ${i < current ? "bg-saffron" : "bg-line"}`}
                    style={{ minHeight: 28 }}
                  />
                )}
              </div>
              <div className={`pb-6 ${isCurrent ? "" : "opacity-70"}`}>
                <p className={`text-sm ${isCurrent || done ? "font-semibold text-ink" : "font-medium text-ink-soft"}`}>
                  {pick(s.en, s.ar, locale)}
                </p>
                <p className="text-xs text-ink-faint">{pick(s.subEn, s.subAr, locale)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mx-6 mb-4 mt-1 rounded-xl bg-paper-sunk px-3 py-2 text-center text-[11px] text-ink-faint">
        {pick(
          "Updates automatically as the kitchen works on your order.",
          "يتم التحديث تلقائياً أثناء تحضير المطبخ لطلبك.",
          locale,
        )}
      </p>

      <div className="mt-auto border-t border-line bg-paper-raised px-5 py-4">
        <p className="mb-3 text-center text-xs text-ink-faint">
          {orderType === "TAKEAWAY"
            ? t("pay_at_counter")
            : orderType === "DELIVERY"
              ? pick("Pay on delivery", "ادفع عند الاستلام", locale)
              : t("pay_at_table")}
        </p>
        <button
          onClick={onNewOrder}
          className="w-full rounded-xl bg-saffron py-3.5 text-sm font-semibold text-paper transition hover:bg-saffron-deep"
        >
          {t("start_new_order")}
        </button>
      </div>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-paper-raised px-4 py-3">
      <p className="text-[11px] text-ink-faint">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
