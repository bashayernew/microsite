import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getTenant } from "@/lib/api/client";
import { StoreProvider } from "@/components/store-provider";
import { StoreView } from "@/components/store/store-view";

interface PageProps {
  params: Promise<{ tenant: string; category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: slug, category } = await params;
  const [tenant, menu] = await Promise.all([getTenant(slug), getMenu(slug)]);
  if (!tenant) return { title: "Not found" };
  const cat = menu.categories.find((c) => c.slug === category);
  const title = cat
    ? `${cat.name} — ${tenant.businessName}`
    : `${tenant.businessName} — Order online`;
  return { title, description: tenant.tagline };
}

export default async function CategoryPage({ params }: PageProps) {
  const { tenant: slug, category } = await params;
  const [tenant, menu] = await Promise.all([getTenant(slug), getMenu(slug)]);
  if (!tenant) notFound();
  if (!menu.categories.some((c) => c.slug === category)) notFound();

  return (
    <StoreProvider tenant={tenant}>
      <StoreView menu={menu} focusCategorySlug={category} />
    </StoreProvider>
  );
}
