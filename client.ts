"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Reveal-on-scroll wrapper — ported from the Nuwwar sections.jsx. Adds the
 * `in` class once the element scrolls into view (or immediately if already
 * visible on mount), driving the `.reveal`/`.reveal.in` transition in
 * nuwwar.css. Has a 1.2s safety net so content is never left invisible, and
 * respects reduced-motion via the CSS.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  tag: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  tag?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || 0) * 0.96 && r.bottom > 0;
    };
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    if (inView()) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => el.classList.add("in")),
      );
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    const fb = setTimeout(() => el.classList.add("in"), 1200);
    return () => {
      io.disconnect();
      clearTimeout(fb);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
