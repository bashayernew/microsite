"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale, Offer } from "@/lib/api/types";
import { pick } from "@/lib/i18n";

/**
 * Auto-rotating hero offers/featured banners. Advances every 5s when there is
 * more than one. Admin-managed (mock for now); when the POS exposes offers, the
 * `offers` array just comes from `getTenant`.
 */
export function OffersCarousel({ offers, locale }: { offers: Offer[]; locale: Locale }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (offers.length <= 1 || paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % offers.length), 5000);
    return () => clearInterval(id);
  }, [offers.length, paused]);

  if (offers.length === 0) return null;

  return (
    <div
      className="relative mt-4 overflow-hidden rounded-2xl border border-line"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-44 w-full sm:h-52">
        {offers.map((o, idx) => (
          <div
            key={o.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={o.image}
              alt={pick(o.title, o.titleAr, locale)}
              fill
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/50 to-ink/10 ltr:bg-gradient-to-r rtl:bg-gradient-to-l" />
            <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-6 text-paper sm:p-8">
              {o.badge && (
                <span className="w-fit rounded-full bg-gold px-2.5 py-1 text-[11px] font-extrabold text-ink">
                  {pick(o.badge, o.badgeAr ?? o.badge, locale)}
                </span>
              )}
              <h3 className="max-w-md font-display text-xl leading-tight sm:text-2xl">
                {pick(o.title, o.titleAr, locale)}
              </h3>
              <p className="max-w-md text-sm text-paper/90">
                {pick(o.subtitle, o.subtitleAr, locale)}
              </p>
              {o.href && (
                <Link
                  href={o.href}
                  className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-xs font-bold text-ink transition hover:bg-paper-sunk"
                >
                  {pick("View offer", "عرض العرض", locale)}
                  <span aria-hidden className="rtl:rotate-180">
                    →
                  </span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {offers.length > 1 && (
        <div className="absolute bottom-3 flex gap-1.5 ltr:left-6 rtl:right-6">
          {offers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Offer ${idx + 1}`}
              className={`h-1.5 rounded-full bg-paper transition-all ${
                idx === i ? "w-5" : "w-1.5 opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
