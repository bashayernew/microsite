"use client";

import Link from "next/link";
import type { Locale, SiteFooter as FooterData } from "@/lib/api/types";
import { makeT, pick } from "@/lib/i18n";
import { IconChat, IconInstagram, IconPhone } from "@/components/ui/icons";

/**
 * Rich, merchant-configured footer (about / browse links / visit-us / social).
 * Rendered only when the merchant enabled it; otherwise store-view shows the
 * minimal "powered by" line.
 */
export function SiteFooter({
  data,
  locale,
  businessName,
  businessNameAr,
}: {
  data: FooterData;
  locale: Locale;
  businessName: string;
  businessNameAr: string;
}) {
  const t = makeT(locale);
  const name = pick(businessName, businessNameAr, locale);
  const about = pick(data.about, data.aboutAr, locale);
  const browseTitle = pick(data.browseTitle, data.browseTitleAr, locale);
  const visitTitle = pick(data.visitTitle, data.visitTitleAr, locale);
  const address = pick(data.address, data.addressAr, locale);
  const copyright = pick(data.copyright, data.copyrightAr, locale);
  const links = data.links.filter((l) => pick(l.label, l.labelAr, locale));
  const phones = data.phones.filter(Boolean);
  const social = [
    data.social.phone && { href: data.social.phone, Icon: IconPhone, key: "p" },
    data.social.whatsapp && { href: data.social.whatsapp, Icon: IconChat, key: "w" },
    data.social.instagram && { href: data.social.instagram, Icon: IconInstagram, key: "i" },
  ].filter(Boolean) as { href: string; Icon: typeof IconPhone; key: string }[];

  return (
    <footer className="border-t border-line bg-paper-raised">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {/* Brand + about */}
        <div>
          <div className="font-display text-xl text-ink">{name}</div>
          {about && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              {about}
            </p>
          )}
          {social.length > 0 && (
            <div className="mt-4 flex gap-2">
              {social.map(({ href, Icon, key }) => (
                <Link
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition hover:border-saffron hover:text-saffron"
                >
                  <Icon width={16} height={16} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Browse links */}
        {links.length > 0 && (
          <div>
            {browseTitle && (
              <h3 className="mb-3 text-sm font-bold text-ink">{browseTitle}</h3>
            )}
            <ul className="space-y-2">
              {links.map((l, idx) => (
                <li key={idx}>
                  <Link
                    href={l.url || "#"}
                    className="text-sm text-ink-soft transition hover:text-saffron"
                  >
                    {pick(l.label, l.labelAr, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Visit us */}
        {(address || phones.length > 0) && (
          <div>
            {visitTitle && (
              <h3 className="mb-3 text-sm font-bold text-ink">{visitTitle}</h3>
            )}
            {address && <p className="text-sm text-ink-soft">{address}</p>}
            {phones.length > 0 && (
              <ul className="mt-2 space-y-1">
                {phones.map((p, idx) => (
                  <li key={idx}>
                    <Link
                      href={`tel:${p.replace(/\s+/g, "")}`}
                      className="text-sm text-ink-soft transition hover:text-saffron"
                    >
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-line py-5 text-center">
        <p className="text-xs text-ink-faint">
          {copyright ? `${copyright} · ` : ""}
          {t("powered_by")}
        </p>
      </div>
    </footer>
  );
}
