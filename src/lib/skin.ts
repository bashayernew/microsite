/**
 * Per-tenant visual "skin" opt-in.
 *
 * The storefront is normally identical for every tenant (only colors + content
 * differ, via the merchant's theme). A skin is an extra, opt-in layer of
 * typographic character applied to a specific allow-listed store and NOTHING
 * else — so turning it on can never change another tenant's look.
 *
 * `editorial` re-points the display font to a serif (see the `.editorial` scope
 * in globals.css). Brand colors still come from the store's own theme.
 *
 * To enable for a store, add its public slug below. To roll it back, remove the
 * slug. (When we later promote this into a merchant-selectable theme, this
 * allow-list becomes the migration's default.)
 */
const EDITORIAL_SLUGS = new Set<string>(['b-software']);

export function isEditorialSlug(slug: string): boolean {
  return EDITORIAL_SLUGS.has(slug);
}
