"use client";

import { useAppStore } from "@/store/useAppStore";
import type { Goal } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

type Props = { goal: Goal };

export function GoalTasksList({ goal }: Props) {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const toggleCycleTask = useAppStore((s) => s.toggleCycleTask);

  const tasks = cycleTasks
    .filter((t) => t.goalId === goal.id)
    .sort((a, b) => a.week - b.week || a.title.localeCompare(b.title));

  if (tasks.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Нет задач. Добавьте их в «12 недель» и привяжите к этой цели.
      </p>
    );
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="mt-2 space-y-2 border-t border-white/5 pt-2">
      <p className="text-xs text-muted-foreground">
        Задачи: {done}/{tasks.length} выполнено
      </p>
      {tasks.map((t) => (
        <div key={t.id} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={t.done}
            onCheckedChange={() => toggleCycleTask(t.id)}
          />
          <span className={t.done ? "text-muted-foreground line-through" : ""}>
            Нед. {t.week}: {t.title}
          </span>
        </div>
      ))}
    </div>
  );
}
