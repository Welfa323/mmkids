"use client";

import { History } from "lucide-react";
import { getProductsByIds } from "@/modules/catalog";
import { ProductRail } from "@/modules/catalog/components/product-rail";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { SectionHeader } from "@/shared/ui/misc";

export function RecentlyViewed({ excludeId, title = "Récemment consultés" }: { excludeId?: string; title?: string }) {
  const hydrated = useHydrated();
  const ids = useEngagement((s) => s.recent);
  if (!hydrated) return null;
  const products = getProductsByIds(ids.filter((id) => id !== excludeId));
  if (products.length === 0) return null;
  return (
    <section className="container-page mt-10">
      <SectionHeader
        title={
          <span className="flex items-center gap-2">
            <History className="size-5 text-ink-400" /> {title}
          </span>
        }
        subtitle="Retrouvez les produits que vous avez regardés"
      />
      <ProductRail products={products} variant="compact" />
    </section>
  );
}
