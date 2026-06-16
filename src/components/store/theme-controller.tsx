"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import type { ColorScheme, Theme } from "@/lib/api/types";

/**
 * Runtime theming for the storefront. The merchant picks a light scheme and
 * (optionally) a dark scheme + a body text color in the POS editor; this
 * component injects them as CSS custom properties so every component recolors
 * from one place, and exposes a light/dark toggle when dark mode is enabled.
 *
 * The brand + text colors come from the merchant; the surface palette (paper /
 * lines) is supplied here so dark mode looks coherent without the merchant
 * having to choose a background.
 */

interface ThemeState {
  dark: boolean;
  toggleDark: () => void;
  /** Whether the merchant enabled a dark scheme (controls the toggle's visibility). */
  darkAvailable: boolean;
}

const ThemeCtx = createContext<ThemeState | null>(null);

/** CSS variables for one scheme. Surfaces differ between light and dark; brand
 *  + text come from the merchant's chosen colors. */
function schemeVars(s: ColorScheme, dark: boolean): CSSProperties {
  const paper = dark ? "#14171c" : "#ffffff";
  const paperRaised = dark ? "#1c2027" : "#ffffff";
  const paperSunk = dark ? "#242a33" : "oklch(0.97 0 0)";
  const line = dark ? "rgba(255,255,255,0.10)" : "oklch(0.922 0 0)";
  const tintBase = dark ? paperRaised : "#ffffff";
  const mix = (color: string, pct: number, base: string) =>
    `color-mix(in srgb, ${color} ${pct}%, ${base})`;
  return {
    "--saffron": s.primary,
    "--saffron-deep": s.primaryDeep,
    "--saffron-tint": mix(s.primary, dark ? 24 : 12, tintBase),
    "--olive": s.accent,
    "--olive-tint": mix(s.accent, dark ? 24 : 14, tintBase),
    // The merchant's text color applies in BOTH modes; soft/faint derive from it.
    "--ink": s.text,
    "--ink-soft": mix(s.text, 68, paper),
    "--ink-faint": mix(s.text, 44, paper),
    "--paper": paper,
    "--paper-raised": paperRaised,
    "--paper-sunk": paperSunk,
    "--line": line,
  } as CSSProperties;
}

export function ThemeController({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  const darkAvailable = theme.darkMode;
  const [dark, setDark] = useState(false);

  // Restore the visitor's last choice (only meaningful when dark is available).
  useEffect(() => {
    if (!darkAvailable) return;
    try {
      if (window.localStorage.getItem("recety.dark") === "1") setDark(true);
    } catch {
      /* ignore */
    }
  }, [darkAvailable]);

  const toggleDark = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("recety.dark", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const active = dark && darkAvailable;
  const vars = useMemo(
    () => schemeVars(active ? theme.dark : theme.light, active),
    [active, theme.dark, theme.light],
  );

  const value = useMemo<ThemeState>(
    () => ({ dark: active, toggleDark, darkAvailable }),
    [active, toggleDark, darkAvailable],
  );

  return (
    <ThemeCtx.Provider value={value}>
      {/* In dark mode paint the surface so the light body gradient never shows. */}
      <div style={vars} className={active ? "min-h-screen bg-paper" : undefined}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeController");
  return ctx;
}
