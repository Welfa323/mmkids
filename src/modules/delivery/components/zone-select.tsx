"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { ZONES, ZONE_GROUP_LABEL, type ZoneGroup } from "../data/zones";
import { cn } from "@/shared/lib/utils";

export function ZoneSelect({ value, onChange, className }: { value: string; onChange: (id: string) => void; className?: string }) {
  const groups: ZoneGroup[] = ["abidjan", "interieur", "international"];
  return (
    <label className={cn("relative flex items-center", className)}>
      <MapPin className="pointer-events-none absolute left-3 size-4 text-brand-600" />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input h-10 appearance-none pl-9 pr-9 font-medium" aria-label="Zone de livraison">
        {groups.map((g) => (
          <optgroup key={g} label={ZONE_GROUP_LABEL[g]}>
            {ZONES.filter((z) => z.group === g).map((z) => (
              <option key={z.id} value={z.id}>
                {z.group === "abidjan" ? `Abidjan — ${z.name}` : z.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-ink-400" />
    </label>
  );
}
