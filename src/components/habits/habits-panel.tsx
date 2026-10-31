"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { WEEKDAY_LABELS } from "@/lib/habits";
import type { HabitSchedule } from "@/types";

function scheduleLabel(schedule: HabitSchedule): string {
  if (schedule.kind === "daily") return "Каждый день";
  return schedule.weekdays.map((d) => WEEKDAY_LABELS[d]).join(", ");
}

export function HabitsPanel() {
  const habits = useAppStore((s) => s.habits);
  const archiveHabit = useAppStore((s) => s.archiveHabit);
  const active = useMemo(
    () => habits.filter((h) => !h.archived),
    [habits]
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <HabitFormDialog />
      </div>

      {active.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-muted-foreground">
          Пока нет привычек. Нажми «Привычка» — они отдельно от целей на 12 недель.
        </p>
      )}

      <div className="space-y-2">
        {active.map((h) => (
          <div
            key={h.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm leading-snug">{h.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {scheduleLabel(h.schedule)} ·{" "}
                {h.scope === "persistent" ? "навсегда" : "этот цикл"}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <HabitFormDialog
                edit={{
                  id: h.id,
                  title: h.title,
                  schedule: h.schedule,
                  scope: h.scope,
                }}
                trigger={
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground"
                    aria-label="Редактировать"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => {
                  if (confirm(`Убрать «${h.title}» из списка?`)) archiveHabit(h.id);
                }}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
