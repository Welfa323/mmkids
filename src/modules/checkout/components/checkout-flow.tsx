"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, Check, ChevronRight, CreditCard, Home, Loader2, MapPin, Smartphone, Store, Truck, Zap, Building2, Package, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/modules/cart/store/cart.store";
import { useCartSummary } from "@/modules/cart/hooks/use-cart-summary";
import { CartSummaryPanel } from "@/modules/cart/components/cart-summary-panel";
import { useAuth } from "@/modules/customer/store/auth.store";
import type { Address } from "@/modules/customer/data/customer";
import { DELIVERY_MODES, PICKUP_STORES, RELAY_POINTS, TIME_SLOTS, ZONE_BY_ID, type DeliveryMode } from "@/modules/delivery";
import { ZoneSelect } from "@/modules/delivery/components/zone-select";
import { PAYMENT_METHODS, processPayment, providerFor, type PaymentMethodId, type PaymentResult } from "@/modules/payment";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";
import type { Order } from "@/modules/orders";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { EmptyState } from "@/shared/ui/misc";
import { DEMO_NOW, DAY_MS } from "@/shared/lib/clock";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const MODE_ICONS: Record<DeliveryMode, typeof Truck> = { standard: Truck, express: Zap, programmee: CalendarDays, relais: MapPin, retrait: Store };
const STEPS = ["Livraison", "Paiement", "Confirmation"];

function StepHeader({ step }: { step: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2">
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition", i < step ? "bg-brand-600 text-white" : i === step ? "bg-ink-900 text-white ring-4 ring-ink-900/10" : "bg-ink-200 text-ink-500")}>
            {i < step ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("text-sm font-semibold", i === step ? "text-ink-900" : "text-ink-400", i !== step && "max-sm:hidden")}>{s}</span>
          {i < STEPS.length - 1 && <span className={cn("h-0.5 flex-1 rounded-full", i < step ? "bg-brand-500" : "bg-ink-200")} />}
        </li>
      ))}
    </ol>
  );
}

function RadioCard({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45",
        active ? "border-brand-600 bg-brand-50/50" : "border-ink-100 bg-white hover:border-ink-200",
      )}
    >
      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2", active ? "border-brand-600" : "border-ink-300")}>{active && <span className="size-2.5 rounded-full bg-brand-600" />}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

export function CheckoutFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const cart = useCart();
  const summary = useCartSummary();
  const user = useAuth((s) => s.user);
  const addOrder = usePlacedOrders((s) => s.add);

  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState<string>("a1");
  const [guest, setGuest] = useState({ fullName: "", phone: "", email: "", details: "", landmark: "" });
  const [slot, setSlot] = useState({ day: 1, time: TIME_SLOTS[1] });
  const [method, setMethod] = useState<PaymentMethodId>("orange_money");
  const [account, setAccount] = useState("");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState<"idle" | "pending" | "failed">("idle");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [billingSame, setBillingSame] = useState(true);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (user) {
      const def = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
      setAddressId(def.id);
      cart.setZone(def.zoneId);
      setAccount(user.phone.replace("+225 ", ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!hydrated || placed)
    return (
      <div className="container-page py-10">
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );

  if (summary.lines.length === 0)
    return (
      <div className="container-page py-10">
        <EmptyState icon={<Package className="size-7" />} title="Votre panier est vide" description="Ajoutez des produits avant de passer commande." action={<Link href="/" className="link">Retour à la boutique</Link>} />
      </div>
    );

  const selectedAddress: Address | undefined = user?.addresses.find((a) => a.id === addressId);
  const zone = ZONE_BY_ID[cart.zoneId];
  const methodInfo = PAYMENT_METHODS.find((m) => m.id === method)!;
  const guestValid = user || (guest.fullName && guest.phone.length >= 8 && guest.details);
  const paymentValid = methodInfo.needsAccount === "phone" ? account.replace(/\D/g, "").length >= 8 : methodInfo.needsAccount === "card" ? card.number.replace(/\D/g, "").length >= 12 && card.exp && card.cvc.length >= 3 : true;
  const installmentsBlocked = method === "plusieurs_fois" && summary.total < 30000;

  const pay = async () => {
    setProcessing("pending");
    const orderNumber = `MK-${DEMO_NOW.toISOString().slice(2, 10).replace(/-/g, "")}-${String(9000 + Math.floor(Math.random() * 999)).padStart(4, "0")}`;
    const res = await processPayment({
      orderNumber,
      amount: summary.total,
      method,
      account: methodInfo.needsAccount === "card" ? card.number : account,
      installments: method === "plusieurs_fois" ? 3 : undefined,
      customer: { name: user ? `${user.firstName} ${user.lastName}` : guest.fullName, phone: user?.phone ?? guest.phone, email: user?.email ?? guest.email },
    });
    setResult(res);
    if (res.status === "echoue") {
      setProcessing("failed");
      return;
    }
    const now = new Date().toISOString();
    const order: Order = {
      id: `demo-${Date.now()}`,
      number: orderNumber,
      customerId: user?.id ?? "guest",
      customerName: user ? `${user.firstName} ${user.lastName}` : guest.fullName,
      phone: user?.phone ?? guest.phone,
      email: user?.email ?? guest.email,
      items: summary.lines.filter((l) => !l.unavailable).map((l) => ({ productId: l.productId, name: l.product.name, image: l.product.images[0], variant: Object.values(l.selection).join(" · ") || undefined, qty: l.qty, unitPrice: l.unitPrice, unitCost: l.product.costPrice, category: l.product.category })),
      subtotal: summary.subtotal,
      discount: summary.promoDiscount + summary.voucherDiscount + summary.pointsDiscount,
      promoCode: cart.promoCode,
      shippingFee: summary.shipping.fee,
      total: summary.total,
      paymentMethod: method,
      paymentRef: res.reference,
      paidAmount: res.amountCaptured,
      deliveryMode: cart.mode,
      zoneId: cart.zoneId,
      city: zone.group === "abidjan" ? `Abidjan · ${zone.name}` : zone.name,
      address: cart.mode === "retrait" ? (PICKUP_STORES.find((s) => s.id === cart.pickupStoreId) ?? PICKUP_STORES[0]).name : cart.mode === "relais" ? (RELAY_POINTS.find((r) => r.id === cart.relayId) ?? RELAY_POINTS[0]).name : (selectedAddress?.details ?? guest.details),
      status: res.status === "en_attente" ? (method === "livraison" ? "nouvelle" : "paiement_en_attente") : "payee",
      history: [
        { status: "nouvelle", at: now, by: "Client", note: note || undefined },
        ...(res.status === "confirme" || res.status === "partiel" ? [{ status: "payee" as const, at: now, by: "Système", note: res.message }] : []),
      ],
      channel: "Site web",
      storeId: "entrepot-abidjan",
      createdAt: now,
    };
    addOrder(order);
    setPlaced(true);
    cart.clear();
    router.push(`/commande/confirmation?n=${order.number}`);
  };

  return (
    <div className="container-page grid items-start gap-6 py-6 lg:grid-cols-[1fr_400px]">
      <div>
        <StepHeader step={step} />

        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <section className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
                <Home className="size-5 text-brand-600" /> Adresse de livraison
              </h2>
              {user ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {user.addresses.map((a) => (
                    <RadioCard
                      key={a.id}
                      active={addressId === a.id}
                      onClick={() => {
                        setAddressId(a.id);
                        cart.setZone(a.zoneId);
                      }}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold">
                        {a.label} {a.isDefault && <span className="rounded-md bg-brand-100 px-1.5 text-[10px] font-bold uppercase text-brand-700">Par défaut</span>}
                      </span>
                      <span className="mt-1 block text-sm text-ink-600">
                        {a.fullName} · {a.phone}
                      </span>
                      <span className="block text-sm text-ink-500">
                        {a.details}, {ZONE_BY_ID[a.zoneId]?.name}
                      </span>
                      {a.landmark && <span className="mt-0.5 block text-xs text-ink-400">Repère : {a.landmark}</span>}
                    </RadioCard>
                  ))}
                  <Link href="/compte/adresses" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 p-4 text-sm font-semibold text-ink-500 hover:border-brand-400 hover:text-brand-700">
                    <Pencil className="size-4" /> Gérer mes adresses
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-900">
                    Déjà client ?{" "}
                    <Link href="/connexion?retour=/commande" className="font-semibold underline">
                      Connectez-vous
                    </Link>{" "}
                    pour retrouver vos adresses et vos points. Sinon, commandez en invité :
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Nom complet *</label>
                      <input className="input" value={guest.fullName} onChange={(e) => setGuest({ ...guest, fullName: e.target.value })} placeholder="Aya Koné" />
                    </div>
                    <div>
                      <label className="label">Téléphone *</label>
                      <input className="input" inputMode="tel" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} placeholder="07 07 00 00 00" />
                    </div>
                    <div>
                      <label className="label">Email (pour la facture)</label>
                      <input className="input" type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} placeholder="aya@exemple.ci" />
                    </div>
                    <div>
                      <label className="label">Commune / ville *</label>
                      <ZoneSelect value={cart.zoneId} onChange={cart.setZone} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Adresse précise *</label>
                      <input className="input" value={guest.details} onChange={(e) => setGuest({ ...guest, details: e.target.value })} placeholder="Quartier, rue, immeuble, porte…" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Point de repère</label>
                      <input className="input" value={guest.landmark} onChange={(e) => setGuest({ ...guest, landmark: e.target.value })} placeholder="Ex. derrière la pharmacie, face à l'école…" />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="card p-5">
              <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold">
                <Truck className="size-5 text-brand-600" /> Mode de livraison
              </h2>
              <p className="mb-4 text-sm text-ink-500">
                Zone : <b className="text-ink-800">{zone.group === "abidjan" ? `Abidjan — ${zone.name}` : zone.name}</b>
              </p>
              <div className="space-y-3">
                {DELIVERY_MODES.map((m) => {
                  const Icon = MODE_ICONS[m.id];
                  const disabled = (m.id === "express" && !zone.expressAvailable) || (m.id === "programmee" && zone.group === "international");
                  const fee = m.id === "retrait" ? 0 : m.id === "relais" ? 500 : zone.fee + m.surcharge;
                  return (
                    <RadioCard key={m.id} active={cart.mode === m.id} onClick={() => cart.setMode(m.id)} disabled={disabled}>
                      <span className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-semibold">
                          <Icon className="size-[18px] text-brand-600" /> {m.label}
                        </span>
                        <span className="text-sm font-bold">{fee === 0 || (m.id === "standard" && summary.shipping.free && cart.mode === "standard") ? <span className="text-brand-700">Gratuit</span> : formatPrice(fee)}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-500">{disabled ? "Non disponible pour cette zone" : m.description}</span>

                      {cart.mode === m.id && m.id === "programmee" && (
                        <span className="mt-3 block space-y-2" onClick={(e) => e.stopPropagation()}>
                          <span className="no-scrollbar flex gap-2 overflow-x-auto">
                            {[1, 2, 3, 4, 5, 6].map((d) => {
                              const date = new Date(DEMO_NOW.getTime() + d * DAY_MS);
                              return (
                                <span key={d} role="button" onClick={() => setSlot({ ...slot, day: d })} className={cn("shrink-0 cursor-pointer rounded-xl border px-3 py-2 text-center text-xs", slot.day === d ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 bg-white")}>
                                  {formatDate(date, { weekday: true }).split(" ").slice(0, 3).join(" ")}
                                </span>
                              );
                            })}
                          </span>
                          <span className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((t) => (
                              <span key={t} role="button" onClick={() => setSlot({ ...slot, time: t })} className={cn("cursor-pointer rounded-xl border px-2 py-2 text-center text-xs font-medium", slot.time === t ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 bg-white")}>
                                {t}
                              </span>
                            ))}
                          </span>
                        </span>
                      )}
                      {cart.mode === m.id && m.id === "relais" && (
                        <span className="mt-3 grid gap-2" onClick={(e) => e.stopPropagation()}>
                          {RELAY_POINTS.map((r) => (
                            <span key={r.id} role="button" onClick={() => cart.setRelay(r.id)} className={cn("flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm", (cart.relayId ?? RELAY_POINTS[0].id) === r.id ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-white")}>
                              <span>
                                <b className="font-semibold">{r.name}</b>
                                <span className="block text-xs text-ink-500">{r.address}</span>
                              </span>
                              {formatPrice(r.fee)}
                            </span>
                          ))}
                        </span>
                      )}
                      {cart.mode === m.id && m.id === "retrait" && (
                        <span className="mt-3 grid gap-2" onClick={(e) => e.stopPropagation()}>
                          {PICKUP_STORES.map((s) => (
                            <span key={s.id} role="button" onClick={() => cart.setPickupStore(s.id)} className={cn("block cursor-pointer rounded-xl border px-3 py-2 text-sm", (cart.pickupStoreId ?? PICKUP_STORES[0].id) === s.id ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-white")}>
                              <b className="font-semibold">{s.name}</b> · <span className="text-ink-500">{s.address}</span>
                              <span className="block text-xs text-ink-400">{s.hours}</span>
                            </span>
                          ))}
                        </span>
                      )}
                    </RadioCard>
                  );
                })}
              </div>
              <div className="mt-4">
                <label className="label">Instructions pour le livreur (facultatif)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input h-20 py-2.5" placeholder="Ex. appeler 10 min avant, sonner au portail vert…" />
              </div>
            </section>

            <Button size="lg" className="w-full" disabled={!guestValid || !summary.shipping.available} onClick={() => (setStep(1), window.scrollTo({ top: 0, behavior: "smooth" }))}>
              Continuer vers le paiement <ChevronRight className="size-5" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <section className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
                <CreditCard className="size-5 text-brand-600" /> Moyen de paiement
              </h2>
              {(["mobile", "carte", "autre"] as const).map((g) => (
                <div key={g} className="mb-5 last:mb-0">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">{g === "mobile" ? "Mobile Money" : g === "carte" ? "Carte bancaire" : "Autres moyens"}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PAYMENT_METHODS.filter((m) => m.group === g).map((m) => (
                      <RadioCard key={m.id} active={method === m.id} onClick={() => setMethod(m.id)} disabled={m.id === "livraison" && zone.group === "international"}>
                        <span className="flex items-center gap-2.5">
                          <span className={cn("grid h-8 min-w-11 place-items-center rounded-lg px-1.5 text-[11px] font-extrabold", m.color)}>{m.short}</span>
                          <span>
                            <span className="block text-sm font-semibold">{m.label}</span>
                            <span className="block text-xs text-ink-500">{m.description}</span>
                          </span>
                        </span>
                      </RadioCard>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="card p-5">
              {methodInfo.needsAccount === "phone" && (
                <div>
                  <label className="label">Numéro {methodInfo.label}</label>
                  <div className="flex">
                    <span className="flex h-11 items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-600">+225</span>
                    <input className="input rounded-l-none" inputMode="tel" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="07 07 12 34 56" />
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
                    <Smartphone className="size-3.5" /> Vous recevrez une demande de validation sur ce numéro. Démo : un numéro finissant par « 00 » simule un échec.
                  </p>
                </div>
              )}
              {methodInfo.needsAccount === "card" && (
                <div className="grid gap-3 sm:grid-cols-[1fr_120px_100px]">
                  <div>
                    <label className="label">Numéro de carte</label>
                    <input className="input font-mono" inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, "").slice(0, 19) })} placeholder="4242 4242 4242 4242" />
                  </div>
                  <div>
                    <label className="label">Expiration</label>
                    <input className="input font-mono" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })} placeholder="12/28" />
                  </div>
                  <div>
                    <label className="label">CVC</label>
                    <input className="input font-mono" inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" />
                  </div>
                  {method === "plusieurs_fois" && (
                    <p className={cn("rounded-xl px-3 py-2.5 text-sm sm:col-span-3", installmentsBlocked ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-900")}>
                      {installmentsBlocked ? "Le paiement en 3 fois est disponible dès 30 000 FCFA." : `3 prélèvements de ${formatPrice(Math.ceil(summary.total / 3))} : aujourd'hui, dans 30 jours et dans 60 jours.`}
                    </p>
                  )}
                  {method === "acompte" && <p className="rounded-xl bg-gold-50 px-3 py-2.5 text-sm text-ink-800 sm:col-span-3">Acompte de {formatPrice(Math.ceil(summary.total * 0.3))} aujourd&apos;hui, solde de {formatPrice(summary.total - Math.ceil(summary.total * 0.3))} à la livraison.</p>}
                </div>
              )}
              {method === "livraison" && <p className="text-sm text-ink-700">Vous paierez <b>{formatPrice(summary.total)}</b> en espèces ou par Mobile Money au livreur. Préparez l&apos;appoint si possible 🙏</p>}
              {method === "virement" && (
                <div className="space-y-1 text-sm text-ink-700">
                  <p>Votre commande sera réservée 48 h. Coordonnées bancaires :</p>
                  <p className="rounded-xl bg-ink-50 p-3 font-mono text-xs">MELAINE MARKET KIDS SARL · Banque Atlantique CI · CI034 01001 012345678901 23</p>
                </div>
              )}
              <p className="mt-4 text-xs text-ink-400">Traité par : {providerFor(method).name}</p>
              <label className="mt-4 flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="size-4 accent-brand-600" />
                Adresse de facturation identique à la livraison
              </label>
              {!billingSame && user && <p className="mt-2 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">Facturation : {user.billing.company} · NCC {user.billing.taxId} · {user.billing.address}</p>}
            </section>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep(0)}>
                Retour
              </Button>
              <Button size="lg" className="flex-1" disabled={!paymentValid || installmentsBlocked} onClick={() => (setStep(2), window.scrollTo({ top: 0, behavior: "smooth" }))}>
                Vérifier ma commande <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <section className="card divide-y divide-ink-100">
              <div className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Livraison</p>
                  <p className="mt-1 font-semibold">{DELIVERY_MODES.find((m) => m.id === cart.mode)!.label}</p>
                  <p className="text-sm text-ink-600">
                    {cart.mode === "retrait"
                      ? (PICKUP_STORES.find((s) => s.id === cart.pickupStoreId) ?? PICKUP_STORES[0]).name
                      : cart.mode === "relais"
                        ? (RELAY_POINTS.find((r) => r.id === cart.relayId) ?? RELAY_POINTS[0]).name
                        : `${selectedAddress?.details ?? guest.details}, ${zone.name}`}
                  </p>
                  <p className="text-sm text-brand-700">{cart.mode === "programmee" ? `${formatDate(new Date(DEMO_NOW.getTime() + slot.day * DAY_MS), { weekday: true })} · ${slot.time}` : summary.shipping.eta}</p>
                </div>
                <button onClick={() => setStep(0)} className="text-sm font-semibold text-brand-700">
                  Modifier
                </button>
              </div>
              <div className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Paiement</p>
                  <p className="mt-1 font-semibold">{methodInfo.label}</p>
                  <p className="text-sm text-ink-600">{methodInfo.needsAccount === "phone" ? `+225 ${account}` : methodInfo.needsAccount === "card" ? `•••• ${card.number.replace(/\D/g, "").slice(-4)}` : methodInfo.description}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-sm font-semibold text-brand-700">
                  Modifier
                </button>
              </div>
              <ul className="p-5">
                {summary.lines.map((l) => (
                  <li key={l.key} className="flex items-center gap-3 py-2">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                      <Image src={l.product.images[0]} alt="" fill sizes="56px" className="object-contain p-1" />
                      <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-ink-800 text-[10px] font-bold text-white">{l.qty}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-medium">{l.product.name}</span>
                      <span className="text-xs text-ink-500">{Object.values(l.selection).join(" · ")}</span>
                    </span>
                    <span className="text-sm font-bold">{formatPrice(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <p className="text-xs text-ink-500">
              En validant, vous acceptez nos conditions générales de vente. Vos données sont protégées conformément à la loi ivoirienne n° 2013-450 relative à la protection des données personnelles.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button size="lg" className="flex-1" onClick={pay}>
                {method === "livraison" || method === "virement" ? "Confirmer la commande" : `Payer ${formatPrice(method === "plusieurs_fois" ? Math.ceil(summary.total / 3) : method === "acompte" ? Math.ceil(summary.total * 0.3) : summary.total)}`}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-24">
        <CartSummaryPanel summary={summary} compact={step === 2} />
      </div>

      <Modal open={processing !== "idle"} onClose={() => processing === "failed" && setProcessing("idle")}>
        <div className="p-6 text-center">
          {processing === "pending" ? (
            <>
              <Loader2 className="mx-auto size-12 animate-spin text-brand-600" />
              <p className="mt-4 text-lg font-bold">Paiement en cours…</p>
              <p className="mt-1 text-sm text-ink-500">
                {methodInfo.needsAccount === "phone" ? `Validez la demande ${methodInfo.label} sur votre téléphone (+225 ${account}).` : methodInfo.needsAccount === "card" ? "Authentification 3-D Secure en cours…" : "Enregistrement de votre commande…"}
              </p>
            </>
          ) : (
            <>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="size-7" />
              </span>
              <p className="mt-4 text-lg font-bold">Le paiement a échoué</p>
              <p className="mt-1 text-sm text-ink-500">{result?.message}</p>
              <p className="mt-1 text-xs text-ink-400">Réf. {result?.reference} — aucun montant n&apos;a été débité. Votre panier est conservé.</p>
              <div className="mt-5 grid gap-2">
                <Button onClick={() => (setProcessing("idle"), pay())}>Réessayer</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setProcessing("idle");
                    setStep(1);
                  }}
                >
                  Choisir un autre moyen de paiement
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMethod("livraison");
                    setProcessing("idle");
                  }}
                >
                  <Building2 className="size-4" /> Payer plutôt à la livraison
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
