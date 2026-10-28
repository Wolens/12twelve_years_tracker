"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { SphereWeekFilter } from "@/components/spheres/sphere-week-filter";
import { groupWeekTasksBySphere, visibleSpheres } from "@/lib/sphere-filters";
import { goalsForDay } from "@/lib/day-plan";
import { cn } from "@/lib/utils";
import type { CycleTask } from "@/types";
import { ArrowUp, ChevronDown } from "lucide-react";
import { DailySeasonCard } from "@/components/engagement/daily-season-card";
import { TodayQuestRow } from "@/components/today/today-quest-row";
import { TaskRewardFlash, type TaskRewardFlashPayload } from "@/components/today/task-reward-flash";
import { previewTaskCompletionRewards } from "@/lib/rpg/task-rewards";

export default function TodayPage() {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const weekFilterSphereId = useAppStore((s) => s.weekFilterSphereId);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const activeDay = useAppStore((s) => s.activeDay);
  const dayAssignments = useAppStore((s) => s.dayAssignments);
  const profile = useAppStore((s) => s.profile);
  const toggleCycleTask = useAppStore((s) => s.toggleCycleTask);
  const assignTaskToDayPlan = useAppStore((s) => s.assignTaskToDayPlan);
  const unassignTaskFromDayPlan = useAppStore((s) => s.unassignTaskFromDayPlan);
  const setActiveDay = useAppStore((s) => s.setActiveDay);
  const weeks = useAppStore((s) => s.weeks);

  const [viewWeek, setViewWeek] = useState(activeWeek);
  const [weekPoolOpen, setWeekPoolOpen] = useState(false);
  const [rewardFlash, setRewardFlash] = useState<TaskRewardFlashPayload | null>(null);

  const dismissReward = useCallback(() => setRewardFlash(null), []);

  useEffect(() => {
    setViewWeek(activeWeek);
  }, [activeWeek]);

  const today = todayISO();
  const week = viewWeek;
  const selectedDay = activeDay;
  const viewingPastOrFuture = viewWeek !== activeWeek;

  const assignedIds = goalsForDay(dayAssignments, week, selectedDay);
  const assignedTasks = assignedIds
    .map((id) => cycleTasks.find((t) => t.id === id))
    .filter((t): t is CycleTask => !!t);

  const activeSphere = spheres.find((s) => s.id === weekFilterSphereId);

  const assignedForGoal = useMemo(() => {
    if (!weekFilterSphereId) return assignedTasks;
    return assignedTasks.filter((t) => t.sphereId === weekFilterSphereId);
  }, [assignedTasks, weekFilterSphereId]);

  const weekPoolTasks = useMemo(() => {
    const assignedAnyDay = new Set<string>();
    for (let d = 1; d <= 7; d++) {
      goalsForDay(dayAssignments, week, d).forEach((id) => assignedAnyDay.add(id));
    }
    const groups = groupWeekTasksBySphere(
      cycleTasks,
      spheres,
      week,
      hiddenSphereIds,
      weekFilterSphereId
    );
    const tasks = groups[0]?.tasks ?? [];
    return tasks.filter((t) => !assignedAnyDay.has(t.id));
  }, [cycleTasks, spheres, week, hiddenSphereIds, weekFilterSphereId, dayAssignments]);

  const onDragStart = (taskId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropDay = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) assignTaskToDayPlan(taskId, week, selectedDay);
  };

  const onDropToPool = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) unassignTaskFromDayPlan(taskId, week);
  };

  const preventDrag = (e: React.DragEvent) => e.preventDefault();
  const poolCount = weekPoolTasks.length;
  const prettyDate = new Date(`${today}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
  const weekClosed = weeks.find((w) => w.number === viewWeek)?.closed;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-8">
      <TaskRewardFlash payload={rewardFlash} onDismiss={dismissReward} />
      <header data-tour="today-board" className="space-y-1">
        <h1 className="font-display text-2xl font-bold">Сегодня</h1>
        <p className="text-sm text-muted-foreground">{prettyDate}</p>
        <DailySeasonCard />
      </header>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-muted-foreground hover:bg-white/5 disabled:opacity-30"
          onClick={() => setViewWeek((n) => Math.max(1, n - 1))}
          disabled={viewWeek <= 1}
          aria-label="Предыдущая неделя"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-sm font-medium">Неделя {week}</p>
          {viewingPastOrFuture ? (
            <button
              type="button"
              className="text-[11px] text-primary"
              onClick={() => setViewWeek(activeWeek)}
            >
              К текущей · неделя {activeWeek}
            </button>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {weekClosed ? "Пролёт наверх достроен" : "Пролёт наверх ещё открыт"}
            </p>
          )}
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-muted-foreground hover:bg-white/5 disabled:opacity-30"
          onClick={() => setViewWeek((n) => Math.min(12, n + 1))}
          disabled={viewWeek >= 12}
          aria-label="Следующая неделя"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setActiveDay(day)}
            className={cn(
              "rounded-xl py-2 text-sm font-medium transition-colors",
              selectedDay === day
                ? "bg-primary text-primary-foreground"
                : "bg-card/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <SphereWeekFilter className="mx-auto" />

      <div className="space-y-4">
          <div
            onDragOver={preventDrag}
            onDrop={onDropDay}
            className="space-y-2 rounded-xl border border-white/10 bg-card/20 p-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              День {selectedDay}
            </p>
            {assignedForGoal.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {activeSphere
                  ? "На этот день задач нет. Раскрой список ниже и добавь из недели."
                  : "Выберите цель вкладкой выше."}
              </p>
            )}
            {assignedForGoal.map((task) => {
              const sphere = spheres.find((s) => s.id === task.sphereId);
              if (!sphere) return null;
              return (
                <TodayQuestRow
                  key={task.id}
                  task={task}
                  sphere={sphere}
                  onDragStart={onDragStart(task.id)}
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
                  onUnassign={() => unassignTaskFromDayPlan(task.id, week)}
                />
              );
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/30">
            <button
              type="button"
              aria-expanded={weekPoolOpen}
              onClick={() => setWeekPoolOpen((open) => !open)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  weekPoolOpen && "rotate-180"
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">
                Задачи недели
                {activeSphere ? ` · ${activeSphere.name}` : ""}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{poolCount}</span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                weekPoolOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className="space-y-2 border-t border-white/10 px-3 pb-3 pt-2"
                  onDragOver={preventDrag}
                  onDrop={onDropToPool}
                >
                  {poolCount === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {hiddenSphereIds.includes(weekFilterSphereId)
                        ? "Эта цель скрыта — выбери другую вкладку сверху."
                        : "Свободных задач на эту неделю нет. Добавь в «Цели» или «12 недель»."}
                    </p>
                  )}
                  {weekPoolTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={onDragStart(t.id)}
                      className="flex cursor-grab items-center gap-2 rounded-xl border border-white/10 bg-background/40 px-3 py-2.5 active:cursor-grabbing"
                    >
                      <p className="min-w-0 flex-1 text-sm leading-snug">{t.title}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0 px-2 text-xs"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => assignTaskToDayPlan(t.id, week, selectedDay)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                        В день
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
