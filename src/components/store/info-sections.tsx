"use client";

import Link from "next/link";
import type {
  ContactSection as ContactData,
  CtaSection as CtaData,
  HoursSection as HoursData,
  Locale,
} from "@/lib/api/types";
import { makeT, pick } from "@/lib/i18n";
import {
  IconArrowRight,
  IconChat,
  IconClock,
  IconPhone,
  IconPin,
} from "@/components/ui/icons";

/** Shared section shell — heading + optional subtitle, centered, themed. */
function SectionShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8">
        {title && (
          <h2 className="mb-5 font-display text-2xl text-ink sm:text-3xl">{title}</h2>
        )}
        {children}
      </div>
    </section>
  );
}

/* ── Hours & Location ─────────────────────────────────────────────────────── */

export function HoursBlock({ data, locale }: { data: HoursData; locale: Locale }) {
  const t = makeT(locale);
  const note = pick(data.note, data.noteAr, locale);
  const hasMap = data.latitude.trim() !== "" && data.longitude.trim() !== "";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${data.latitude},${data.longitude}`,
  )}`;
  const days = data.days.filter(
    (d) => pick(d.label, d.labelAr, locale) || pick(d.value, d.valueAr, locale),
  );

  return (
    <SectionShell title={pick(data.title, data.titleAr, locale) || t("hours_title")}>
      {note && <p className="-mt-2 mb-5 text-sm text-ink-soft">{note}</p>}
      {days.length > 0 && (
        <ul className="divide-y divide-line">
          {days.map((d, idx) => (
            <li key={idx} className="flex items-center justify-between gap-4 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <IconClock width={15} height={15} className="text-ink-faint" />
                {pick(d.label, d.labelAr, locale)}
              </span>
              <span className="text-sm text-ink-soft">
                {pick(d.value, d.valueAr, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {hasMap && (
        <Link
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-saffron transition hover:border-saffron"
        >
          <IconPin width={16} height={16} />
          {t("view_on_map")}
        </Link>
      )}
    </SectionShell>
  );
}

/* ── Contact ──────────────────────────────────────────────────────────────── */

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;
  const body = (
    <>
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-saffron-tint text-saffron">
        {icon}
      </span>
      <span className="min-w-0">
        {label && <span className="block text-xs text-ink-faint">{label}</span>}
        <span className="block text-sm font-medium text-ink">{value}</span>
      </span>
    </>
  );
  return href ? (
    <Link href={href} className="flex items-start gap-3 transition hover:opacity-80">
      {body}
    </Link>
  ) : (
    <div className="flex items-start gap-3">{body}</div>
  );
}

export function ContactBlock({
  data,
  locale,
}: {
  data: ContactData;
  locale: Locale;
}) {
  const t = makeT(locale);
  const dirLabel = pick(data.directions.label, data.directions.labelAr, locale);
  return (
    <SectionShell title={pick(data.title, data.titleAr, locale) || t("contact_title")}>
      <div className="grid gap-5 sm:grid-cols-2">
        <ContactRow
          icon={<IconPin width={17} height={17} />}
          label={pick(data.address.label, data.address.labelAr, locale)}
          value={pick(data.address.value, data.address.valueAr, locale)}
        />
        <ContactRow
          icon={<IconPhone width={17} height={17} />}
          label={pick(data.phone.label, data.phone.labelAr, locale)}
          value={data.phone.value}
          href={data.phone.value ? `tel:${data.phone.value.replace(/\s+/g, "")}` : undefined}
        />
        <ContactRow
          icon={<IconChat width={17} height={17} />}
          label={pick(data.whatsapp.label, data.whatsapp.labelAr, locale)}
          value={data.whatsapp.value}
          href={
            data.whatsapp.value
              ? `https://wa.me/${data.whatsapp.value.replace(/[^\d]/g, "")}`
              : undefined
          }
        />
        <ContactRow
          icon={<IconClock width={17} height={17} />}
          label={pick(data.note.label, data.note.labelAr, locale)}
          value={pick(data.note.value, data.note.valueAr, locale)}
        />
      </div>
      {data.directions.url && (
        <Link
          href={data.directions.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-saffron px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-saffron-deep"
        >
          <IconPin width={16} height={16} />
          {dirLabel || t("get_directions")}
        </Link>
      )}
    </SectionShell>
  );
}

/* ── Call to action ───────────────────────────────────────────────────────── */

export function CtaBlock({ data, locale }: { data: CtaData; locale: Locale }) {
  const heading = pick(data.heading, data.headingAr, locale);
  const subtitle = pick(data.subtitle, data.subtitleAr, locale);
  const primaryLabel = pick(data.primary.label, data.primary.labelAr, locale);
  const secondaryLabel = pick(data.secondary.label, data.secondary.labelAr, locale);
  const showPrimary = data.primary.enabled && primaryLabel;
  const showSecondary = data.secondary.enabled && secondaryLabel;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl bg-saffron-deep px-6 py-10 text-center text-paper sm:px-12 sm:py-14">
        {heading && (
          <h2 className="font-display text-2xl sm:text-4xl">{heading}</h2>
        )}
        {subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-paper/85 sm:text-base">
            {subtitle}
          </p>
        )}
        {(showPrimary || showSecondary) && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {showPrimary && (
              <Link
                href={data.primary.url || "#"}
                className="inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-bold text-ink shadow-sm transition hover:bg-paper-sunk"
              >
                {primaryLabel}
                <IconArrowRight width={16} height={16} className="rtl:rotate-180" />
              </Link>
            )}
            {showSecondary && (
              <Link
                href={data.secondary.url || "#"}
                className="inline-flex items-center gap-2 rounded-full border border-paper/50 px-6 py-3 text-sm font-bold text-paper transition hover:bg-paper/10"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
