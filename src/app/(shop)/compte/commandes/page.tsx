"use client";

import { Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMyOrders } from "@/modules/customer/hooks/use-my-orders";
import { OrderCard } from "@/modules/orders/components/order-card";
import type { OrderStatus } from "@/modules/orders";
import { EmptyState } from "@/shared/ui/misc";
import { ButtonLink } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const FILTERS: { id: string; label: string; match: (s: OrderStatus) => boolean }[] = [
  { id: "toutes", label: "Toutes", match: () => true },
  { id: "en-cours", label: "En cours", match: (s) => ["nouvelle", "paiement_en_attente", "payee", "en_preparation", "prete", "expediee", "en_livraison"].includes(s) },
  { id: "livrees", label: "Livrées", match: (s) => s === "livree" },
  { id: "retours", label: "Retours & remboursements", match: (s) => s === "retour" || s === "remboursee" },
  { id: "annulees", label: "Annulées", match: (s) => s === "annulee" || s === "echec_paiement" },
];

function OrdersList() {
  const orders = useMyOrders();
  const initial = useSearchParams().get("filtre") ?? "toutes";
  const [filter, setFilter] = useState(initial);
  const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0];
  const list = orders.filter((o) => f.match(o.status));
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Mes commandes</h1>
      <p className="mt-1 text-sm text-ink-500">Suivez, téléchargez vos factures, demandez un retour ou recommandez en un clic.</p>
      <div className="no-scrollbar my-5 flex gap-2 overflow-x-auto">
        {FILTERS.map((x) => (
          <button key={x.id} onClick={() => setFilter(x.id)} className={cn("chip shrink-0", filter === x.id && "chip-active")}>
            {x.label} <span className="text-ink-400">({orders.filter((o) => x.match(o.status)).length})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Package className="size-7" />} title="Aucune commande ici" action={<ButtonLink href="/">Découvrir la boutique</ButtonLink>} />
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}
