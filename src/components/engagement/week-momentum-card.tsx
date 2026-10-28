"use client";

import { useAppStore } from "@/store/useAppStore";
import {
  closedWeeksCount,
  weekMomentumLabel,
  weekTacticalPercent,
  WEEK_TARGET_PERCENT,
} from "@/lib/week-momentum";
import Link from "next/link";

export function WeekMomentumCard() {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const weeks = useAppStore((s) => s.weeks);

  const percent = weekTacticalPercent(cycleTasks, activeWeek);
  const closed = closedWeeksCount(weeks);
  const label = weekMomentumLabel(percent);

  return (
    <div className="rounded-xl bg-black/25 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Неделя {activeWeek}
          </p>
          <p className="font-medium">{label}</p>
        </div>
        <p className="font-display text-2xl font-bold text-primary">{percent}%</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-emerald-300/90 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>Цель ~{WEEK_TARGET_PERCENT}%</span>
        <span>Недель {closed}/12</span>
      </p>
      {percent < WEEK_TARGET_PERCENT && (
        <Link href="/today" scroll={false} className="mt-1 block text-center text-[10px] text-primary">
          К задачам →
        </Link>
      )}
    </div>
  );
}
