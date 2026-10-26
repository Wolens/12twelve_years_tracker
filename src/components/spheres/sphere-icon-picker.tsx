"use client";

import { cn } from "@/lib/utils";
import {
  SPHERE_ICON_KEYS,
  SPHERE_ICONS,
  SPHERE_ICON_LABELS,
  type SphereIconKey,
} from "@/lib/sphere-icons";

type Props = {
  value: string;
  color: string;
  onChange: (key: SphereIconKey) => void;
};

export function SphereIconPicker({ value, color, onChange }: Props) {
  const active = (SPHERE_ICON_KEYS.includes(value as SphereIconKey)
    ? value
    : "custom") as SphereIconKey;

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {SPHERE_ICON_KEYS.map((key) => {
        const Icon = SPHERE_ICONS[key];
        const selected = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] transition-all",
              selected
                ? "border-white/25 bg-white/10"
                : "border-white/5 bg-transparent opacity-70 hover:opacity-100"
            )}
            style={
              selected
                ? { boxShadow: `0 0 0 1px ${color}55`, color }
                : undefined
            }
            title={SPHERE_ICON_LABELS[key]}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            <span className="truncate text-muted-foreground">{SPHERE_ICON_LABELS[key]}</span>
          </button>
        );
      })}
    </div>
  );
}
