"use client";

import { CheckCircle2, KeyRound, Laptop, LogOut, ShieldAlert, ShieldCheck, Smartphone, XCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/modules/customer/store/auth.store";
import { LOGIN_HISTORY, SESSIONS } from "@/modules/customer/data/account-extras";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatDateTime } from "@/shared/lib/format";

export default function SecurityPage() {
  const user = useAuth((s) => s.user)!;
  const update = useAuth((s) => s.update);
  const [sessions, setSessions] = useState(SESSIONS);
  const [setup2fa, setSetup2fa] = useState(false);
  const [code, setCode] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Sécurité du compte</h1>

      <div className="card divide-y divide-ink-100">
        <div className="flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <ShieldCheck className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">Double authentification (2FA)</p>
            <p className="text-sm text-ink-500">Un code par SMS ou application d&apos;authentification à chaque nouvelle connexion.</p>
          </div>
          <Switch
            checked={user.twoFactor}
            onChange={(v) => {
              if (v) setSetup2fa(true);
              else {
                update({ twoFactor: false });
                toast.info("2FA désactivée");
              }
            }}
            label="Double authentification"
          />
        </div>
        <div className="flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-ink-100 text-ink-700">
            <KeyRound className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">Mot de passe</p>
            <p className="text-sm text-ink-500">Modifié il y a 4 mois</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("Lien de modification envoyé par email")}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Appareils connectés</h2>
          <button
            onClick={() => {
              setSessions(sessions.filter((s) => s.current));
              toast.success("Tous les autres appareils ont été déconnectés");
            }}
            className="text-sm font-semibold text-red-600"
          >
            Déconnecter les autres
          </button>
        </div>
        <ul className="divide-y divide-ink-100">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <span className="grid size-10 place-items-center rounded-xl bg-ink-100 text-ink-600">{s.device.includes("iPhone") || s.device.includes("Android") ? <Smartphone className="size-5" /> : <Laptop className="size-5" />}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {s.device} {s.current && <span className="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">Cet appareil</span>}
                </p>
                <p className="text-xs text-ink-500">
                  {s.location} · IP {s.ip} · {s.lastActive}
                </p>
              </div>
              {!s.current && (
                <button onClick={() => (setSessions(sessions.filter((x) => x.id !== s.id)), toast.success("Appareil déconnecté"))} className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label="Déconnecter">
                  <LogOut className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-bold">Historique des connexions</h2>
        <ul className="divide-y divide-ink-100">
          {LOGIN_HISTORY.map((l, i) => (
            <li key={i} className="flex items-center gap-3 py-3 text-sm">
              {l.ok ? <CheckCircle2 className="size-5 text-brand-600" /> : <XCircle className="size-5 text-red-500" />}
              <div className="flex-1">
                <p className="font-medium">
                  {l.device} · {l.method}
                </p>
                <p className="text-xs text-ink-500">
                  {l.location} · {formatDateTime(l.at)}
                </p>
              </div>
              {!l.ok && (
                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                  <ShieldAlert className="size-3" /> Tentative bloquée
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <Modal open={setup2fa} onClose={() => setSetup2fa(false)} title="Activer la double authentification">
        <div className="space-y-4 p-5">
          <p className="text-sm text-ink-600">Un code à 6 chiffres vient d&apos;être envoyé au {user.phone}. (Démo : saisissez n&apos;importe quel code.)</p>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="input h-14 text-center font-mono text-2xl tracking-[0.5em]" placeholder="••••••" inputMode="numeric" />
          <Button
            className="w-full"
            disabled={code.length < 6}
            onClick={() => {
              update({ twoFactor: true });
              setSetup2fa(false);
              setCode("");
              toast.success("Double authentification activée 🔒");
            }}
          >
            Activer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
