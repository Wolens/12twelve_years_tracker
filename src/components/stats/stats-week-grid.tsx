"use client";

import { Check } from "lucide-react";
import type { WeekStatRow } from "@/lib/stats/cycle-overview";
import { weekMomentumLabel } from "@/lib/week-momentum";
import { cn } from "@/lib/utils";

type Props = {
  rows: WeekStatRow[];
  activeWeek: number;
  activeWeekTactical: number;
  weekXp?: (week: number) => number;
};

export function StatsWeekGrid({ rows, activeWeek, activeWeekTactical, weekXp }: Props) {
  return (
    <div className="game-surface space-y-3 p-4">
      <div>
        <h2 className="font-display text-lg font-semibold">12 недель</h2>
        <p className="text-sm text-muted-foreground">
          Текущая неделя {activeWeek}: {activeWeekTactical}% ·{" "}
          {weekMomentumLabel(activeWeekTactical)}
        </p>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1.5 md:grid md:min-w-0 md:grid-cols-12 md:gap-1.5">
          {rows.map((row) => {
            const isActive = row.week === activeWeek;
            const intensity = row.total === 0 ? 0.08 : 0.15 + (row.tacticalPercent / 100) * 0.55;
            return (
              <div
                key={row.week}
                title={`Нед. ${row.week}: ${row.done}/${row.total} задач${weekXp ? ` · ${weekXp(row.week)} XP` : ""}`}
                className={cn(
                  "flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-lg border text-[10px] md:w-auto",
                  row.closed && "ring-1 ring-primary/40",
                  isActive && "border-primary/50"
                )}
                style={{
                  backgroundColor: `rgba(52, 211, 153, ${intensity})`,
                  borderColor: row.closed ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)",
                }}
              >
                {row.closed ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <span className="font-semibold">{row.week}</span>
                )}
                <span className="text-[9px] text-muted-foreground">
                  {row.total > 0 ? `${row.done}/${row.total}` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
