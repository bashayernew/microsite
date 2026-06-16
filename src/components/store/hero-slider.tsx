"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide, Locale } from "@/lib/api/types";
import { pick } from "@/lib/i18n";
import { IconArrowRight, IconBack, IconChevronRight } from "@/components/ui/icons";

/**
 * Hero carousel — full-bleed, edge-to-edge under the header. Each slide is an
 * image with overlaid bilingual headline/subtitle and one optional CTA button.
 * Auto-advances every 6s; prev/next arrows + dots when there's more than one
 * slide. Falls back to a simple branded banner when there are no slides.
 */
export function HeroSlider({
  slides,
  locale,
  businessName,
  businessNameAr,
  tagline,
  taglineAr,
}: {
  slides: HeroSlide[];
  locale: Locale;
  businessName: string;
  businessNameAr: string;
  tagline: string;
  taglineAr: string;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (dir: number) => setI((p) => (p + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count, paused]);

  // Keep the active index valid if the slide count ever shrinks.
  useEffect(() => {
    if (i >= count && count > 0) setI(0);
  }, [i, count]);

  if (count === 0) {
    return (
      <section className="relative bg-gradient-to-br from-saffron to-saffron-deep text-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="font-display text-3xl sm:text-5xl">
            {pick(businessName, businessNameAr, locale)}
          </h1>
          {pick(tagline, taglineAr, locale) && (
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/90 sm:text-lg">
              {pick(tagline, taglineAr, locale)}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[440px] w-full sm:h-[560px]">
        {slides.map((s, idx) => {
          const headline = pick(s.headline, s.headlineAr, locale);
          const subtitle = pick(s.subtitle, s.subtitleAr, locale);
          const btnLabel = pick(s.button.label, s.button.labelAr, locale);
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === i ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={idx !== i}
            >
              {s.image ? (
                <Image
                  src={s.image}
                  alt={headline || pick(businessName, businessNameAr, locale)}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-saffron to-saffron-deep" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 text-paper sm:px-6">
                  {headline && (
                    <h1 className="max-w-2xl font-display text-4xl leading-tight drop-shadow-sm sm:text-6xl">
                      {headline}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="max-w-xl text-base text-white/90 sm:text-xl">
                      {subtitle}
                    </p>
                  )}
                  {s.button.enabled && btnLabel && (
                    <Link
                      href={s.button.url || "#"}
                      className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-bold text-paper shadow-md transition hover:bg-saffron-deep"
                    >
                      {btnLabel}
                      <IconArrowRight width={16} height={16} className="rtl:rotate-180" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / next arrows (hidden on mobile to avoid overlapping the text). */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 sm:grid sm:left-6"
          >
            <IconBack width={20} height={20} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 sm:grid sm:right-6"
          >
            <IconChevronRight width={20} height={20} />
          </button>
        </>
      )}

      {/* Dots — bottom center. */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full bg-white transition-all ${
                idx === i ? "w-6" : "w-1.5 opacity-50 hover:opacity-80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
