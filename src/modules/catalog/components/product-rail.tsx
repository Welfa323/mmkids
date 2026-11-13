"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Product } from "../types";
import { ProductCard } from "./product-card";
import { cn } from "@/shared/lib/utils";

/** Carrousel horizontal de produits : swipe sur mobile, flèches sur desktop */
export function ProductRail({ products, variant, className }: { products: Product[]; variant?: "default" | "flash" | "compact"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  if (!products.length) return null;
  return (
    <div className={cn("group/rail relative", className)}>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {products.map((p) => (
          <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[24%] lg:w-[calc((100%-5*0.75rem)/6)]">
            <ProductCard product={p} variant={variant} className="h-full" />
          </div>
        ))}
      </div>
      <button onClick={() => scroll(-1)} className="absolute -left-4 top-1/3 hidden size-10 place-items-center rounded-full border border-ink-100 bg-white text-ink-700 opacity-0 shadow-lift transition group-hover/rail:opacity-100 lg:grid" aria-label="Précédent">
        <ChevronLeft className="size-5" />
      </button>
      <button onClick={() => scroll(1)} className="absolute -right-4 top-1/3 hidden size-10 place-items-center rounded-full border border-ink-100 bg-white text-ink-700 opacity-0 shadow-lift transition group-hover/rail:opacity-100 lg:grid" aria-label="Suivant">
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
