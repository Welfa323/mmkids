"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";
import { useHydrated } from "@/shared/hooks/use-hydrated";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left" | "bottom";
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Tiroir latéral (desktop) ou bottom sheet (mobile) */
export function Sheet({ open, onClose, side = "right", title, children, footer, className }: SheetProps) {
  const hydrated = useHydrated();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!hydrated || !open) return null;

  const panel = {
    right: "right-0 top-0 h-dvh w-full max-w-md animate-slide-in-right",
    left: "left-0 top-0 h-dvh w-[88%] max-w-sm animate-slide-in-left",
    bottom: "bottom-0 left-0 right-0 max-h-[88dvh] rounded-t-3xl animate-slide-up",
  }[side];

  return createPortal(
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("absolute flex flex-col shadow-lift", !className?.includes("bg-") && "bg-white", panel, className)}>
        {side === "bottom" && <div className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-ink-200" />}
        {title !== undefined && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div className="text-lg font-bold text-ink-900">{title}</div>
            <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-ink-500 hover:bg-ink-100" aria-label="Fermer">
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-ink-100 bg-white p-4 pb-safe">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Modal({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; className?: string }) {
  const hydrated = useHydrated();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!hydrated || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-end sm:place-items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("relative max-h-[92dvh] w-full animate-slide-up overflow-y-auto rounded-t-3xl bg-white shadow-lift sm:max-w-lg sm:rounded-3xl", className)}>
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
            <div className="text-lg font-bold">{title}</div>
            <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-ink-500 hover:bg-ink-100" aria-label="Fermer">
              <X className="size-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
