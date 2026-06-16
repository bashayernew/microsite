@import "tailwindcss";

/* ────────────────────────────────────────────────────────────────────────
   Design tokens — matched to the Recety POS theme.
   Calm indigo-blue primary, white surfaces over a faint cool gradient,
   Inter (EN) / Tajawal (AR), light-grey borders, soft shadows.
   (Token names are kept from the previous theme; only the values changed,
   so every component re-themes automatically.)
   ──────────────────────────────────────────────────────────────────────── */
:root {
  --paper: #ffffff;
  --paper-raised: #ffffff;
  --paper-sunk: oklch(0.97 0 0);
  --ink: oklch(0.145 0 0);
  --ink-soft: oklch(0.556 0 0);
  --ink-faint: oklch(0.7 0 0);
  --line: oklch(0.922 0 0);

  /* primary = POS brand blue */
  --saffron: oklch(0.6232 0.2118 264.05);
  --saffron-deep: oklch(0.55 0.2 264.05);
  --saffron-tint: oklch(0.96 0.02 264);
  /* secondary green (veg / open) */
  --olive: oklch(0.62 0.13 162);
  --olive-tint: oklch(0.95 0.03 162);
  /* warm accent (rating) */
  --gold: oklch(0.8 0.14 80);

  --ok: oklch(0.62 0.15 150);
  --ok-tint: oklch(0.95 0.03 150);

  --shadow-sm: 0 1px 2px rgba(20, 30, 60, 0.05), 0 1px 3px rgba(20, 30, 60, 0.04);
  --shadow-md: 0 6px 20px rgba(20, 30, 60, 0.07), 0 2px 6px rgba(20, 30, 60, 0.04);
  --shadow-lg: 0 20px 50px rgba(20, 30, 60, 0.14), 0 6px 18px rgba(20, 30, 60, 0.07);

  /* Fonts mirror the POS: Tajawal default, Inter when lang=en. */
  --app-font-sans: "Tajawal", sans-serif;
  --font-sans: var(--app-font-sans);
  --font-display: var(--app-font-sans);
}

html[lang="en"] {
  --app-font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-feature-settings: "cv11", "ss01";
  font-variant-numeric: tabular-nums;
}
html[lang="ar"] {
  --app-font-sans: "Tajawal", sans-serif;
}

@theme inline {
  --color-paper: var(--paper);
  --color-paper-raised: var(--paper-raised);
  --color-paper-sunk: var(--paper-sunk);
  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --color-ink-faint: var(--ink-faint);
  --color-line: var(--line);
  --color-saffron: var(--saffron);
  --color-saffron-deep: var(--saffron-deep);
  --color-saffron-tint: var(--saffron-tint);
  --color-olive: var(--olive);
  --color-olive-tint: var(--olive-tint);
  --color-gold: var(--gold);
  --color-ok: var(--ok);
  --color-ok-tint: var(--ok-tint);
  --font-sans: var(--app-font-sans);
  --font-display: var(--app-font-sans);
}

* {
  border-color: var(--line);
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  color: var(--ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* POS app-shell: white with a faint cool gradient. */
  background-color: #ffffff;
  background-image: linear-gradient(
    to bottom right,
    #f8fafc 0%,
    rgba(239, 246, 255, 0.5) 50%,
    rgba(240, 253, 250, 0.55) 100%
  );
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.font-display {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.015em;
}

.grain {
  background-image: radial-gradient(rgba(20, 30, 60, 0.04) 1px, transparent 1px);
  background-size: 4px 4px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes float-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-float-up { animation: float-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }

@keyframes sheet-in {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-sheet { animation: sheet-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fade-in 0.25s ease both; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
