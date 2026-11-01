"use client";

import { useCallback, useEffect } from "react";
import { Pencil } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { resolveSphereFilterId } from "@/lib/sphere-filter-default";
import { cn } from "@/lib/utils";
import { SphereGlyph } from "./sphere-glyph";
import { SphereEditDialog } from "./sphere-edit-dialog";

const CHAMFER =
  "[clip-path:polygon(0_0,calc(100%-11px)_0,100%_11px,100%_100%,0_100%)]";

type TabProps = {
  activeId: string;
  onSelect: (sphereId: string) => void;
  ariaLabel: string;
  className?: string;
  allowEdit?: boolean;
  variant?: "default" | "tactical";
};

export function SphereTabFilter({
  activeId,
  onSelect,
  ariaLabel,
  className,
  allowEdit = true,
  variant = "default",
}: TabProps) {
  const spheres = useAppStore((s) => s.spheres);

  const selectSphere = useCallback(
    (sphereId: string) => {
      onSelect(sphereId);
    },
    [onSelect]
  );

  if (spheres.length === 0) return null;

  if (variant === "tactical") {
    return (
      <div className={cn("no-print w-full max-w-2xl", className)}>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="tablist"
          aria-label={ariaLabel}
        >
          {spheres.map((sphere) => {
            const active = activeId === sphere.id;
            return (
              <div key={sphere.id} className="relative min-w-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectSphere(sphere.id)}
                  className={cn(
                    "relative flex min-h-[2.65rem] w-full items-center justify-center px-2 py-2 text-center transition",
                    CHAMFER,
                    active
                      ? "border bg-[#0a1219]/90 font-bold text-[10px] uppercase tracking-[0.14em] sm:text-[11px]"
                      : "border border-[#1e3a5f]/80 bg-[#060a10]/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5a6d82] hover:border-[#2a4a6e] hover:text-[#8a9bb0] sm:text-[11px]"
                  )}
                  style={
                    active
                      ? {
                          borderColor: sphere.color,
                          color: sphere.color,
                          boxShadow: `0 0 18px ${sphere.color}35, inset 0 0 12px ${sphere.color}12`,
                        }
                      : undefined
                  }
                >
                  <span className="line-clamp-2 leading-tight">{sphere.name}</span>
                  <span
                    className={cn(
                      "absolute right-1 top-1 h-1.5 w-1.5 rounded-full",
                      active ? "opacity-100" : "bg-[#3d4f63] opacity-80"
                    )}
                    style={active ? { backgroundColor: sphere.color, boxShadow: `0 0 6px ${sphere.color}` } : undefined}
                    aria-hidden
                  />
                </button>
                {allowEdit && active && (
                  <SphereEditDialog
                    sphere={sphere}
                    allowDelete
                    trigger={
                      <button
                        type="button"
                        aria-label={`Редактировать: ${sphere.name}`}
                        className="absolute bottom-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded-sm border border-white/10 bg-black/50 text-white/75 hover:bg-black/70 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pencil className="h-3 w-3" />
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
  const spheres = useAppStore((s) => s.spheres);
  const activeId = useAppStore((s) => s.weekFilterSphereId);
  const setActive = useAppStore((s) => s.setWeekFilterSphereId);

  useEffect(() => {
    const resolved = resolveSphereFilterId(spheres, activeId);
    if (resolved !== activeId) setActive(resolved);
  }, [spheres, activeId, setActive]);

  return (
    <SphereTabFilter
      variant="tactical"
      activeId={activeId}
      onSelect={setActive}
      ariaLabel="Направления · 12 недель"
      className={className}
    />
  );
}

export function SphereGoalsFilter({ className }: { className?: string }) {
  const spheres = useAppStore((s) => s.spheres);
  const activeId = useAppStore((s) => s.goalsFilterSphereId);
  const setActive = useAppStore((s) => s.setGoalsFilterSphereId);

  useEffect(() => {
    const resolved = resolveSphereFilterId(spheres, activeId);
    if (resolved !== activeId) setActive(resolved);
  }, [spheres, activeId, setActive]);

  return (
    <SphereTabFilter
      activeId={activeId}
      onSelect={setActive}
      ariaLabel="Направления · цели на 12 недель"
      className={className}
    />
  );
}
