"use client";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Props = { className?: string };

export function SphereFilterBar({ className }: Props) {
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const toggleSphereVisibility = useAppStore((s) => s.toggleSphereVisibility);

  if (spheres.length === 0) return null;

  return (
    <div className={cn("no-print space-y-1", className)}>
      <p className="text-[10px] text-muted-foreground">
        Отметьте сферы — их блоки задач появятся ниже
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
      {spheres.map((sphere) => {
        const visible = !hiddenSphereIds.includes(sphere.id);
        return (
          <button
            key={sphere.id}
            type="button"
            onClick={() => toggleSphereVisibility(sphere.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              visible
                ? "border-white/20 bg-card/80"
                : "border-white/5 bg-transparent opacity-45"
            )}
            style={
              visible
                ? { boxShadow: `0 0 12px ${sphere.color}30`, borderColor: `${sphere.color}55` }
                : undefined
            }
            title={visible ? "Скрыть сферу" : "Показать сферу"}
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-sm border",
                visible ? "border-primary bg-primary/20" : "border-white/20"
              )}
            >
              {visible && <Check className="h-3 w-3 text-primary" />}
            </span>
            <span>{sphere.icon}</span>
            <span className="max-w-[8rem] truncate">{sphere.name}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
