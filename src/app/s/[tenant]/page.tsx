import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getTenant } from "@/lib/api/client";
import { StoreProvider } from "@/components/store-provider";
import { StoreView } from "@/components/store/store-view";

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: slug } = await params;
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
  const { tenant: slug } = await params;
  const [tenant, menu] = await Promise.all([getTenant(slug), getMenu(slug)]);
  if (!tenant) notFound();

  return (
    <StoreProvider tenant={tenant}>
      <StoreView menu={menu} />
    </StoreProvider>
  );
}
