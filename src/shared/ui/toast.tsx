"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { create } from "zustand";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type ToastKind = "success" | "info" | "error";

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
  image?: string;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] });
    setTimeout(() => get().dismiss(id), 3800);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (title: string, opts: Partial<Omit<Toast, "id" | "kind" | "title">> = {}) => useToasts.getState().push({ kind: "success", title, ...opts }),
  info: (title: string, opts: Partial<Omit<Toast, "id" | "kind" | "title">> = {}) => useToasts.getState().push({ kind: "info", title, ...opts }),
  error: (title: string, opts: Partial<Omit<Toast, "id" | "kind" | "title">> = {}) => useToasts.getState().push({ kind: "error", title, ...opts }),
};

const ICONS = { success: CheckCircle2, info: Info, error: TriangleAlert };

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-auto lg:left-auto lg:right-6 lg:top-24 lg:items-end">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl bg-ink-900 p-3.5 text-white shadow-lift">
            {t.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.image} alt="" className="size-12 shrink-0 rounded-xl bg-white object-contain p-1" />
            ) : (
              <Icon className={cn("mt-0.5 size-5 shrink-0", t.kind === "success" ? "text-brand-300" : t.kind === "error" ? "text-accent-300" : "text-sky-300")} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <div className="mt-0.5 text-xs text-ink-300">{t.description}</div>}
              {t.action &&
                (t.action.href ? (
                  <a href={t.action.href} className="mt-1.5 inline-block text-xs font-semibold text-brand-300 hover:underline">
                    {t.action.label} →
                  </a>
                ) : (
                  <button onClick={t.action.onClick} className="mt-1.5 text-xs font-semibold text-brand-300 hover:underline">
                    {t.action.label}
                  </button>
                ))}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-ink-400 hover:text-white" aria-label="Fermer">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
