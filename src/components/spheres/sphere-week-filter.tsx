"use client";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { SphereGlyph } from "./sphere-glyph";

type TabProps = {
  activeId: string;
  onSelect: (sphereId: string) => void;
  ariaLabel: string;
  className?: string;
};

export function SphereTabFilter({ activeId, onSelect, ariaLabel, className }: TabProps) {
  const spheres = useAppStore((s) => s.spheres);

  if (spheres.length === 0) return null;

  return (
    <div
      className={cn(
        "no-print flex w-full max-w-lg flex-wrap justify-center gap-2 px-0 sm:gap-2.5",
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {spheres.map((sphere) => {
        const active = activeId === sphere.id;
        return (
          <button
            key={sphere.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(sphere.id)}
            className={cn(
              "relative box-border flex min-h-[2.75rem] w-[calc(50%-0.25rem)] max-w-[calc(50%-0.25rem)] min-w-0 items-center justify-center gap-2 rounded-lg border px-2.5 py-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] transition sm:min-h-[3rem] sm:w-auto sm:max-w-[11rem] sm:flex-none sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-[0.14em]",
              active
                ? "border-opacity-90 bg-secondary dark:bg-black/45"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground dark:border-white/15 dark:bg-black/30 dark:text-white/55 dark:hover:border-white/25 dark:hover:text-white/80"
            )}
            style={
              active
                ? {
                    borderColor: sphere.color,
                    color: sphere.color,
                    boxShadow: `0 0 20px ${sphere.color}40, inset 0 0 14px ${sphere.color}20`,
                  }
                : undefined
            }
          >
            <SphereGlyph icon={sphere.icon} color={active ? sphere.color : "#71717a"} size="md" plain />
            <span className="min-w-0 text-balance">{sphere.name}</span>
            {active && (
              <span
                className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: sphere.color, boxShadow: `0 0 8px ${sphere.color}` }}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SphereWeekFilter({ className }: { className?: string }) {
  const activeId = useAppStore((s) => s.weekFilterSphereId);
  const setActive = useAppStore((s) => s.setWeekFilterSphereId);
  return (
    <SphereTabFilter
      activeId={activeId}
      onSelect={setActive}
      ariaLabel="Цели недели"
      className={className}
    />
  );
}

export function SphereGoalsFilter({ className }: { className?: string }) {
  const activeId = useAppStore((s) => s.goalsFilterSphereId);
  const setActive = useAppStore((s) => s.setGoalsFilterSphereId);
  return (
    <SphereTabFilter
      activeId={activeId}
      onSelect={setActive}
      ariaLabel="Цели на 12 недель"
      className={className}
    />
  );
}
