"use client";

import { useState } from "react";
import { NOTIFICATION_EVENTS, type Audience, type NotificationEvent } from "@/modules/notifications";
import { PageHeader, Tabs } from "@/modules/admin/components/ui";
import { Modal } from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";

const CHANNELS = ["email", "sms", "whatsapp", "push"] as const;
const LABEL = { email: "Email", sms: "SMS", whatsapp: "WhatsApp", push: "Push" };

export default function NotificationsAdminPage() {
  const [tab, setTab] = useState<Audience>("client");
  const [events, setEvents] = useState<NotificationEvent[]>(NOTIFICATION_EVENTS);
  const [edit, setEdit] = useState<NotificationEvent | null>(null);

  return (
    <div>
      <PageHeader title="Notifications" description="Système centralisé : chaque événement déclenche les bons messages, sur les bons canaux, vers les bonnes personnes" />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "client", label: "Notifications clients" }, { id: "commercant", label: "Alertes commerçant" }]} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3 text-left">Événement</th>
              <th className="px-4 py-3 text-left">Modèle</th>
              {CHANNELS.map((c) => (
                <th key={c} className="px-3 py-3 text-center">
                  {LABEL[c]}
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {events
              .filter((e) => e.audience === tab)
              .map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium">{e.label}</td>
                  <td className="max-w-xs px-4 py-3 text-xs text-ink-500">
                    <span className="line-clamp-1">{e.template}</span>
                  </td>
                  {CHANNELS.map((c) => (
                    <td key={c} className="px-3 py-3 text-center">
                      <input type="checkbox" className="size-4 accent-brand-600" checked={e.channels[c]} onChange={(ev) => setEvents(events.map((x) => (x.id === e.id ? { ...x, channels: { ...x.channels, [c]: ev.target.checked } } : x)))} aria-label={`${e.label} par ${LABEL[c]}`} />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => setEdit(e)} className="text-xs font-semibold text-brand-700">
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-500">Fournisseurs : email transactionnel, passerelle SMS opérateurs CI, WhatsApp Business API, notifications push PWA.</p>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.label}>
        {edit && (
          <div className="space-y-3 p-5">
            <label className="label">Modèle du message</label>
            <textarea className="input h-28 py-2.5" defaultValue={edit.template} />
            <p className="text-xs text-ink-500">Variables : {"{prénom}"}, {"{numéro}"}, {"{total}"}, {"{lien}"}, {"{transporteur}"}, {"{produit}"}…</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => toast.success("Message de test envoyé", { description: "sur votre WhatsApp et votre email" })}>
                Envoyer un test
              </Button>
              <Button className="flex-1" onClick={() => (setEdit(null), toast.success("Modèle enregistré"))}>
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
