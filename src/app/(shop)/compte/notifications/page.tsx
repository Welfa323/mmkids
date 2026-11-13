"use client";

import Link from "next/link";
import { Bell, CreditCard, Gift, Package, RotateCcw, Sparkles, Truck, Wallet } from "lucide-react";
import { useState } from "react";
import { CUSTOMER_NOTIFICATIONS, NOTIFICATION_PREFS } from "@/modules/customer/data/account-extras";
import { DEMO_NOW } from "@/shared/lib/clock";
import { timeAgo } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const ICON = { commande: Package, paiement: CreditCard, livraison: Truck, promo: Gift, produit: Sparkles, retour: RotateCcw, remboursement: Wallet };

export default function NotificationsPage() {
  const [items, setItems] = useState(CUSTOMER_NOTIFICATIONS);
  const [prefs, setPrefs] = useState(NOTIFICATION_PREFS);
  const unread = items.filter((n) => !n.read).length;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Notifications {unread > 0 && <span className="ml-1 rounded-full bg-accent-500 px-2 py-0.5 align-middle text-sm text-white">{unread}</span>}
        </h1>
        <button onClick={() => setItems(items.map((n) => ({ ...n, read: true })))} className="text-sm font-semibold text-brand-700">
          Tout marquer comme lu
        </button>
      </div>
      <div className="card divide-y divide-ink-100">
        {items.map((n) => {
          const Icon = ICON[n.kind];
          const content = (
            <div className={cn("flex gap-3 p-4 transition hover:bg-ink-50/60", !n.read && "bg-brand-50/40")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", n.kind === "promo" ? "bg-accent-50 text-accent-600" : "bg-brand-50 text-brand-700")}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="shrink-0 text-xs text-ink-400">{timeAgo(n.at, DEMO_NOW)}</span>
                </div>
                <p className="text-sm text-ink-600">{n.body}</p>
              </div>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-500" />}
            </div>
          );
          return n.href ? (
            <Link key={n.id} href={n.href} onClick={() => setItems(items.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>

      <div className="card overflow-x-auto p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Bell className="size-5 text-brand-600" /> Préférences par canal
        </h2>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-400">
              <th className="pb-2">Événement</th>
              {["Email", "SMS", "WhatsApp", "Push"].map((c) => (
                <th key={c} className="pb-2 text-center">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {prefs.map((p, i) => (
              <tr key={p.event}>
                <td className="py-2.5 text-ink-700">{p.event}</td>
                {(["email", "sms", "whatsapp", "push"] as const).map((k) => (
                  <td key={k} className="py-2.5 text-center">
                    <input type="checkbox" checked={p[k]} onChange={(e) => setPrefs(prefs.map((x, j) => (j === i ? { ...x, [k]: e.target.checked } : x)))} className="size-4 accent-brand-600" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
