import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getTenant } from "@/lib/api/client";
import { StoreProvider } from "@/components/store-provider";
import { NuwwarStoreView } from "@/components/store/nuwwar/nuwwar-store-view";
import { ThemeController } from "@/components/store/theme-controller";
import { isReservedSegment } from "@/lib/reserved-paths";

interface PageProps {
  params: Promise<{ slug: string; category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const [tenant, menu] = await Promise.all([getTenant(slug), getMenu(slug)]);
  if (!tenant) return { title: "Not found" };
  const cat = menu.categories.find((c) => c.slug === category);
  const title = cat
    ? `${cat.name} — ${tenant.businessName}`
    : `${tenant.businessName} — Order online`;
  return { title, description: tenant.tagline };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug, category } = await params;
  if (isReservedSegment(slug)) notFound();

  const [tenant, menu] = await Promise.all([getTenant(slug), getMenu(slug)]);
  if (!tenant) notFound();
  if (!menu.categories.some((c) => c.slug === category)) notFound();

  return (
    <ThemeController theme={tenant.theme}>
      <StoreProvider tenant={tenant}>
        <NuwwarStoreView menu={menu} focusCategorySlug={category} />
      </StoreProvider>
    </ThemeController>
  );
}
