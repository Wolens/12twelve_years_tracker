"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/gamification";
import {
  addDaysISO,
  completionRateForDates,
  isoWeekday,
  isCompleted,
  isHabitDueOn,
  weekDates,
  WEEKDAY_LABELS,
} from "@/lib/habits";
import { cn } from "@/lib/utils";

const GRID_DAYS = 14;

type Props = {
  taskWeekScope: "all" | "by_week";
  statsWeek: number;
  cycleStartDate: string;
  filterSphere: string;
};

export function StatsHabitsGrid({
  taskWeekScope,
  statsWeek,
  cycleStartDate,
  filterSphere,
}: Props) {
  const habits = useAppStore((s) => s.habits);
  const completions = useAppStore((s) => s.habitCompletions);

  const today = todayISO();

  const days = useMemo(() => {
    if (taskWeekScope === "by_week") {
      return weekDates(cycleStartDate, statsWeek);
    }
    const out: string[] = [];
    for (let i = GRID_DAYS - 1; i >= 0; i--) {
      out.push(addDaysISO(today, -i));
    }
    return out;
  }, [taskWeekScope, statsWeek, cycleStartDate, today]);

  const list = useMemo(() => {
    let rows = habits.filter((h) => !h.archived);
    if (filterSphere !== "all") {
      rows = rows.filter((h) => h.sphereId === filterSphere);
    }
    return rows;
  }, [habits, filterSphere]);

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {filterSphere !== "all"
          ? "Нет привычек для выбранного направления."
          : "Нет активных привычек. Добавь в «Герой → Привычки»."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((habit) => {
        const rate = completionRateForDates(habit, completions, days);
        return (
          <div
            key={habit.id}
            className="rounded-xl border border-white/10 bg-card/20 p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{habit.title}</p>
              <span className="text-xs text-muted-foreground tabular-nums">
                {rate.done}/{rate.due || "—"} · {rate.percent}%
              </span>
            </div>
            <div className="mb-1 flex gap-0.5">
              {days.map((date) => {
                const due = isHabitDueOn(habit, date);
                const done = due && isCompleted(completions, date, habit.id);
                const future = date > today;
                return (
                  <div
                    key={date}
                    title={date}
                    className={cn(
                      "h-6 flex-1 rounded-sm",
                      !due && "bg-white/5 opacity-40",
                      due && future && "border border-dashed border-white/15 bg-white/[0.03]",
                      due && !future && !done && "bg-white/10",
                      due && !future && done && "bg-primary/70"
                    )}
                  />
                );
              })}
            </div>
            {taskWeekScope === "by_week" && (
              <div className="flex gap-0.5">
                {days.map((date) => (
                  <div
                    key={`${date}-label`}
                    className="flex-1 text-center text-[8px] text-muted-foreground/80"
                  >
                    {WEEKDAY_LABELS[isoWeekday(date)]}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
