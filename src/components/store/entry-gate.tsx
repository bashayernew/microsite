"use client";

import { useEffect, useState } from "react";
import type { DiningArea, OrderType, Table } from "@/lib/api/types";
import { getTables } from "@/lib/api/client";
import { pick, makeT } from "@/lib/i18n";
import { localizeNumber } from "@/lib/format";
import { useStore } from "@/components/store-provider";
import { IconPin, IconBack } from "@/components/ui/icons";

/**
 * Opening "How would you like it?" gate shown before the menu. Sets the order
 * type + branch (and, for dine-in, the table) into the shared store, then
 * reveals the menu. Other types go straight to the menu.
 */
export function EntryGate() {
  const store = useStore();
  const { locale, tenant } = store;
  const t = makeT(locale);
  const isDineIn = store.orderType === "DINE_IN";

  const [step, setStep] = useState<"type" | "table">("type");
  const [areas, setAreas] = useState<DiningArea[]>([]);

  useEffect(() => {
    let alive = true;
    if (isDineIn && step === "table") {
      getTables(store.tenant.slug, store.branch.id).then((a) => alive && setAreas(a));
    }
    return () => {
      alive = false;
    };
  }, [isDineIn, step, store.tenant.slug, store.branch.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function onContinue() {
    if (isDineIn) setStep("table");
    else store.completeEntry();
  }

  const branchLabel =
    store.orderType === "TAKEAWAY"
      ? t("pickup_branch")
      : isDineIn
        ? t("dinein_branch")
        : pick("Delivering from", "التوصيل من", locale);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" />
      <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-paper shadow-lg animate-sheet sm:max-w-md sm:rounded-3xl sm:animate-fade-in">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          {step === "table" && (
            <button
              onClick={() => setStep("type")}
              aria-label={t("back_to_menu")}
              className="grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:bg-paper-sunk rtl:rotate-180"
            >
              <IconBack />
            </button>
          )}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-saffron font-display text-base text-paper">
            {pick(tenant.businessName, tenant.businessNameAr, locale).charAt(0)}
          </span>
          <span className="font-display text-lg text-ink">
            {pick(tenant.businessName, tenant.businessNameAr, locale)}
          </span>
        </div>

        {step === "type" ? (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <section>
                <h3 className="mb-2 text-sm font-semibold text-ink">{t("order_type")}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {tenant.orderTypes.map((ot) => (
                    <TypeBtn
                      key={ot}
                      type={ot}
                      active={store.orderType === ot}
                      label={
                        ot === "TAKEAWAY"
                          ? t("takeaway")
                          : ot === "DINE_IN"
                            ? t("dine_in")
                            : pick("Delivery", "توصيل", locale)
                      }
                      onClick={() => store.setOrderType(ot)}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-ink">{branchLabel}</h3>
                <div className="grid gap-2">
                  {tenant.branches.map((b) => {
                    const activeB = store.branch.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => store.setBranch(b)}
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
              </section>
            </div>
            <div className="border-t border-line bg-paper-raised px-5 py-4">
              <button
                onClick={onContinue}
                className="w-full rounded-xl bg-saffron py-3.5 text-sm font-semibold text-paper transition hover:bg-saffron-deep"
              >
                {isDineIn
                  ? pick("Choose your table", "اختر طاولتك", locale)
                  : pick("Browse the menu", "تصفح القائمة", locale)}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-ink">
                  {pick("Choose your table", "اختر طاولتك", locale)}
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
                        <Chip
                          key={tb.id}
                          table={tb}
                          active={store.table?.id === tb.id}
                          locale={locale}
                          onPick={() =>
                            store.setTable(store.table?.id === tb.id ? null : tb)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-line bg-paper-raised px-5 py-4">
              <button
                onClick={store.completeEntry}
                className="w-full rounded-xl bg-saffron py-3.5 text-sm font-semibold text-paper transition hover:bg-saffron-deep"
              >
                {store.table
                  ? `${t("continue")} · ${store.table.code}`
                  : pick("Continue without a table", "المتابعة بدون طاولة", locale)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TypeBtn({
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
      className={`rounded-xl border px-2 py-3.5 text-center transition ${
        active ? "border-saffron bg-saffron-tint" : "border-line bg-paper-raised hover:border-ink-faint"
      }`}
    >
      <span className="block text-2xl">{emoji}</span>
      <span className={`mt-1 block text-xs font-semibold ${active ? "text-saffron" : "text-ink"}`}>
        {label}
      </span>
    </button>
  );
}

function Chip({
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
    </button>
  );
}
