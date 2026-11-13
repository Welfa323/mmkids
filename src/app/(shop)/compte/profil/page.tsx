"use client";

import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/modules/customer/store/auth.store";
import { Avatar, Switch } from "@/shared/ui/misc";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { formatDate } from "@/shared/lib/format";

export default function ProfilePage() {
  const user = useAuth((s) => s.user)!;
  const update = useAuth((s) => s.update);
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, birthday: user.birthday });
  const [prefs, setPrefs] = useState({ newsletter: user.newsletter, smsOptIn: user.smsOptIn, whatsappOptIn: user.whatsappOptIn });
  const fileRef = useRef<HTMLInputElement>(null);

  const onAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update({ avatar: String(reader.result) });
      toast.success("Photo de profil mise à jour");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Mes informations</h1>
      <div className="card flex flex-wrap items-center gap-5 p-5">
        <div className="relative">
          <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size="xl" />
          <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full bg-brand-600 text-white ring-4 ring-white" aria-label="Changer la photo">
            <Camera className="size-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onAvatar(e.target.files?.[0])} />
        </div>
        <div>
          <p className="text-lg font-bold">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-ink-500">Client depuis le {formatDate(user.memberSince, { long: true })}</p>
          {user.avatar && (
            <button onClick={() => update({ avatar: undefined })} className="mt-1 text-xs font-semibold text-red-600">
              Supprimer la photo
            </button>
          )}
        </div>
      </div>

      <form
        className="card space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          update({ ...form, ...prefs });
          toast.success("Informations enregistrées");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Prénom</label>
            <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label className="label">Nom</label>
            <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Date de naissance</label>
            <input type="date" className="input" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
            <p className="mt-1 text-xs text-ink-400">Pour recevoir votre coupon anniversaire 🎂</p>
          </div>
        </div>
        <div className="space-y-3 border-t border-ink-100 pt-4">
          <p className="text-sm font-bold">Préférences de communication</p>
          {[
            { key: "newsletter" as const, label: "Newsletter email (bons plans hebdomadaires)" },
            { key: "smsOptIn" as const, label: "SMS (ventes flash, suivi de livraison)" },
            { key: "whatsappOptIn" as const, label: "WhatsApp (suivi de commande, offres personnalisées)" },
          ].map((p) => (
            <div key={p.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink-700">{p.label}</span>
              <Switch checked={prefs[p.key]} onChange={(v) => setPrefs({ ...prefs, [p.key]: v })} label={p.label} />
            </div>
          ))}
        </div>
        <Button>Enregistrer les modifications</Button>
      </form>
    </div>
  );
}
