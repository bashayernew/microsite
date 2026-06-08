"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ActiveOrder, Branch, Locale, OrderType, Table, Tenant } from "@/lib/api/types";
import { addPrices, multiplyPrice, toFils } from "@/lib/format";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export interface CartModifier {
  id: string;
  name: string;
  nameAr: string;
  price: string;
}

export interface CartLine {
  /** Unique per configured line (product + variant + modifiers + notes). */
  lineId: string;
  productId: string;
  name: string;
  nameAr: string;
  image: string | null;
  variantId?: string;
  variantName?: string;
  variantNameAr?: string;
  /** Variant price, or product base price. KWD string. */
  unitBase: string;
  modifiers: CartModifier[];
  notes?: string;
  quantity: number;
}

/** Per-unit price including modifiers. */
export function lineUnitPrice(line: CartLine): string {
  return addPrices(line.unitBase, ...line.modifiers.map((m) => m.price));
}
export function lineTotal(line: CartLine): string {
  return multiplyPrice(lineUnitPrice(line), line.quantity);
}

interface StoreState {
  tenant: Tenant;
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;

  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
  branch: Branch;
  setBranch: (b: Branch) => void;
  /** Dine-in: the table the customer picked (shared by the entry gate + checkout). */
  table: Table | null;
  setTable: (tb: Table | null) => void;

  /** Has the customer passed the opening "How would you like it?" gate? */
  entryComplete: boolean;
  completeEntry: () => void;

  /** Orders placed this session that are still being tracked. */
  activeOrders: ActiveOrder[];
  addActiveOrder: (o: ActiveOrder) => void;
  ordersOpen: boolean;
  setOrdersOpen: (v: boolean) => void;

  lines: CartLine[];
  addLine: (line: Omit<CartLine, "lineId">) => void;
  updateLine: (lineId: string, updater: Partial<CartLine>) => void;
  setQuantity: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;

  count: number;
  subtotal: string;
}

const Ctx = createContext<StoreState | null>(null);

function signature(line: Omit<CartLine, "lineId" | "quantity">): string {
  const mods = [...line.modifiers].map((m) => m.id).sort().join(",");
  return [line.productId, line.variantId ?? "", mods, line.notes ?? ""].join("|");
}

export function StoreProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [orderType, setOrderType] = useState<OrderType>(tenant.orderTypes[0] ?? "TAKEAWAY");
  const [branch, setBranch] = useState<Branch>(tenant.branches[0]);
  const [table, setTable] = useState<Table | null>(null);
  const [entryComplete, setEntryComplete] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);

  const completeEntry = useCallback(() => setEntryComplete(true), []);
  const addActiveOrder = useCallback(
    (o: ActiveOrder) => setActiveOrders((prev) => [...prev, o]),
    [],
  );

  // A chosen table is only valid for the current order type + branch, so reset
  // it whenever either changes (the entry gate / checkout set it afterwards).
  useEffect(() => {
    setTable(null);
  }, [orderType, branch.id]);

  // Persist locale preference within the session.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("noor.locale") as Locale | null;
      if (saved === "en" || saved === "ar") setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem("noor.locale", l);
    } catch {
      /* ignore */
    }
  }, []);

  // Reflect locale on <html> for direction + lang.
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const toggleLocale = useCallback(
    () => setLocale(locale === "en" ? "ar" : "en"),
    [locale, setLocale],
  );

  const addLine = useCallback((line: Omit<CartLine, "lineId">) => {
    setLines((prev) => {
      const sig = signature(line);
      const existing = prev.find(
        (l) => signature(l) === sig,
      );
      if (existing) {
        return prev.map((l) =>
          l.lineId === existing.lineId
            ? { ...l, quantity: l.quantity + line.quantity }
            : l,
        );
      }
      return [
        ...prev,
        { ...line, lineId: Math.random().toString(36).slice(2, 10) },
      ];
    });
  }, []);

  const updateLine = useCallback((lineId: string, updater: Partial<CartLine>) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, ...updater } : l)),
    );
  }, []);

  const setQuantity = useCallback((lineId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.lineId !== lineId)
        : prev.map((l) => (l.lineId === lineId ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const removeLine = useCallback(
    (lineId: string) => setLines((prev) => prev.filter((l) => l.lineId !== lineId)),
    [],
  );

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(
    () => lines.reduce((acc, l) => acc + l.quantity, 0),
    [lines],
  );

  const subtotal = useMemo(
    () => addPrices(...lines.map((l) => lineTotal(l))),
    [lines],
  );

  const value: StoreState = {
    tenant,
    locale,
    setLocale,
    toggleLocale,
    orderType,
    setOrderType,
    branch,
    setBranch,
    table,
    setTable,
    entryComplete,
    completeEntry,
    activeOrders,
    addActiveOrder,
    ordersOpen,
    setOrdersOpen,
    lines,
    addLine,
    updateLine,
    setQuantity,
    removeLine,
    clear,
    count,
    subtotal,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { toFils };
