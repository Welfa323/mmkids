"use client";

import { Building2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/modules/customer/store/auth.store";
import type { Address } from "@/modules/customer/data/customer";
import { ZONE_BY_ID } from "@/modules/delivery";
import { ZoneSelect } from "@/modules/delivery/components/zone-select";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { toast } from "@/shared/ui/toast";

const EMPTY: Address = { id: "", label: "", fullName: "", phone: "", zoneId: "cocody", details: "", landmark: "" };

export default function AddressesPage() {
  const user = useAuth((s) => s.user)!;
  const update = useAuth((s) => s.update);
  const [editing, setEditing] = useState<Address | null>(null);
  const [billing, setBilling] = useState(user.billing);
  const [billingOpen, setBillingOpen] = useState(false);

  const save = (a: Address) => {
    const exists = user.addresses.some((x) => x.id === a.id);
    const addresses = exists ? user.addresses.map((x) => (x.id === a.id ? a : x)) : [...user.addresses, { ...a, id: `a${Date.now()}` }];
    update({ addresses });
    setEditing(null);
    toast.success(exists ? "Adresse mise à jour" : "Adresse ajoutée");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mes adresses</h1>
          <p className="text-sm text-ink-500">Plusieurs adresses de livraison et une adresse de facturation.</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY, fullName: `${user.firstName} ${user.lastName}`, phone: user.phone })}>
          <Plus className="size-4" /> Nouvelle adresse
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {user.addresses.map((a) => (
          <div key={a.id} className="card flex flex-col p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-bold">
                <MapPin className="size-4 text-brand-600" /> {a.label}
              </p>
              {a.isDefault && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">Par défaut</span>}
            </div>
            <p className="mt-2 text-sm">{a.fullName}</p>
            <p className="text-sm text-ink-600">{a.phone}</p>
            <p className="text-sm text-ink-600">
              {a.details}, {ZONE_BY_ID[a.zoneId]?.name}
            </p>
            {a.landmark && <p className="text-xs text-ink-400">Repère : {a.landmark}</p>}
            <div className="mt-4 flex gap-2 border-t border-ink-100 pt-3">
              <button onClick={() => setEditing(a)} className="chip h-8 text-xs">
                <Pencil className="size-3.5" /> Modifier
              </button>
              {!a.isDefault && (
                <button onClick={() => (update({ addresses: user.addresses.map((x) => ({ ...x, isDefault: x.id === a.id })) }), toast.success("Adresse par défaut modifiée"))} className="chip h-8 text-xs">
                  <Star className="size-3.5" /> Par défaut
                </button>
              )}
              {!a.isDefault && (
                <button onClick={() => (update({ addresses: user.addresses.filter((x) => x.id !== a.id) }), toast.info("Adresse supprimée"))} className="chip ml-auto h-8 text-xs text-red-600">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-bold">
            <Building2 className="size-4 text-brand-600" /> Adresse de facturation
          </p>
          <button onClick={() => setBillingOpen(true)} className="text-sm font-semibold text-brand-700">
            Modifier
          </button>
        </div>
        <p className="mt-2 text-sm">{billing.company}</p>
        <p className="text-sm text-ink-600">N° compte contribuable : {billing.taxId}</p>
        <p className="text-sm text-ink-600">{billing.address}</p>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Modifier l'adresse" : "Nouvelle adresse"}>
        {editing && (
          <form
            className="space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              save(editing);
            }}
          >
            <div className="flex flex-wrap gap-2">
              {["Maison", "Bureau", "Parents", "Autre"].map((l) => (
                <button type="button" key={l} onClick={() => setEditing({ ...editing, label: l })} className={`chip h-8 text-xs ${editing.label === l ? "chip-active" : ""}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Nom complet</label>
                <input className="input" required value={editing.fullName} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" required value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Commune / ville</label>
              <ZoneSelect value={editing.zoneId} onChange={(z) => setEditing({ ...editing, zoneId: z })} />
            </div>
            <div>
              <label className="label">Adresse précise</label>
              <input className="input" required value={editing.details} onChange={(e) => setEditing({ ...editing, details: e.target.value })} placeholder="Quartier, rue, villa, étage…" />
            </div>
            <div>
              <label className="label">Point de repère</label>
              <input className="input" value={editing.landmark ?? ""} onChange={(e) => setEditing({ ...editing, landmark: e.target.value })} />
            </div>
            <Button className="w-full" size="lg" disabled={!editing.label}>
              Enregistrer
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={billingOpen} onClose={() => setBillingOpen(false)} title="Adresse de facturation">
        <form
          className="space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            update({ billing });
            setBillingOpen(false);
            toast.success("Facturation mise à jour");
          }}
        >
          <div>
            <label className="label">Société (facultatif)</label>
            <input className="input" value={billing.company ?? ""} onChange={(e) => setBilling({ ...billing, company: e.target.value })} />
          </div>
          <div>
            <label className="label">N° de compte contribuable (NCC)</label>
            <input className="input" value={billing.taxId ?? ""} onChange={(e) => setBilling({ ...billing, taxId: e.target.value })} />
          </div>
          <div>
            <label className="label">Adresse</label>
            <input className="input" value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} />
          </div>
          <Button className="w-full">Enregistrer</Button>
        </form>
      </Modal>
    </div>
  );
}
