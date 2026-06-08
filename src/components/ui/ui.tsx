"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/api/types";
import { formatMoney, localizeNumber } from "@/lib/format";
import { IconMinus, IconPlus, IconClose } from "./icons";

/* ── Sheet / Modal ───────────────────────────────────────────────────────── */

export function Sheet({
  open,
  onClose,
  children,
  ariaLabel,
  placement = "drawer",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  placement?: "drawer" | "modal";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const outer =
    placement === "drawer"
      ? "items-end sm:items-stretch sm:justify-end"
      : "items-end sm:items-center sm:justify-center";
  const panel =
    placement === "drawer"
      ? "w-full sm:h-full sm:max-w-md rounded-t-3xl sm:rounded-none"
      : "w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={`fixed inset-0 z-50 flex ${outer}`}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
      />
      <div
        className={`relative z-10 flex max-h-[92vh] flex-col bg-paper shadow-lg animate-sheet sm:animate-fade-in ${panel}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function SheetHeader({
  title,
  onClose,
}: {
  title: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <button
        onClick={onClose}
        aria-label="Close"
        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition hover:bg-paper-sunk hover:text-ink"
      >
        <IconClose />
      </button>
    </div>
  );
}

/* ── Quantity stepper ────────────────────────────────────────────────────── */

export function QtyStepper({
  value,
  onChange,
  locale,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  locale: Locale;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-paper-raised p-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-paper-sunk disabled:opacity-30"
        disabled={value <= min}
      >
        <IconMinus width={16} height={16} />
      </button>
      <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
        {localizeNumber(value, locale)}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper transition hover:bg-saffron"
      >
        <IconPlus width={16} height={16} />
      </button>
    </div>
  );
}

/* ── Money ───────────────────────────────────────────────────────────────── */

export function Money({
  amount,
  locale,
  className = "",
  showCurrency = true,
}: {
  amount: string;
  locale: Locale;
  className?: string;
  showCurrency?: boolean;
}) {
  const cur = locale === "ar" ? "د.ك" : "KWD";
  return (
    <span className={`tabular-nums ${className}`}>
      {showCurrency && (
        <span className="text-[0.7em] font-medium text-ink-faint">{cur} </span>
      )}
      {formatMoney(amount, locale)}
    </span>
  );
}

/* ── Badge ───────────────────────────────────────────────────────────────── */

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "saffron" | "olive" | "gold";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-paper-sunk text-ink-soft",
    saffron: "bg-saffron-tint text-saffron-deep",
    olive: "bg-olive-tint text-olive",
    gold: "bg-[#f6edda] text-[#8a651f]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
