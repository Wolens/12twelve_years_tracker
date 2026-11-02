"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/gamification";
import { habitsDueOn } from "@/lib/habits";
import { TodayHabitRow } from "@/components/today/today-habit-row";
import { previewHabitCompletionRewards } from "@/lib/rpg/task-rewards";
import type { TaskRewardFlashPayload } from "@/components/today/task-reward-flash";

type Props = {
  onReward?: (payload: TaskRewardFlashPayload) => void;
};

export function TodayHabitsSection({ onReward }: Props) {
  const habits = useAppStore((s) => s.habits);
  const completions = useAppStore((s) => s.habitCompletions);
  const adjust = useAppStore((s) => s.adjustHabitCountForDate);

  const today = todayISO();
  const due = useMemo(() => habitsDueOn(habits, today), [habits, today]);
  const activeCount = habits.filter((h) => !h.archived).length;
  const preview = previewHabitCompletionRewards();

  if (due.length === 0 && activeCount === 0) {
    return (
      <section className="space-y-3" data-tour="today-habits">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Привычки на сегодня
        </h2>
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-muted-foreground">
          Привычек пока нет.{" "}
          <Link
            href="/hero?tab=habits"
            scroll={false}
            className="text-primary underline-offset-2 hover:underline"
          >
            Добавить в «Герой → Привычки»
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3" data-tour="today-habits">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Привычки на сегодня
      </h2>
      {due.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-muted-foreground">
          На сегодня по расписанию ничего нет.
        </p>
      ) : (
        <div className="space-y-2">
          {due.map((habit) => (
            <TodayHabitRow
              key={habit.id}
              habit={habit}
              dateISO={today}
              completions={completions}
              onAdjust={(delta) => {
                adjust(habit.id, delta, today);
                if (delta > 0) {
                  onReward?.({
                    taskId: `habit:${habit.id}:${Date.now()}`,
                    title: habit.title,
                    xp: preview.xp,
                    coins: preview.coins,
                  });
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
