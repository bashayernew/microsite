"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryItem, GallerySection as GalleryData, Locale } from "@/lib/api/types";
import { makeT, pick } from "@/lib/i18n";
import { IconBack, IconChevronRight, IconClose, IconPlay } from "@/components/ui/icons";

/* ── Video helpers ──────────────────────────────────────────────────────────
   Videos are external links (not uploads): YouTube, Vimeo, or a direct file. */

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}
function isFile(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);
}

/** A poster image for a frame: the merchant's image, else a YouTube thumbnail. */
function posterFor(item: GalleryItem): string | null {
  if (item.image) return item.image;
  const yt = item.videoUrl && youtubeId(item.videoUrl);
  return yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : null;
}

/** An autoplaying, muted, looping inline player for a video frame (background
 *  clip in the grid). Returns null for providers we can't autoplay inline —
 *  those fall back to a poster + play badge. */
function inlineEmbed(
  item: GalleryItem,
): { kind: "iframe"; src: string } | { kind: "video"; src: string } | null {
  const url = item.videoUrl;
  const yt = youtubeId(url);
  if (yt) {
    return {
      kind: "iframe",
      src: `https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0`,
    };
  }
  const vm = vimeoId(url);
  if (vm) {
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${vm}?autoplay=1&loop=1&muted=1&background=1`,
    };
  }
  if (isFile(url)) return { kind: "video", src: url };
  return null;
}

/**
 * "A glimpse inside" — a **row-major** mosaic of merchant photos and video
 * links. Tiles flow left→right across rows (CSS grid with a deterministic
 * span pattern), unlike a column-packed masonry. Each frame may carry a
 * bilingual caption and may be a video (plays in the lightbox). Clicking opens
 * a full-screen lightbox with prev/next + keyboard nav.
 */
export function GalleryBlock({
  data,
  locale,
}: {
  data: GalleryData;
  locale: Locale;
}) {
  const t = makeT(locale);
  // A frame is renderable if it has a photo OR a video link.
  const items = data.items.filter((it) => it.image || it.videoUrl);
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((cur) =>
        cur === null ? cur : (cur + dir + items.length) % items.length,
      ),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (items.length === 0) return null;

  const title = pick(data.title, data.titleAr, locale) || t("gallery_title");
  const subtitle = pick(data.subtitle, data.subtitleAr, locale);
  const current = open === null ? null : items[open];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}

      {/* Row-major mosaic: a 4-col grid (2 on mobile) with a repeating span
          pattern + dense flow, so tiles read left→right across rows. */}
      <div className="mt-5 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[170px] sm:grid-cols-4 sm:[grid-auto-flow:dense]">
        {items.map((it, idx) => {
          const caption = pick(it.caption, it.captionAr, locale);
          const poster = posterFor(it);
          const isVideo = !!it.videoUrl;
          const inline = isVideo ? inlineEmbed(it) : null;
          return (
            <button
              key={it.id}
              onClick={() => setOpen(idx)}
              className={`group relative overflow-hidden rounded-xl border border-line bg-paper-sunk ${tileSpan(idx)}`}
            >
              {inline ? (
                inline.kind === "iframe" ? (
                  // Cover the (variable-size) tile with a 16:9 iframe using
                  // container-query units, clipped by the tile's overflow.
                  <span
                    className="absolute inset-0 block overflow-hidden bg-black"
                    style={{ containerType: "size" }}
                  >
                    <iframe
                      src={inline.src}
                      title={caption || title}
                      tabIndex={-1}
                      aria-hidden
                      allow="autoplay; encrypted-media; picture-in-picture"
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
                      style={{
                        width: "max(100cqw, calc(100cqh * 16 / 9))",
                        height: "max(100cqh, calc(100cqw * 9 / 16))",
                      }}
                    />
                  </span>
                ) : (
                  <video
                    src={inline.src}
                    poster={poster ?? undefined}
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden
                    className="pointer-events-none absolute inset-0 h-full w-full bg-black object-cover"
                  />
                )
              ) : poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt={caption || title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-saffron to-saffron-deep text-white">
                  <IconPlay width={28} height={28} />
                </div>
              )}

              {/* Play affordance only when the frame is NOT already playing
                  inline (unknown provider falling back to a poster). */}
              {isVideo && !inline && poster && (
                <span className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition group-hover:bg-black/60">
                    <IconPlay width={22} height={22} />
                  </span>
                </span>
              )}

              {caption && (
                <span className="absolute bottom-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur ltr:left-2 rtl:right-2">
                  {isVideo && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  )}
                  {caption}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label={t("close")}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-lg transition hover:bg-paper-sunk"
          >
            <IconClose width={20} height={20} />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white sm:left-6"
              >
                <IconBack width={20} height={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next"
                className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white sm:right-6"
              >
                <IconChevronRight width={20} height={20} />
              </button>
            </>
          )}

          <figure
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <LightboxMedia item={current} title={title} locale={locale} />
            {pick(current.caption, current.captionAr, locale) && (
              <figcaption className="px-5 py-4 font-display text-lg text-ink">
                {pick(current.caption, current.captionAr, locale)}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}

/** The big media in the lightbox — an embedded player for videos, else the photo. */
function LightboxMedia({
  item,
  title,
  locale,
}: {
  item: GalleryItem;
  title: string;
  locale: Locale;
}) {
  const alt = pick(item.caption, item.captionAr, locale) || title;
  if (item.videoUrl) {
    const yt = youtubeId(item.videoUrl);
    const vm = vimeoId(item.videoUrl);
    if (yt || vm) {
      // Loop in the lightbox too (YouTube needs playlist=ID for loop).
      const src = yt
        ? `https://www.youtube.com/embed/${yt}?autoplay=1&loop=1&playlist=${yt}`
        : `https://player.vimeo.com/video/${vm}?autoplay=1&loop=1`;
      return (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={src}
            title={alt}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }
    if (isFile(item.videoUrl)) {
      return (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={item.videoUrl} controls autoPlay loop className="max-h-[72vh] w-full bg-black" />
      );
    }
    // Unknown provider — best-effort embed.
    return (
      <div className="aspect-video w-full bg-black">
        <iframe src={item.videoUrl} title={alt} className="h-full w-full" allowFullScreen />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.image} alt={alt} className="max-h-[72vh] w-full bg-black object-contain" />;
}

/** Deterministic mosaic span by index — a tall, a big feature, and a wide tile
 *  recur so the grid reads as a varied collage (desktop only; mobile is 2-up). */
function tileSpan(i: number): string {
  const m = i % 7;
  if (m === 1) return "sm:col-span-2 sm:row-span-2";
  if (m === 0) return "sm:row-span-2";
  if (m === 6) return "sm:col-span-2";
  return "";
}
