"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, Database, Info, Laptop, LogOut, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ACTIVITY_LOG, ADMIN_SESSIONS, BACKUPS, SECURITY_POLICIES } from "@/modules/security";
import { KpiCard, PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { Switch } from "@/shared/ui/misc";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { DEMO_NOW } from "@/shared/lib/clock";
import { formatDateTime, timeAgo } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const LEVEL = { info: { icon: Info, tone: "text-sky-600 bg-sky-50" }, warning: { icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" }, critical: { icon: AlertOctagon, tone: "text-red-600 bg-red-50" } };

export default function SecurityAdminPage() {
  const [tab, setTab] = useState<"journal" | "sessions" | "politiques" | "sauvegardes">("journal");
  const [policies, setPolicies] = useState(SECURITY_POLICIES);
  const [sessions, setSessions] = useState(ADMIN_SESSIONS);
  const [level, setLevel] = useState<"" | "info" | "warning" | "critical">("");

  return (
    <div>
      <PageHeader title="Sécurité" description="2FA, sessions, journal d'activité, anti-brute-force, rate limiting, sauvegardes, chiffrement" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Score de sécurité" value="92 / 100" icon={<ShieldCheck className="size-4" />} hint="Activez la restriction IP pour 100" />
        <KpiCard label="Sessions actives" value={String(sessions.length)} tone="ink" icon={<Laptop className="size-4" />} />
        <KpiCard label="Tentatives bloquées (24 h)" value="17" tone="accent" icon={<Lock className="size-4" />} />
        <KpiCard label="Dernière sauvegarde" value="Hier 22 h" tone="ink" icon={<Database className="size-4" />} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "journal", label: "Journal d'activité" }, { id: "sessions", label: "Sessions & appareils" }, { id: "politiques", label: "Politiques de sécurité" }, { id: "sauvegardes", label: "Sauvegardes" }]} />

      {tab === "journal" && (
        <>
          <div className="mb-3 flex gap-1.5">
            {(["", "info", "warning", "critical"] as const).map((l) => (
              <button key={l} onClick={() => setLevel(l)} className={cn("chip h-9", level === l && "chip-active")}>
                {l === "" ? "Tout" : l === "info" ? "Info" : l === "warning" ? "Attention" : "Critique"}
              </button>
            ))}
          </div>
          <div className="card divide-y divide-ink-100">
            {ACTIVITY_LOG.filter((a) => !level || a.level === level).map((a) => {
              const L = LEVEL[a.level];
              return (
                <div key={a.id} className="flex items-start gap-3 p-4">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", L.tone)}>
                    <L.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p>
                      <b>{a.actor}</b> {a.action} <span className="font-medium text-ink-900">{a.target}</span>
                    </p>
                    <p className="text-xs text-ink-400">
                      {formatDateTime(a.at)} · IP {a.ip}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "sessions" && (
        <div className="card divide-y divide-ink-100">
          {sessions.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 p-4">
              <Laptop className="size-5 text-ink-400" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">
                  {s.user} {s.current && <span className="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">Vous</span>}
                </p>
                <p className="text-xs text-ink-500">
                  {s.device} · {s.location} · IP {s.ip} · connecté {timeAgo(s.since, DEMO_NOW)}
                </p>
              </div>
              {!s.current && (
                <Button size="sm" variant="outline" onClick={() => (setSessions(sessions.filter((x) => x.id !== s.id)), toast.success(`Session de ${s.user} fermée`))}>
                  <LogOut className="size-3.5" /> Déconnecter
                </Button>
              )}
            </div>
          ))}
          <div className="p-4">
            <Button variant="danger" size="sm" onClick={() => (setSessions(sessions.filter((s) => s.current)), toast.success("Tous les appareils ont été déconnectés"))}>
              Déconnecter tous les autres appareils
            </Button>
          </div>
        </div>
      )}

      {tab === "politiques" && (
        <div className="card divide-y divide-ink-100">
          {policies.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              {p.enabled ? <CheckCircle2 className="size-5 text-brand-600" /> : <AlertTriangle className="size-5 text-amber-500" />}
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.label}</p>
                <p className="text-xs text-ink-500">{p.description}</p>
              </div>
              <Switch checked={p.enabled} onChange={(v) => (setPolicies(policies.map((x) => (x.id === p.id ? { ...x, enabled: v } : x))), toast.info(`${p.label} : ${v ? "activé" : "désactivé"}`))} label={p.label} />
            </div>
          ))}
          <p className="p-4 text-xs text-ink-500">Protection des données clients conforme à la loi ivoirienne n° 2013-450 (ARTCI) : consentement, droit d&apos;accès et de suppression, registre des traitements.</p>
        </div>
      )}

      {tab === "sauvegardes" && (
        <Panel title="Sauvegardes automatiques" subtitle="Quotidiennes à 22 h · rétention 30 jours · copie chiffrée hors site" actions={<Button size="sm" onClick={() => toast.success("Sauvegarde manuelle lancée", { description: "Durée estimée : 3 min" })}>Sauvegarder maintenant</Button>}>
          <ul className="divide-y divide-ink-100">
            {BACKUPS.map((b) => (
              <li key={b.at} className="flex items-center gap-3 py-3 text-sm">
                <Database className="size-4 text-brand-600" />
                <span className="flex-1">{formatDateTime(b.at)}</span>
                <span className="text-ink-500">{b.size}</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">Réussie</span>
                <button onClick={() => toast.info("Restauration", { description: "Une confirmation 2FA est requise pour restaurer." })} className="text-xs font-semibold text-ink-500 hover:text-ink-900">
                  Restaurer
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
