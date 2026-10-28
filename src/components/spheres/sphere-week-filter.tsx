"use client";

import { useCallback } from "react";
import { Pencil } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { SphereGlyph } from "./sphere-glyph";
import { SphereEditDialog } from "./sphere-edit-dialog";

type TabProps = {
  activeId: string;
  onSelect: (sphereId: string) => void;
  ariaLabel: string;
  className?: string;
  allowEdit?: boolean;
};

export function SphereTabFilter({
  activeId,
  onSelect,
  ariaLabel,
  className,
  allowEdit = true,
}: TabProps) {
  const spheres = useAppStore((s) => s.spheres);

  const selectSphere = useCallback(
    (sphereId: string) => {
      onSelect(sphereId);
    },
    [onSelect]
  );

  if (spheres.length === 0) return null;

  const cols =
    spheres.length <= 2
      ? "grid-cols-2"
      : spheres.length === 3
        ? "grid-cols-3"
        : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={cn("no-print w-full max-w-2xl", className)}>
      <div
        className={cn("grid gap-1.5 sm:gap-2", cols)}
        role="tablist"
        aria-label={ariaLabel}
      >
        {spheres.map((sphere) => {
          const active = activeId === sphere.id;

          return (
            <div
              key={sphere.id}
              className={cn(
                "relative flex min-w-0 items-stretch",
                active && "overflow-hidden rounded-lg border border-opacity-90 bg-secondary dark:bg-black/45"
              )}
              style={
                active
                  ? {
                      borderColor: sphere.color,
                      boxShadow: `0 0 20px ${sphere.color}40, inset 0 0 14px ${sphere.color}20`,
                    }
                  : undefined
              }
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectSphere(sphere.id)}
                className={cn(
                  "relative box-border flex min-h-[2.35rem] w-full min-w-0 items-center gap-1.5 px-2 py-1.5 text-[9px] font-semibold uppercase leading-tight tracking-[0.06em] transition sm:min-h-[2.5rem] sm:gap-2 sm:px-2.5 sm:text-[10px] sm:tracking-[0.08em]",
                  active
                    ? "rounded-none border-0 bg-transparent pr-1 shadow-none"
                    : "rounded-lg border border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground dark:border-white/15 dark:bg-black/30 dark:text-white/55 dark:hover:border-white/25 dark:hover:text-white/80"
                )}
                style={active ? { color: sphere.color } : undefined}
              >
                <SphereGlyph
                  icon={sphere.icon}
                  color={active ? sphere.color : "#71717a"}
                  size="sm"
                  plain
                />
                <span className="min-w-0 flex-1 truncate text-left">{sphere.name}</span>
              </button>
              {active && (
                <span
                  className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: sphere.color, boxShadow: `0 0 8px ${sphere.color}` }}
                  aria-hidden
                />
              )}
              {allowEdit && active && (
                <SphereEditDialog
                  sphere={sphere}
                  allowDelete
                  trigger={
                    <button
                      type="button"
                      aria-label={`Редактировать: ${sphere.name}`}
                      className="flex w-7 shrink-0 items-center justify-center border-l border-white/10 bg-black/25 text-white/80 transition hover:bg-black/40 hover:text-white sm:w-8 dark:bg-black/40"
                      style={{ borderLeftColor: `${sphere.color}33` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  }
                />
              )}
            </div>
          );
        })}
      </div>
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
      ariaLabel="Направления · 12 недель"
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
      ariaLabel="Направления · цели на 12 недель"
      className={className}
    />
  );
}
