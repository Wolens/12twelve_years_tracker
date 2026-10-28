"use client";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { SphereGlyph } from "./sphere-glyph";

type Props = {
  className?: string;
  /** «Сегодня» и «12 недель» хранят фильтр отдельно. */
  scope?: "today" | "weeks";
};

export function SphereFilterBar({ className, scope = "today" }: Props) {
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) =>
    scope === "weeks" ? s.weekHiddenSphereIds : s.hiddenSphereIds
  );
  const toggleSphereVisibility = useAppStore((s) =>
    scope === "weeks" ? s.toggleWeekSphereVisibility : s.toggleSphereVisibility
  );

  if (spheres.length === 0) return null;

  return (
    <div
      className={cn("sticky top-3 flex w-11 shrink-0 flex-col items-center gap-1.5 self-start", className)}
      role="group"
      aria-label="Сферы"
    >
      {spheres.map((sphere) => {
        const visible = !hiddenSphereIds.includes(sphere.id);
        return (
          <button
            key={sphere.id}
            type="button"
            aria-pressed={visible}
            title={sphere.name}
            aria-label={`${visible ? "Скрыть" : "Вернуть"}: ${sphere.name}`}
            onClick={() => toggleSphereVisibility(sphere.id)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
              visible ? "border-transparent bg-white/[0.04]" : "border-dashed border-white/20 bg-transparent opacity-45"
            )}
            style={visible ? { boxShadow: `inset 0 0 0 1.5px ${sphere.color}` } : undefined}
          >
            <SphereGlyph
              icon={sphere.icon}
              color={visible ? sphere.color : "#a1a1aa"}
              size="sm"
              plain
            />
          </button>
        );
      })}
    </div>
  );
}
