"use client";

import { useCallback, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/gamification";
import { workingCyclePosition } from "@/lib/cycle-calendar-sync";
import { cycleTasksForWeekDay } from "@/lib/cycle-task-plan";
import { DailySeasonCard } from "@/components/engagement/daily-season-card";
import { TodayHabitsSection } from "@/components/today/today-habits-section";
import { TodayQuestRow } from "@/components/today/today-quest-row";
import { TaskRewardFlash, type TaskRewardFlashPayload } from "@/components/today/task-reward-flash";
import { previewTaskCompletionRewards } from "@/lib/rpg/task-rewards";
import type { CycleTask, Sphere } from "@/types";

export default function TodayPage() {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const activeDay = useAppStore((s) => s.activeDay);
  const dayAssignments = useAppStore((s) => s.dayAssignments);
  const profile = useAppStore((s) => s.profile);
  const toggleCycleTask = useAppStore((s) => s.toggleCycleTask);

  const [rewardFlash, setRewardFlash] = useState<TaskRewardFlashPayload | null>(null);
  const dismissReward = useCallback(() => setRewardFlash(null), []);

  const today = todayISO();
  const cal = workingCyclePosition(activeWeek, activeDay);

  const prettyDate = new Date(`${today}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const dayTasks = useMemo(
    () => cycleTasksForWeekDay(cycleTasks, dayAssignments, cal.week, cal.day),
    [cycleTasks, dayAssignments, cal.week, cal.day]
  );

  const taskRows = useMemo(() => {
    const rows: { task: CycleTask; sphere: Sphere }[] = [];
    for (const task of dayTasks) {
      const sphere = spheres.find((s) => s.id === task.sphereId);
      if (!sphere) continue;
      rows.push({ task, sphere });
    }
    rows.sort((a, b) => {
      const ia = spheres.findIndex((s) => s.id === a.sphere.id);
      const ib = spheres.findIndex((s) => s.id === b.sphere.id);
      if (ia !== ib) return ia - ib;
      return a.task.title.localeCompare(b.task.title, "ru");
    });
    return rows;
  }, [dayTasks, spheres]);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-8">
      <TaskRewardFlash payload={rewardFlash} onDismiss={dismissReward} />
      <header data-tour="today-board" className="space-y-1">
        <h1 className="font-display text-2xl font-bold">Сегодня</h1>
        <p className="text-sm text-muted-foreground">{prettyDate}</p>
        <p className="text-[11px] text-muted-foreground">
          Рабочая неделя {cal.week} · день {cal.day} (Пн–Вс)
        </p>
        <DailySeasonCard />
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Задачи на сегодня
        </h2>
        {taskRows.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-muted-foreground">
            На этот день ничего не запланировано. Назначь день задаче в «12 недель».
          </p>
        )}
        <div className="space-y-2">
          {taskRows.map(({ task, sphere }) => (
            <TodayQuestRow
              key={task.id}
              task={task}
              sphere={sphere}
              onComplete={() => {
                if (task.done) return;
                const preview = previewTaskCompletionRewards(profile.level, null, 100);
                toggleCycleTask(task.id);
                setRewardFlash({
                  title: task.title,
                  xp: preview.xp,
                  coins: preview.coins,
                });
              }}
              onUndo={() => {
                if (!task.done) return;
                toggleCycleTask(task.id);
              }}
            />
          ))}
        </div>
      </section>

      <TodayHabitsSection onReward={setRewardFlash} />
    </div>
  );
}
