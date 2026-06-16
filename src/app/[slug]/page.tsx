import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getTenant } from "@/lib/api/client";
import { StoreProvider } from "@/components/store-provider";
import { NuwwarStoreView } from "@/components/store/nuwwar/nuwwar-store-view";
import { ThemeController } from "@/components/store/theme-controller";
import { isReservedSegment } from "@/lib/reserved-paths";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (!tenant) return { title: "Not found" };
  const title = `${tenant.businessName} — Order online`;
  return {
    title,
    description: tenant.tagline,
    openGraph: {
      title,
      description: tenant.tagline,
      images: [tenant.coverImage],
      type: "website",
    },
  };
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params;
  // Defense-in-depth: a reserved first segment must never resolve as a tenant slug
  // (middleware also blocks these, this guards direct/SSR hits).
  if (isReservedSegment(slug)) notFound();

  const [tenant, menu] = await Promise.all([getTenant(slug), getMenu(slug)]);
  if (!tenant) notFound();

  // Per-store theming: ThemeController injects the merchant's light/dark color
  // schemes as CSS variables and owns the light/dark toggle, so every component
  // below recolors from this store's `theme` object.
  return (
    <ThemeController theme={tenant.theme}>
      <StoreProvider tenant={tenant}>
        <NuwwarStoreView menu={menu} />
      </StoreProvider>
    </ThemeController>
  );
}
