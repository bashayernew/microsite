import Link from "next/link";

/**
 * Marketing root. In production this becomes the product landing site
 * (the `(marketing)` route group). For the demo it points at the sample store.
 */
export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grain opacity-60" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-8 px-6 py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-raised px-3 py-1 text-xs font-medium tracking-wide text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
          Recety · Microsite
        </span>
        <h1 className="font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
          A storefront for every store on{" "}
          <span className="text-saffron">Recety POS.</span>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
          When a merchant adds products in the POS, their public ordering site
          updates automatically. Customers browse the menu and place takeaway or
          dine-in orders that land straight in the dashboard.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/noor"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-saffron"
          >
            View a live demo store
            <span aria-hidden>→</span>
          </Link>
          <span className="text-sm text-ink-faint">noor.recety.com</span>
        </div>
      </div>
    </main>
  );
}
