"use client";

import { cn } from "@/lib/utils";

export type DashboardView = "week" | "map";

export function DashboardViewTabs({
  value,
  onChange,
  className,
}: {
  value: DashboardView;
  onChange: (view: DashboardView) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("no-print mx-auto flex w-full max-w-md justify-center gap-1 px-4", className)}
      role="tablist"
      aria-label="Режим 12 недель"
    >
      {(
        [
          { id: "week" as const, label: "Неделя" },
          { id: "map" as const, label: "Карта цикла" },
        ] as const
      ).map(({ id, label }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={cn(
              "min-h-[2.25rem] flex-1 rounded-lg border px-3 text-xs font-semibold uppercase tracking-wide transition",
              active
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-white/10 bg-card/40 text-muted-foreground hover:border-white/20 hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
