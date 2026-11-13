"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, FileText, RotateCw } from "lucide-react";
import type { Order } from "../types";
import { ORDER_STATUS } from "../status";
import { getProductById } from "@/modules/catalog";
import { useCart } from "@/modules/cart/store/cart.store";
import { ToneBadge } from "@/shared/ui/badge";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatPrice } from "@/shared/lib/format";

export function useReorder() {
  const add = useCart((s) => s.add);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  return (order: Order, productId?: string) => {
    const items = order.items.filter((i) => !productId || i.productId === productId);
    let added = 0;
    items.forEach((it) => {
      const p = getProductById(it.productId);
      if (!p || p.availability === "out_of_stock" || p.availability === "coming_soon") return;
      const opt = p.options[0];
      add(p.id, opt && it.variant ? { [opt.name]: it.variant } : {}, it.qty);
      added++;
    });
    if (added) {
      toast.success(`${added} article${added > 1 ? "s" : ""} ajouté${added > 1 ? "s" : ""} au panier`, { action: { label: "Voir le panier", onClick: () => setDrawerOpen(true) } });
    } else toast.error("Ces produits ne sont plus disponibles");
  };
}

export function OrderCard({ order }: { order: Order }) {
  const reorder = useReorder();
  const s = ORDER_STATUS[order.status];
  const count = order.items.reduce((n, i) => n + i.qty, 0);
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-mono font-semibold">{order.number}</span>
          <span className="text-ink-500">{formatDate(order.createdAt)}</span>
          <span className="font-semibold">{formatPrice(order.total)}</span>
        </div>
        <ToneBadge tone={s.tone} dot={s.dot}>
          {s.customerLabel}
        </ToneBadge>
      </div>
      <Link href={`/compte/commandes/${order.id}`} className="flex items-center gap-3 p-4 hover:bg-ink-50/50">
        <div className="flex -space-x-3">
          {order.items.slice(0, 4).map((it) => (
            <span key={it.productId} className="relative size-14 overflow-hidden rounded-xl border-2 border-white bg-ink-50">
              <Image src={it.image} alt="" fill sizes="56px" className="object-contain p-1" />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-medium">{order.items.map((i) => i.name).join(", ")}</p>
          <p className="text-xs text-ink-500">
            {count} article{count > 1 ? "s" : ""} · {order.city}
          </p>
        </div>
        <ChevronRight className="size-5 text-ink-300" />
      </Link>
      <div className="flex flex-wrap gap-2 border-t border-ink-100 px-4 py-3">
        <Link href={`/compte/commandes/${order.id}`} className="chip h-8 text-xs">
          Détails & suivi
        </Link>
        <Link href={`/facture/${order.number}`} target="_blank" className="chip h-8 text-xs">
          <FileText className="size-3.5" /> Facture
        </Link>
        {order.status === "livree" && (
          <button onClick={() => reorder(order)} className="chip h-8 text-xs">
            <RotateCw className="size-3.5" /> Commander à nouveau
          </button>
        )}
      </div>
    </div>
  );
}
