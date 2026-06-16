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
  return {
    title: `Contact — ${tenant.businessName}`,
    description: tenant.tagline,
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { slug } = await params;
  if (isReservedSegment(slug)) notFound();

  const [tenant, menu] = await Promise.all([getTenant(slug), getMenu(slug)]);
  if (!tenant) notFound();

  return (
    <ThemeController theme={tenant.theme}>
      <StoreProvider tenant={tenant}>
        <NuwwarStoreView menu={menu} page="contact" />
      </StoreProvider>
    </ThemeController>
  );
}
