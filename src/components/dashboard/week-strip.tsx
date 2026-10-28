"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeekData } from "@/types";

type Props = {
  activeWeek: number;
  weeks: WeekData[];
  selectedWeek: number;
  onSelect: (week: number) => void;
};

export function WeekStrip({ activeWeek, weeks, selectedWeek, onSelect }: Props) {
  return (
    <div className="no-print overflow-x-auto pb-2" data-tour="week-map">
      <div className="flex min-w-max gap-2 px-4 md:grid md:min-w-0 md:grid-cols-6 md:gap-2 lg:grid-cols-12">
        {weeks.map((w) => {
          const isCurrent = w.number === activeWeek;
          const isPast = w.number < activeWeek;
          const isSelected = w.number === selectedWeek;
          return (
            <button
              key={w.number}
              type="button"
              onClick={() => onSelect(w.number)}
              title={`Неделя ${w.number}`}
              className={cn(
                "relative flex h-14 w-14 shrink-0 touch-manipulation flex-col items-center justify-center rounded-xl border border-t-2 text-sm font-semibold transition-transform duration-75 active:scale-95 md:h-16 md:w-full",
                isSelected
                  ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(52,211,153,0.25)]"
                  : "border-white/10 bg-card/40 hover:border-white/20",
                isCurrent && !isSelected && "ring-1 ring-primary/50"
              )}
            >
              {w.bonusAwarded ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <span>{w.number}</span>
              )}
              <span className="text-[9px] font-normal text-muted-foreground">нед</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
