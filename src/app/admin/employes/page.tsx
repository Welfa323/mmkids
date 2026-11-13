"use client";

import { Check, Minus, Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { ADMIN_MODULES, EMPLOYEES, ROLES, ROLE_BY_ID, type Action, type Role, type RoleId } from "@/modules/staff";
import { storeName } from "@/modules/stores";
import { PageHeader, Tabs } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { Avatar } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { DEMO_NOW } from "@/shared/lib/clock";
import { timeAgo } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const ACTIONS: { id: Action; label: string }[] = [
  { id: "voir", label: "Voir" },
  { id: "creer", label: "Créer" },
  { id: "modifier", label: "Modifier" },
  { id: "supprimer", label: "Supprimer" },
  { id: "exporter", label: "Exporter" },
];
const STATUS = { actif: "bg-brand-50 text-brand-700", invite: "bg-sky-50 text-sky-700", suspendu: "bg-red-50 text-red-700" };

export default function StaffPage() {
  const [tab, setTab] = useState<"equipe" | "roles">("equipe");
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [roleId, setRoleId] = useState<RoleId>("manager");
  const [invite, setInvite] = useState(false);
  const role = roles.find((r) => r.id === roleId)!;

  const toggle = (module: string, action: Action) => {
    if (roleId === "super_admin") return toast.info("Le Super Admin a tous les droits");
    setRoles(
      roles.map((r) => {
        if (r.id !== roleId) return r;
        const cur = r.permissions[module as keyof Role["permissions"]] ?? [];
        const next = cur.includes(action) ? cur.filter((a) => a !== action) : [...cur, action];
        return { ...r, permissions: { ...r.permissions, [module]: next } };
      }),
    );
  };

  return (
    <div>
      <PageHeader
        title="Employés & rôles"
        description="Super Admin, Manager, Vendeur, Magasinier, Comptable, Marketing — avec des permissions très précises"
        actions={
          <Button onClick={() => setInvite(true)}>
            <Plus className="size-4" /> Inviter un employé
          </Button>
        }
      />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "equipe", label: `Équipe (${EMPLOYEES.length})` }, { id: "roles", label: "Rôles & permissions" }]} />

      {tab === "equipe" ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Employé</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Affectation</th>
                <th className="px-4 py-3">2FA</th>
                <th className="px-4 py-3">Dernière connexion</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {EMPLOYEES.map((e) => (
                <tr key={e.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.name} size="sm" />
                      <div>
                        <p className="font-medium">{e.name}</p>
                        <p className="text-xs text-ink-400">{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", ROLE_BY_ID[e.role].tone)}>{ROLE_BY_ID[e.role].label}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-600">{e.storeId === "all" ? "Toutes les boutiques" : storeName(e.storeId)}</td>
                  <td className="px-4 py-2.5">{e.twoFactor ? <ShieldCheck className="size-4 text-brand-600" /> : <ShieldOff className="size-4 text-ink-300" />}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-500">{e.lastLogin ? timeAgo(e.lastLogin, DEMO_NOW) : "Jamais"}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold capitalize", STATUS[e.status])}>{e.status === "invite" ? "Invité" : e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {roles.map((r) => (
              <button key={r.id} onClick={() => setRoleId(r.id)} className={cn("card w-full p-3 text-left transition", roleId === r.id && "ring-2 ring-brand-500")}>
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", r.tone)}>{r.label}</span>
                <p className="mt-1.5 text-xs text-ink-500">{r.description}</p>
                <p className="mt-1 text-[11px] text-ink-400">{EMPLOYEES.filter((e) => e.role === r.id).length} employé(s)</p>
              </button>
            ))}
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Module — {role.label}</th>
                  {ACTIONS.map((a) => (
                    <th key={a.id} className="px-3 py-3 text-center">
                      {a.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {ADMIN_MODULES.map((m) => {
                  const perms = role.permissions[m.id] ?? [];
                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-2 font-medium">{m.label}</td>
                      {ACTIONS.map((a) => {
                        const on = perms.includes(a.id);
                        return (
                          <td key={a.id} className="px-3 py-2 text-center">
                            <button onClick={() => toggle(m.id, a.id)} className={cn("mx-auto grid size-7 place-items-center rounded-lg transition", on ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-300 hover:bg-ink-200")} aria-label={`${a.label} ${m.label}`} aria-pressed={on}>
                              {on ? <Check className="size-4" /> : <Minus className="size-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="border-t border-ink-100 px-4 py-3 text-xs text-ink-500">Astuce : changez de rôle depuis le menu utilisateur (en haut à droite) pour voir le back-office tel que le voit chaque employé.</p>
          </div>
        </div>
      )}

      <Modal open={invite} onClose={() => setInvite(false)} title="Inviter un employé">
        <form
          className="space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setInvite(false);
            toast.success("Invitation envoyée", { description: "Lien d'activation valable 48 h, 2FA obligatoire à la première connexion." });
          }}
        >
          <div>
            <label className="label">Nom complet</label>
            <input className="input" required />
          </div>
          <div>
            <label className="label">Email professionnel</label>
            <input className="input" type="email" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Rôle</label>
              <select className="input">
                {ROLES.map((r) => (
                  <option key={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Affectation</label>
              <select className="input">
                <option>Toutes les boutiques</option>
                <option>Boutique Cocody</option>
                <option>Boutique Marcory</option>
                <option>Boutique Yopougon</option>
                <option>Entrepôt central Abidjan</option>
                <option>Entrepôt Bouaké</option>
              </select>
            </div>
          </div>
          <Button className="w-full">Envoyer l&apos;invitation</Button>
        </form>
      </Modal>
    </div>
  );
}
