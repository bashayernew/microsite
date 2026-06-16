/**
 * First path segments that must NEVER be resolved as a tenant slug.
 *
 * The storefront is served at the URL root as `/{slug}` (e.g. `/noor`), so the
 * dynamic `[slug]` segment would otherwise greedily match framework paths,
 * static asset folders, and future first-class routes (checkout, locale, etc.).
 * Next.js already serves `/_next/*` and files with an extension (`/favicon.ico`,
 * `/file.svg`) before app routing, but this list defends the remaining clean
 * paths and documents the words a real tenant slug may not take.
 *
 * Enforced in two places: `middleware.ts` (returns 404 before routing) and the
 * `[slug]` pages themselves (defense-in-depth for SSR/direct hits).
 */
export const RESERVED_SEGMENTS = new Set<string>([
  "_next",
  "api",
  "assets",
  "static",
  "public",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "icon",
  "checkout",
  "cart",
  "order",
  "orders",
  "admin",
  "login",
  "s", // legacy `/s/[tenant]` prefix, retired when routes moved to root `/{slug}`
]);

export function isReservedSegment(segment: string): boolean {
  return RESERVED_SEGMENTS.has(segment.toLowerCase());
}
