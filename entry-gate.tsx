/* ============================================================
   Nuwwar template — design system, scoped under `.nuwwar`.
   Ported from the Nuwwar reference site; every selector is prefixed with
   `.nuwwar`, so these rules are inert unless an element carries that class.
   The storefront applies `.nuwwar` on every tenant's store root, so this is
   the shared template for all microsites.

   Brand colors are bridged to each tenant's theme below, so the merchant's
   Storefront → Brand colors still drive the palette per store; the Nuwwar
   greens are only fallbacks. Surfaces / ink / fonts / motion are the Nuwwar
   design and shared by everyone.
   ============================================================ */
/* ============================================================
   Nuwwar — Restaurant Micro-Site
   Design system: Recety-inspired, warmed for hospitality.
   ============================================================ */

/* ---------- Fonts ---------- */
/* Display serif: Cormorant (Latin) + Amiri (Arabic)
   Body/UI:       Manrope (Latin) + IBM Plex Sans Arabic
   Numerals:      JetBrains Mono                                */

.nuwwar {
  /* clean white base — cool neutral, no warmth */
  --bg:            #FFFFFF;
  --bg-2:          #F2F3F5;
  --surface:       #FFFFFF;
  --surface-2:     #F6F7F9;
  --line:          #E8EAED;
  --line-strong:   #D5D9DF;

  --ink:           #16181C;   /* cool near-black */
  --ink-2:         #4B515A;   /* cool grey       */
  --ink-3:         #868D97;   /* muted           */

  /* restrained cool-neutral accents — shared chroma, varied hue */
  --primary:       #3F6B54;   /* deep sage green */
  --primary-deep:  #335845;
  --primary-soft:  #E7EEEA;
  --accent:        #5E6B4F;   /* olive */
  --accent-soft:   #E9ECE4;
  --olive:         #5E6B4F;   /* herb green */
  --olive-soft:    #E9ECE4;

  --success:       #2E7D52;
  --danger:        #C0402F;

  /* heading font, swappable via tweaks */
  --font-display:  "Cormorant", "Amiri", Georgia, serif;
  --font-body:     "Manrope", "IBM Plex Sans Arabic", system-ui, sans-serif;
  --font-mono:     "JetBrains Mono", ui-monospace, monospace;
  --font-ar-display: "Amiri", "Cormorant", serif;

  --radius:        14px;
  --radius-sm:     8px;
  --radius-lg:     22px;
  --radius-pill:   999px;

  --shadow-1: 0 1px 2px rgba(18, 22, 28, .05), 0 1px 3px rgba(18, 22, 28, .06);
  --shadow-2: 0 6px 16px rgba(18, 22, 28, .08), 0 2px 6px rgba(18, 22, 28, .06);
  --shadow-pop: 0 24px 60px rgba(18, 22, 28, .16), 0 8px 24px rgba(18, 22, 28, .09);

  --maxw: 1200px;
  --ease: cubic-bezier(.4, 0, .2, 1);
}

[data-theme="dark"] .nuwwar {
  --bg:            #16120D;   /* warm charcoal */
  --bg-2:          #1C1812;
  --surface:       #211C15;
  --surface-2:     #272118;
  --line:          #342C20;
  --line-strong:   #463B2C;

  --ink:           #F3ECDF;
  --ink-2:         #C3B7A4;
  --ink-3:         #8F8473;

  --primary:       #E08A66;
  --primary-deep:  #C9714C;
  --primary-soft:  #3A271D;
  --accent:        #EBB454;
  --accent-soft:   #3A2F19;
  --olive:         #9DAA87;
  --olive-soft:    #2A3022;

  --success:       #5FB985;
  --danger:        #E5705F;

  --shadow-1: 0 1px 2px rgba(0,0,0,.4);
  --shadow-2: 0 8px 22px rgba(0,0,0,.45);
  --shadow-pop: 0 28px 70px rgba(0,0,0,.6), 0 8px 24px rgba(0,0,0,.4);
}

/* ---------- Reset ---------- */
.nuwwar * { box-sizing: border-box; }
.nuwwar { scroll-behavior: smooth; scroll-padding-top: 84px; }
.nuwwar {
  margin: 0;
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  transition: background .4s var(--ease), color .4s var(--ease);
}
.nuwwar img { display: block; max-width: 100%; }
.nuwwar a { color: inherit; text-decoration: none; }
.nuwwar button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
.nuwwar ul { margin: 0; padding: 0; list-style: none; }
.nuwwar :focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; border-radius: 4px; }

/* numbers everywhere tabular */
.nuwwar .num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; letter-spacing: -.01em; }

/* ---------- Typography helpers ---------- */
.nuwwar .display {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -.01em;
}
.nuwwar [dir="rtl"] .display { font-family: var(--font-ar-display); font-weight: 700; line-height: 1.18; letter-spacing: 0; }

.nuwwar .eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--primary);
}
.nuwwar [dir="rtl"] .eyebrow { letter-spacing: .08em; }

.nuwwar .section-wrap { max-width: var(--maxw); margin: 0 auto; padding: 0 28px; }

/* ============================================================
   App shell
   ============================================================ */
.nuwwar .app { min-height: 100vh; }

/* ---- Nav ---- */
.nuwwar .nav {
  position: sticky; top: 0; z-index: 50;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: saturate(1.4) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color .3s var(--ease), background .3s var(--ease);
}
.nuwwar .nav.scrolled { border-bottom-color: var(--line); }
.nuwwar .nav-inner {
  max-width: var(--maxw); margin: 0 auto;
  height: 68px; padding: 0 28px;
  display: flex; align-items: center; gap: 22px;
}
.nuwwar .brand { display: flex; align-items: center; gap: 11px; }
.nuwwar .brand-mark {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--primary); color: #fff;
  display: grid; place-items: center;
  font-family: var(--font-display); font-weight: 700; font-size: 20px;
  box-shadow: var(--shadow-1);
}
.nuwwar .brand-name { font-family: var(--font-display); font-weight: 700; font-size: 23px; line-height: 1; }
.nuwwar [dir="rtl"] .brand-name { font-family: var(--font-ar-display); }

.nuwwar .nav-links { display: flex; align-items: center; gap: 4px; margin-inline-start: 10px; }
.nuwwar .nav-link {
  padding: 8px 13px; border-radius: var(--radius-pill);
  font-size: 14.5px; font-weight: 600; color: var(--ink-2);
  transition: color .2s var(--ease), background .2s var(--ease);
}
.nuwwar .nav-link:hover { color: var(--ink); background: var(--surface-2); }

.nuwwar .nav-right { margin-inline-start: auto; display: flex; align-items: center; gap: 8px; }

.nuwwar .icon-btn {
  width: 40px; height: 40px; border-radius: var(--radius-pill);
  display: grid; place-items: center; color: var(--ink-2);
  border: 1px solid var(--line); background: var(--surface);
  transition: all .2s var(--ease);
}
.nuwwar .icon-btn:hover { color: var(--ink); border-color: var(--line-strong); transform: translateY(-1px); }
.nuwwar .icon-btn svg { width: 18px; height: 18px; }

.nuwwar .lang-btn {
  height: 40px; padding: 0 14px; border-radius: var(--radius-pill);
  border: 1px solid var(--line); background: var(--surface);
  font-weight: 700; font-size: 13px; color: var(--ink-2);
  display: flex; align-items: center; gap: 7px;
  transition: all .2s var(--ease);
}
.nuwwar .lang-btn:hover { color: var(--ink); border-color: var(--line-strong); }

/* buttons */
.nuwwar .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  height: 46px; padding: 0 22px; border-radius: var(--radius-pill);
  font-weight: 700; font-size: 15px; white-space: nowrap;
  transition: transform .15s var(--ease), box-shadow .2s var(--ease), background .2s var(--ease), border-color .2s var(--ease);
}
.nuwwar .btn svg { width: 17px; height: 17px; }
.nuwwar .btn-primary { background: var(--primary); color: #fff; box-shadow: var(--shadow-1); }
.nuwwar .btn-primary:hover { background: var(--primary-deep); box-shadow: var(--shadow-2); transform: translateY(-1px); }
.nuwwar .btn-ghost { background: var(--surface); color: var(--ink); border: 1px solid var(--line-strong); }
.nuwwar .btn-ghost:hover { background: var(--surface-2); transform: translateY(-1px); }
.nuwwar .btn-sm { height: 40px; padding: 0 17px; font-size: 14px; }
.nuwwar .btn-lg { height: 54px; padding: 0 28px; font-size: 16.5px; }

.nuwwar .nav-cta { display: inline-flex; }

/* mobile nav */
.nuwwar .burger { display: none; }
.nuwwar .mobile-menu {
  position: fixed; inset: 68px 0 auto 0; z-index: 49;
  background: var(--surface); border-bottom: 1px solid var(--line);
  box-shadow: var(--shadow-2);
  padding: 14px 28px 22px;
  display: flex; flex-direction: column; gap: 4px;
  transform: translateY(-12px); opacity: 0; pointer-events: none;
  transition: transform .26s var(--ease), opacity .26s var(--ease);
}
.nuwwar .mobile-menu.open { transform: none; opacity: 1; pointer-events: auto; }
.nuwwar .mobile-menu a { padding: 13px 6px; font-size: 17px; font-weight: 600; border-bottom: 1px solid var(--line); }
.nuwwar .mobile-menu .btn { margin-top: 14px; }

/* ============================================================
   Hero Slider (top carousel)
   ============================================================ */
.nuwwar .hero-slider {
  position: relative; overflow: hidden; background: var(--ink);
  height: clamp(380px, 56vh, 560px);
}
.nuwwar .slider-track { display: flex; height: 100%; transition: transform .7s cubic-bezier(.65,.05,.1,1); }
.nuwwar .slide { position: relative; flex: 0 0 100%; height: 100%; overflow: hidden; }
.nuwwar .slide-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.nuwwar .slide-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(15,17,20,.78) 0%, rgba(15,17,20,.5) 42%, rgba(15,17,20,.12) 80%);
}
.nuwwar [dir="rtl"] .slide-scrim {
  background: linear-gradient(270deg, rgba(15,17,20,.78) 0%, rgba(15,17,20,.5) 42%, rgba(15,17,20,.12) 80%);
}
.nuwwar .slide-inner { position: relative; height: 100%; display: flex; align-items: center; }
.nuwwar .slide-copy { max-width: 30em; color: #fff; }
.nuwwar .slide-copy .eyebrow.on-dark { color: color-mix(in srgb, var(--primary) 55%, #fff); }
.nuwwar .slide-copy h2 {
  font-size: clamp(34px, 5vw, 62px); margin: 12px 0 0; color: #fff; line-height: 1.05;
}
.nuwwar .slide-copy p { font-size: clamp(15px, 1.4vw, 19px); color: rgba(255,255,255,.82); margin: 14px 0 26px; line-height: 1.55; }
/* entrance: copy of the active slide */
.nuwwar .slide-copy { opacity: 0; transform: translateY(16px); transition: opacity .6s ease .15s, transform .6s ease .15s; }
.nuwwar .slide-copy.in { opacity: 1; transform: none; }

.nuwwar .slider-arrow {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
  width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center;
  background: rgba(255,255,255,.16); color: #fff; border: 1px solid rgba(255,255,255,.3);
  cursor: pointer; backdrop-filter: blur(6px); transition: background .2s;
}
.nuwwar .slider-arrow:hover { background: rgba(255,255,255,.3); }
.nuwwar .slider-arrow svg { width: 20px; height: 20px; }
.nuwwar .slider-arrow.prev { inset-inline-start: 22px; }
.nuwwar .slider-arrow.next { inset-inline-end: 22px; }

.nuwwar .slider-dots { position: absolute; inset-inline: 0; bottom: 20px; display: flex; gap: 9px; justify-content: center; z-index: 3; }
.nuwwar .s-dot { width: 9px; height: 9px; border-radius: 50%; border: none; cursor: pointer; padding: 0;
  background: rgba(255,255,255,.45); transition: all .3s; }
.nuwwar .s-dot.active { background: #fff; width: 26px; border-radius: 5px; }

@media (max-width: 760px) {
  .nuwwar .hero-slider { height: clamp(320px, 64vh, 460px); }
  .nuwwar .slider-arrow { width: 40px; height: 40px; }
}

/* ============================================================
   Hero
   ============================================================ */
.nuwwar .hero { position: relative; padding: 56px 0 40px; }
.nuwwar .hero-grid {
  display: grid; grid-template-columns: 1.05fr .95fr; gap: 48px; align-items: center;
}
.nuwwar .hero-status {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 7px 14px 7px 11px; border-radius: var(--radius-pill);
  background: var(--surface); border: 1px solid var(--line);
  font-size: 13px; font-weight: 600; color: var(--ink-2);
  box-shadow: var(--shadow-1);
}
.nuwwar .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--success); position: relative; }
.nuwwar .dot::after { content: ""; position: absolute; inset: -4px; border-radius: 50%; background: var(--success); opacity: .35; animation: ping 2.4s ease-out infinite; }
@keyframes ping { 0% { transform: scale(.6); opacity: .5; } 80%,100% { transform: scale(1.9); opacity: 0; } }
.nuwwar .dot.closed { background: var(--ink-3); }
.nuwwar .dot.closed::after { display: none; }

.nuwwar .hero h1 { font-size: clamp(50px, 7vw, 92px); margin: 22px 0 0; }
.nuwwar [dir="rtl"] .hero h1 { font-size: clamp(44px, 6.2vw, 80px); }
.nuwwar .hero .lede { font-size: clamp(17px, 1.5vw, 20px); color: var(--ink-2); max-width: 30em; margin: 20px 0 0; line-height: 1.6; }
.nuwwar .hero-cta { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; }
.nuwwar .hero-facts { display: flex; gap: 26px; margin-top: 34px; flex-wrap: wrap; }
.nuwwar .fact { display: flex; flex-direction: column; gap: 3px; }
.nuwwar .fact .k { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
.nuwwar .fact .v { font-size: 16px; font-weight: 700; }
.nuwwar [dir="rtl"] .fact .k { letter-spacing: .02em; }

.nuwwar .hero-media { position: relative; }
.nuwwar .hero-img { width: 100%; aspect-ratio: 4 / 5; border-radius: var(--radius-lg); box-shadow: var(--shadow-pop); object-fit: cover; background: var(--surface-2); }
.nuwwar .hero-badge {
  position: absolute; bottom: -18px; inset-inline-start: -18px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 14px 18px; box-shadow: var(--shadow-2);
  display: flex; align-items: center; gap: 13px;
}
.nuwwar .hero-badge .stars { color: var(--accent); font-size: 15px; letter-spacing: 2px; }
.nuwwar .hero-badge .r { font-family: var(--font-mono); font-weight: 700; font-size: 22px; }
.nuwwar .hero-badge .sub { font-size: 12px; color: var(--ink-3); font-weight: 600; }

/* ============================================================
   Section heading
   ============================================================ */
.nuwwar .section { padding: 86px 0; }
.nuwwar .section.tight { padding: 64px 0; }
.nuwwar .section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 44px; flex-wrap: wrap; }
.nuwwar .section-head h2 { font-size: clamp(34px, 4vw, 52px); margin: 10px 0 0; }
.nuwwar .section-head .sub { color: var(--ink-2); font-size: 16px; max-width: 38em; margin-top: 12px; line-height: 1.6; }

/* ============================================================
   Menu
   ============================================================ */
.nuwwar .menu-tabs { display: flex; gap: 9px; flex-wrap: wrap; margin-bottom: 36px; }
.nuwwar .menu-tab {
  padding: 9px 18px; border-radius: var(--radius-pill);
  border: 1px solid var(--line); background: var(--surface);
  font-weight: 700; font-size: 14px; color: var(--ink-2);
  transition: all .18s var(--ease);
}
.nuwwar .menu-tab:hover { border-color: var(--line-strong); color: var(--ink); }
.nuwwar .menu-tab.active { background: var(--ink); color: var(--bg); border-color: var(--ink); }

.nuwwar .menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 56px; }
.nuwwar .menu-item {
  display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;
  padding: 18px 0; border-bottom: 1px solid var(--line);
}
.nuwwar .menu-item .mi-add {
  flex: none; width: 38px; height: 38px; border-radius: 50%;
  border: 1.5px solid var(--line-strong); background: var(--surface); color: var(--ink);
  display: grid; place-items: center; cursor: pointer; align-self: center;
  transition: background .18s ease, color .18s ease, border-color .18s ease, transform .18s ease;
}
.nuwwar .menu-item .mi-add svg { width: 20px; height: 20px; }
.nuwwar .menu-item .mi-add:hover { background: var(--primary); border-color: var(--primary); color: #fff; transform: scale(1.08); }

.nuwwar .menu-more-wrap { display: flex; justify-content: center; margin-top: 32px; }
.nuwwar .menu-more {
  display: inline-flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 13px 26px; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 600;
  border: 1.5px solid var(--line-strong); background: var(--surface); color: var(--ink);
  transition: background .18s ease, border-color .18s ease, color .18s ease;
}
.nuwwar .menu-more:hover { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.nuwwar .menu-more svg { width: 18px; height: 18px; transition: transform .2s ease; }
.nuwwar .menu-item .mi-thumb {
  width: 78px; height: 78px; border-radius: var(--radius); object-fit: cover;
  background: var(--surface-2); box-shadow: var(--shadow-1); flex: none;
  cursor: zoom-in; transition: transform .25s ease, box-shadow .25s ease;
}
.nuwwar .menu-item .mi-thumb:hover { transform: scale(1.05); box-shadow: var(--shadow-2); }

/* ---------- Image lightbox ---------- */
.nuwwar .img-lightbox {
  position: fixed; inset: 0; z-index: 120; display: grid; place-items: center;
  padding: 24px; background: rgba(15, 17, 20, .72);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: lb-fade .2s ease both;
}
@keyframes lb-fade { from { opacity: 0; } to { opacity: 1; } }
.nuwwar .lb-figure {
  margin: 0; max-width: min(560px, 92vw); width: 100%; background: var(--surface);
  border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-pop);
  animation: lb-pop .26s cubic-bezier(.2,.9,.3,1.2) both;
}
@keyframes lb-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }
.nuwwar .lb-figure img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: var(--surface-2); }
.nuwwar .lb-figure.video { max-width: min(880px, 94vw); }
.nuwwar .lb-figure.video video { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: #000; }
.nuwwar .lb-figure figcaption { padding: 18px 22px 22px; display: flex; flex-direction: column; gap: 4px; }
.nuwwar .lb-name { font-family: var(--font-display); font-weight: 600; font-size: 24px; color: var(--ink); }
.nuwwar [dir="rtl"] .lb-name { font-family: var(--font-ar-display); font-weight: 700; }
.nuwwar .lb-desc { color: var(--ink-2); font-size: 15px; line-height: 1.5; }
.nuwwar .lb-close {
  position: fixed; top: 18px; inset-inline-end: 18px; z-index: 121;
  width: 46px; height: 46px; border-radius: 50%; border: 0; cursor: pointer;
  background: var(--surface); color: var(--ink); font-size: 26px; line-height: 1;
  box-shadow: var(--shadow-2); display: grid; place-items: center;
  transition: transform .15s ease;
}
.nuwwar .lb-close:hover { transform: scale(1.08); }
.nuwwar .menu-item .mi-text { min-width: 0; }
.nuwwar .menu-item .mi-top { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; }
.nuwwar .menu-item .mi-name { font-family: var(--font-display); font-weight: 600; font-size: 23px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.nuwwar [dir="rtl"] .menu-item .mi-name { font-family: var(--font-ar-display); font-weight: 700; }
.nuwwar .menu-item .mi-price { font-family: var(--font-mono); font-weight: 600; font-size: 17px; color: var(--primary); white-space: nowrap; }
.nuwwar .menu-item .mi-price small { color: var(--ink-3); font-size: 11px; font-weight: 600; }
.nuwwar .menu-item .mi-desc { color: var(--ink-2); font-size: 14.5px; line-height: 1.55; max-width: 42em; margin-top: 4px; }
.nuwwar .tag {
  font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
  padding: 3px 8px; border-radius: var(--radius-pill);
  font-family: var(--font-body);
}
.nuwwar .tag.pop { background: var(--primary-soft); color: var(--primary-deep); }
.nuwwar .tag.veg { background: var(--olive-soft); color: var(--olive); }
.nuwwar .tag.spicy { background: var(--accent-soft); color: var(--accent); }

/* ============================================================
   Hours
   ============================================================ */
.nuwwar .split { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.nuwwar .card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-1);
}
.nuwwar .hours-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 4px; border-bottom: 1px solid var(--line); gap: 16px;
}
.nuwwar .hours-row:last-child { border-bottom: none; }
.nuwwar .hours-row.today { background: var(--primary-soft); margin: 0 -14px; padding: 14px 18px; border-radius: var(--radius); border-bottom: none; }
.nuwwar .hours-row .day { font-weight: 700; font-size: 15.5px; display: flex; align-items: center; gap: 10px; }
.nuwwar .hours-row .badge-today { font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--primary-deep); background: var(--surface); padding: 3px 8px; border-radius: var(--radius-pill); }
.nuwwar .hours-row .time { font-family: var(--font-mono); font-weight: 600; font-size: 14.5px; color: var(--ink-2); }
.nuwwar .hours-row.closed .time { color: var(--ink-3); }

/* ============================================================
   Location
   ============================================================ */
.nuwwar .map-wrap { position: relative; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--line); box-shadow: var(--shadow-1); min-height: 340px; }
.nuwwar .map-canvas { position: absolute; inset: 0; background:
    repeating-linear-gradient(0deg, transparent 0 38px, var(--line) 38px 39px),
    repeating-linear-gradient(90deg, transparent 0 38px, var(--line) 38px 39px),
    var(--surface-2);
}
.nuwwar .map-road { position: absolute; background: var(--bg-2); }
.nuwwar .map-pin {
  position: absolute; top: 50%; inset-inline-start: 50%; transform: translate(-50%, -100%);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.nuwwar [dir="rtl"] .map-pin { transform: translate(50%, -100%); }
.nuwwar .pin-head {
  background: var(--primary); color: #fff; padding: 9px 15px; border-radius: var(--radius-pill);
  font-weight: 700; font-size: 13px; box-shadow: var(--shadow-2); white-space: nowrap;
}
.nuwwar .pin-stem { width: 2px; height: 16px; background: var(--primary); }
.nuwwar .pin-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--primary); border: 3px solid var(--surface); box-shadow: var(--shadow-1); }

.nuwwar .info-line { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--line); align-items: flex-start; }
.nuwwar .info-line:last-child { border-bottom: none; }
.nuwwar .info-line .ico { width: 38px; height: 38px; flex: none; border-radius: 11px; background: var(--surface-2); display: grid; place-items: center; color: var(--primary); }
.nuwwar .info-line .ico svg { width: 18px; height: 18px; }
.nuwwar .info-line .k { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
.nuwwar .info-line .v { font-size: 16px; font-weight: 600; margin-top: 2px; }
.nuwwar [dir="rtl"] .info-line .k { letter-spacing: .02em; }

.nuwwar .anchor-spot { position: absolute; margin-top: -90px; }
.nuwwar .contact-main { padding-top: 84px; }
.nuwwar .contact-main .section:first-child { padding-top: 28px; }
.nuwwar .contact-card { margin-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.nuwwar .contact-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 28px; flex: 1; min-width: 0; }
.nuwwar .contact-strip .info-line { border-bottom: none; padding: 8px 0; }
.nuwwar .directions-btn { flex: none; white-space: nowrap; }
@media (max-width: 760px) {
  .nuwwar .contact-card { flex-direction: column; align-items: stretch; }
  .nuwwar .contact-strip { grid-template-columns: 1fr 1fr; }
  .nuwwar .directions-btn { width: 100%; justify-content: center; }
}
@media (max-width: 460px) {
  .nuwwar .contact-strip { grid-template-columns: 1fr; }
}

/* ============================================================
   Gallery
   ============================================================ */
.nuwwar .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 210px; gap: 14px; }
.nuwwar .gallery-grid image-slot { width: 100%; height: 100%; box-shadow: var(--shadow-1); }
.nuwwar .gallery-grid img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; box-shadow: var(--shadow-1); background: var(--surface-2); cursor: zoom-in; transition: transform .3s ease, box-shadow .3s ease; }
.nuwwar .gallery-grid img:hover { transform: scale(1.015); box-shadow: var(--shadow-2); }
.nuwwar .g-tall { grid-row: span 2; }
.nuwwar .g-wide { grid-column: span 2; }
.nuwwar .g-feat { grid-column: span 2; grid-row: span 2; }

.nuwwar .g-video {
  position: relative; margin: 0; border-radius: 16px; overflow: hidden;
  box-shadow: var(--shadow-2); background: var(--ink); cursor: zoom-in;
}
.nuwwar .g-video video { width: 100%; height: 100%; object-fit: cover; display: block; }
.nuwwar .g-zoom {
  position: absolute; top: 14px; inset-inline-end: 14px; z-index: 3;
  width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
  background: rgba(255,255,255,.92); color: var(--ink); box-shadow: var(--shadow-1);
  opacity: 0; transform: scale(.85); transition: opacity .2s ease, transform .2s ease;
}
.nuwwar .g-video:hover .g-zoom { opacity: 1; transform: scale(1); }
.nuwwar .g-zoom svg { width: 20px; height: 20px; }
.nuwwar .g-video figcaption {
  position: absolute; inset-inline-start: 16px; bottom: 14px; z-index: 2;
  display: inline-flex; align-items: center; gap: 8px;
  color: #fff; font-weight: 600; font-size: 15px; letter-spacing: .01em;
  padding: 8px 14px; border-radius: 999px;
  background: rgba(15, 17, 20, .42); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.nuwwar .g-video::after {
  content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(to top, rgba(15,17,20,.34), rgba(15,17,20,0) 42%);
}
.nuwwar .g-live-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #ff5a4d; flex: none;
  box-shadow: 0 0 0 0 rgba(255, 90, 77, .6); animation: g-pulse 1.8s ease-out infinite;
}
@keyframes g-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 90, 77, .55); }
  70% { box-shadow: 0 0 0 10px rgba(255, 90, 77, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 90, 77, 0); }
}

/* ============================================================
   CTA band
   ============================================================ */
.nuwwar .cta-band {
  background: var(--ink); color: var(--bg);
  border-radius: var(--radius-lg); padding: 56px;
  display: grid; grid-template-columns: 1fr auto; gap: 30px; align-items: center;
  position: relative; overflow: hidden;
}
.nuwwar .cta-band::before { content: ""; position: absolute; inset-inline-end: -60px; top: -60px; width: 260px; height: 260px; border-radius: 50%; background: color-mix(in srgb, var(--primary) 30%, transparent); filter: blur(20px); }
.nuwwar .cta-band h2 { font-family: var(--font-display); font-weight: 600; font-size: clamp(30px, 4vw, 46px); margin: 0; line-height: 1.05; position: relative; }
.nuwwar [dir="rtl"] .cta-band h2 { font-family: var(--font-ar-display); font-weight: 700; }
.nuwwar .cta-band p { color: color-mix(in srgb, var(--bg) 72%, transparent); margin: 12px 0 0; font-size: 16px; position: relative; }
.nuwwar .cta-band .btn-primary { position: relative; }

/* ============================================================
   Footer
   ============================================================ */
.nuwwar .footer { border-top: 1px solid var(--line); padding: 56px 0 40px; margin-top: 30px; }
.nuwwar .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 40px; }
.nuwwar .footer h4 { font-size: 13px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 16px; }
.nuwwar .footer a { display: block; padding: 6px 0; color: var(--ink-2); font-weight: 600; font-size: 15px; transition: color .2s; }
.nuwwar .footer a:hover { color: var(--primary); }
.nuwwar .socials { display: flex; gap: 10px; margin-top: 18px; }
.nuwwar .social-btn { width: 42px; height: 42px; border-radius: 12px; border: 1px solid var(--line); display: grid; place-items: center; color: var(--ink-2); transition: all .2s var(--ease); }
.nuwwar .social-btn:hover { color: var(--primary); border-color: var(--primary); transform: translateY(-2px); }
.nuwwar .social-btn svg { width: 19px; height: 19px; }
.nuwwar .footer-bottom { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 40px; padding-top: 26px; border-top: 1px solid var(--line); color: var(--ink-3); font-size: 13.5px; flex-wrap: wrap; }

/* ============================================================
   Reservation modal
   ============================================================ */
.nuwwar .modal-scrim {
  position: fixed; inset: 0; z-index: 100; background: rgba(15, 17, 20, .5);
  backdrop-filter: blur(4px); display: grid; place-items: center; padding: 24px;
  animation: fade .2s var(--ease);
}
@keyframes fade { from { opacity: 0; } }
.nuwwar .modal {
  background: var(--surface); border-radius: var(--radius-lg); width: min(520px, 100%);
  box-shadow: var(--shadow-pop); overflow: hidden;
  animation: pop .22s var(--ease);
  max-height: 92vh; overflow-y: auto;
}
@keyframes pop { from { transform: scale(.95) translateY(10px); opacity: 0; } }
.nuwwar .modal-head { padding: 26px 28px 0; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.nuwwar .modal-head h3 { font-family: var(--font-display); font-weight: 700; font-size: 30px; margin: 0; }
.nuwwar [dir="rtl"] .modal-head h3 { font-family: var(--font-ar-display); }
.nuwwar .modal-head p { color: var(--ink-2); font-size: 14.5px; margin: 6px 0 0; }
.nuwwar .modal-body { padding: 22px 28px 28px; display: flex; flex-direction: column; gap: 16px; }
.nuwwar .field { display: flex; flex-direction: column; gap: 7px; }
.nuwwar .field label { font-size: 13px; font-weight: 700; color: var(--ink-2); }
.nuwwar .field input, .nuwwar .field select {
  height: 46px; padding: 0 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong); background: var(--bg);
  font-family: inherit; font-size: 15px; color: var(--ink); width: 100%;
  transition: border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.nuwwar .field input:focus, .nuwwar .field select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
.nuwwar .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.nuwwar .guest-step { display: flex; align-items: center; gap: 0; border: 1px solid var(--line-strong); border-radius: var(--radius-sm); overflow: hidden; height: 46px; }
.nuwwar .guest-step button { width: 46px; height: 100%; font-size: 20px; font-weight: 700; color: var(--ink-2); background: var(--bg); transition: background .2s; }
.nuwwar .guest-step button:hover { background: var(--surface-2); color: var(--ink); }
.nuwwar .guest-step .gv { flex: 1; text-align: center; font-family: var(--font-mono); font-weight: 700; font-size: 16px; }
.nuwwar .modal-success { padding: 44px 28px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.nuwwar .modal-success .check { width: 64px; height: 64px; border-radius: 50%; background: var(--success); color: #fff; display: grid; place-items: center; }
.nuwwar .modal-success .check svg { width: 30px; height: 30px; }
.nuwwar .modal-success h3 { font-family: var(--font-display); font-weight: 700; font-size: 28px; margin: 0; }
.nuwwar [dir="rtl"] .modal-success h3 { font-family: var(--font-ar-display); }

/* chip group for order type */
.nuwwar .chip-group { display: flex; gap: 8px; }
.nuwwar .chip {
  flex: 1; height: 44px; border-radius: var(--radius-sm); border: 1px solid var(--line-strong);
  background: var(--bg); font-weight: 700; font-size: 14px; color: var(--ink-2);
  display: flex; align-items: center; justify-content: center; gap: 7px; transition: all .18s var(--ease);
}
.nuwwar .chip svg { width: 16px; height: 16px; }
.nuwwar .chip.active { background: var(--primary-soft); border-color: var(--primary); color: var(--primary-deep); }

/* ============================================================
   Reveal-on-scroll
   ============================================================ */
.nuwwar .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s var(--ease), transform .7s var(--ease); }
.nuwwar .reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .nuwwar .reveal { opacity: 1; transform: none; transition: none; }
  .nuwwar { scroll-behavior: auto; }
}

/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 980px) {
  .nuwwar .hero-grid { grid-template-columns: 1fr; gap: 36px; }
  .nuwwar .hero-media { max-width: 460px; }
  .nuwwar .hero-img { aspect-ratio: 16 / 12; }
  .nuwwar .split { grid-template-columns: 1fr; }
  .nuwwar .cta-band { grid-template-columns: 1fr; padding: 40px; }
  .nuwwar .footer-grid { grid-template-columns: 1fr 1fr; }
  .nuwwar .gallery-grid { grid-auto-rows: 170px; }
}
@media (max-width: 760px) {
  .nuwwar .nav-links { display: none; }
  .nuwwar .nav-cta { display: none; }
  .nuwwar .burger { display: grid; }
  .nuwwar .menu-grid { grid-template-columns: 1fr; gap: 0 0; }
  .nuwwar .section { padding: 60px 0; }
  .nuwwar .hero { padding: 32px 0 20px; }
  .nuwwar .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 150px; }
  .nuwwar .g-wide { grid-column: span 2; }
  .nuwwar .g-feat { grid-column: span 2; grid-row: span 2; }
  .nuwwar .footer-grid { grid-template-columns: 1fr; gap: 30px; }
  .nuwwar .field-row { grid-template-columns: 1fr; }
  .nuwwar .section-wrap { padding: 0 20px; }
  .nuwwar .nav-inner { padding: 0 20px; }
}
@media (max-width: 460px) {
  .nuwwar .gallery-grid { grid-template-columns: 1fr 1fr; }
  .nuwwar .hero-cta .btn { flex: 1; }
}

/* ============================================================
   Product customizer modal
   ============================================================ */
.nuwwar .prod-modal {
  background: var(--surface); border-radius: var(--radius-lg); overflow: hidden;
  width: min(460px, 94vw); max-height: 92vh; display: flex; flex-direction: column;
  box-shadow: var(--shadow-pop); animation: lb-pop .26s cubic-bezier(.2,.9,.3,1.2) both;
}
.nuwwar .prod-hero { position: relative; height: 190px; flex: none; background: var(--surface-2); }
.nuwwar .prod-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nuwwar .prod-close {
  position: absolute; top: 12px; inset-inline-end: 12px;
  background: var(--surface); box-shadow: var(--shadow-1);
}
.nuwwar .prod-body { padding: 20px 22px 8px; overflow-y: auto; }
.nuwwar .prod-title { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; }
.nuwwar .prod-title h3 { font-family: var(--font-display); font-weight: 600; font-size: 26px; margin: 0; color: var(--ink); }
.nuwwar [dir="rtl"] .prod-title h3 { font-family: var(--font-ar-display); font-weight: 700; }
.nuwwar .prod-base { font-size: 18px; font-weight: 600; color: var(--primary); white-space: nowrap; }
.nuwwar .prod-base small { font-size: 12px; font-weight: 500; color: var(--ink-3); }
.nuwwar .prod-desc { color: var(--ink-2); font-size: 14.5px; line-height: 1.55; margin: 6px 0 18px; }

.nuwwar .opt-group { padding: 14px 0; border-top: 1px solid var(--line); }
.nuwwar .opt-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.nuwwar .opt-label { font-family: var(--font-display); font-weight: 600; font-size: 17px; color: var(--ink); }
.nuwwar [dir="rtl"] .opt-label { font-family: var(--font-ar-display); font-weight: 700; }
.nuwwar .opt-tag {
  font-size: 11px; font-weight: 600; letter-spacing: .03em; text-transform: uppercase;
  color: var(--ink-3); background: var(--surface-2); padding: 3px 8px; border-radius: 999px;
}
.nuwwar .opt-tag.req { color: var(--primary-deep); background: var(--primary-soft); }

.nuwwar .opt-choices { display: flex; flex-wrap: wrap; gap: 10px; }
.nuwwar .opt-pill {
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 10px 16px; border-radius: 999px; font: inherit; font-size: 14.5px; font-weight: 500;
  border: 1.5px solid var(--line-strong); background: var(--surface); color: var(--ink);
  transition: border-color .15s ease, background .15s ease, color .15s ease;
}
.nuwwar .opt-pill.active { border-color: var(--primary); background: var(--primary-soft); color: var(--primary-deep); }
.nuwwar .opt-delta { font-size: 12.5px; color: var(--ink-3); }
.nuwwar .opt-pill.active .opt-delta { color: var(--primary-deep); }

.nuwwar .addon-list { display: flex; flex-direction: column; gap: 8px; }
.nuwwar .addon-row {
  display: flex; align-items: center; gap: 12px; cursor: pointer; width: 100%; text-align: start;
  padding: 11px 14px; border-radius: var(--radius); font: inherit;
  border: 1.5px solid var(--line); background: var(--surface); color: var(--ink);
  transition: border-color .15s ease, background .15s ease;
}
.nuwwar .addon-row.active { border-color: var(--primary); background: var(--primary-soft); }
.nuwwar .addon-check {
  flex: none; width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid var(--line-strong);
  display: grid; place-items: center; color: #fff; transition: background .15s ease, border-color .15s ease;
}
.nuwwar .addon-check.on { background: var(--primary); border-color: var(--primary); }
.nuwwar .addon-check svg { width: 15px; height: 15px; }
.nuwwar .addon-name { flex: 1; font-size: 14.5px; font-weight: 500; }
.nuwwar .addon-price { font-size: 13.5px; color: var(--ink-2); font-weight: 600; }

.nuwwar .prod-foot {
  display: flex; align-items: center; gap: 14px; padding: 16px 22px;
  border-top: 1px solid var(--line); background: var(--surface); flex: none;
}
.nuwwar .qty-step {
  display: inline-flex; align-items: center; gap: 4px; flex: none;
  border: 1.5px solid var(--line-strong); border-radius: 999px; padding: 4px;
}
.nuwwar .qty-step button {
  width: 34px; height: 34px; border-radius: 50%; border: 0; cursor: pointer;
  background: var(--surface-2); color: var(--ink); display: grid; place-items: center;
  transition: background .15s ease;
}
.nuwwar .qty-step button:hover { background: var(--primary-soft); color: var(--primary-deep); }
.nuwwar .qty-step button svg { width: 17px; height: 17px; }
.nuwwar .qty-step .qv { min-width: 26px; text-align: center; font-weight: 600; font-size: 16px; }
.nuwwar .qty-step.sm { padding: 3px; }
.nuwwar .qty-step.sm button { width: 28px; height: 28px; }
.nuwwar .qty-step.sm .qv { min-width: 22px; font-size: 14px; }

.nuwwar .prod-add { flex: 1; justify-content: center; gap: 10px; position: relative; }
.nuwwar .prod-add-total { margin-inline-start: auto; font-weight: 700; opacity: .92; }

/* ============================================================
   Cart drawer + nav badge
   ============================================================ */
.nuwwar .cart-btn { position: relative; }
.nuwwar .cart-badge {
  position: absolute; top: -4px; inset-inline-end: -4px; min-width: 18px; height: 18px;
  padding: 0 5px; border-radius: 999px; background: var(--primary); color: #fff;
  font-size: 11px; font-weight: 700; display: grid; place-items: center; line-height: 1;
}

.nuwwar .cart-overlay {
  position: fixed; inset: 0; z-index: 130; background: rgba(15, 17, 20, .5);
  opacity: 0; visibility: hidden; transition: opacity .25s ease, visibility .25s ease;
}
.nuwwar .cart-overlay.open { opacity: 1; visibility: visible; }
.nuwwar .cart-drawer {
  position: absolute; top: 0; bottom: 0; inset-inline-end: 0; width: min(420px, 100%);
  background: var(--bg); display: flex; flex-direction: column;
  box-shadow: var(--shadow-pop); transform: translateX(8%); opacity: .4;
  transition: transform .28s cubic-bezier(.2,.8,.2,1), opacity .28s ease;
}
.nuwwar [dir="rtl"] .cart-drawer { transform: translateX(-8%); }
.nuwwar .cart-drawer.open { transform: translateX(0); opacity: 1; }
.nuwwar .cart-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px; border-bottom: 1px solid var(--line); flex: none;
}
.nuwwar .cart-head h3 { font-family: var(--font-display); font-weight: 600; font-size: 22px; margin: 0; color: var(--ink); }
.nuwwar [dir="rtl"] .cart-head h3 { font-family: var(--font-ar-display); font-weight: 700; }

.nuwwar .cart-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; gap: 6px; }
.nuwwar .cart-empty-ico { width: 64px; height: 64px; border-radius: 50%; background: var(--surface-2); display: grid; place-items: center; color: var(--ink-3); margin-bottom: 10px; }
.nuwwar .cart-empty-ico svg { width: 28px; height: 28px; }
.nuwwar .cart-empty-title { font-weight: 600; font-size: 17px; color: var(--ink); margin: 0; }
.nuwwar .cart-empty-hint { color: var(--ink-3); font-size: 14px; margin: 0; max-width: 22em; }

.nuwwar .cart-lines { flex: 1; overflow-y: auto; padding: 14px 18px; display: flex; flex-direction: column; gap: 14px; }
.nuwwar .cart-line { display: grid; grid-template-columns: auto 1fr; gap: 12px; }
.nuwwar .cl-thumb { width: 64px; height: 64px; border-radius: var(--radius); object-fit: cover; background: var(--surface-2); flex: none; }
.nuwwar .cl-main { min-width: 0; }
.nuwwar .cl-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.nuwwar .cl-name { font-weight: 600; font-size: 15.5px; color: var(--ink); }
.nuwwar .cl-remove { border: 0; background: transparent; color: var(--ink-3); cursor: pointer; padding: 2px; flex: none; transition: color .15s ease; }
.nuwwar .cl-remove:hover { color: var(--danger); }
.nuwwar .cl-remove svg { width: 17px; height: 17px; }
.nuwwar .cl-meta { font-size: 12.5px; color: var(--ink-3); margin: 3px 0 8px; line-height: 1.4; }
.nuwwar .cl-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.nuwwar .cl-price { font-weight: 600; font-size: 14.5px; color: var(--ink); }
.nuwwar .cl-price small { font-size: 11px; color: var(--ink-3); font-weight: 500; }

.nuwwar .cart-foot { flex: none; padding: 18px 22px; border-top: 1px solid var(--line); background: var(--surface); display: flex; flex-direction: column; gap: 8px; }
.nuwwar .cart-row { display: flex; align-items: center; justify-content: space-between; font-size: 14.5px; color: var(--ink); }
.nuwwar .cart-row.muted { color: var(--ink-3); }
.nuwwar .cart-row.total { font-family: var(--font-display); font-weight: 600; font-size: 19px; color: var(--ink); padding-top: 8px; margin-top: 2px; border-top: 1px solid var(--line); }
.nuwwar [dir="rtl"] .cart-row.total { font-family: var(--font-ar-display); font-weight: 700; }

@media (max-width: 460px) {
  .nuwwar .prod-foot { flex-wrap: wrap; }
  .nuwwar .prod-add { width: 100%; }
}

/* ---------- Brand-color bridge: tenant theme → Nuwwar tokens ----------
   The microsite ThemeController injects --saffron / --olive (etc.) from the
   store's saved theme onto an ancestor wrapper. Map them onto the Nuwwar
   brand tokens; fall back to the Nuwwar palette when unset. */
.nuwwar {
  --primary:      var(--saffron, #3F6B54);
  --primary-deep: var(--saffron-deep, #335845);
  --primary-soft: var(--saffron-tint, #E7EEEA);
  --accent:       var(--olive, #5E6B4F);
  --accent-soft:  var(--olive-tint, #E9ECE4);
  --olive:        var(--olive, #5E6B4F);
  --olive-soft:   var(--olive-tint, #E9ECE4);
}

/* ---------- Recety integration helpers (not in the original Nuwwar CSS) ---------- */
.nuwwar .brand-logo {
  width: 38px; height: 38px; border-radius: 10px; object-fit: contain;
  background: var(--surface-2);
}
.nuwwar .mobile-order-bar {
  position: fixed; inset-inline: 16px; bottom: 16px; z-index: 60;
  display: none; align-items: center; gap: 10px; justify-content: space-between;
  padding: 14px 18px; border-radius: var(--radius-lg);
  background: var(--primary); color: #fff; border: none;
  box-shadow: var(--shadow-pop); font-weight: 700; font-family: var(--font-body);
}
.nuwwar .mobile-order-bar .num { margin-inline-start: auto; }
.nuwwar .mob-count {
  background: rgba(255, 255, 255, .25); width: 26px; height: 26px;
  border-radius: 50%; display: grid; place-items: center; font-size: 13px;
}
@media (max-width: 760px) {
  .nuwwar .mobile-order-bar { display: flex; }
}
