"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SphereFilterBar } from "@/components/spheres/sphere-filter-bar";
import { groupWeekTasksBySphere, visibleSpheres } from "@/lib/sphere-filters";
import { goalsForDay } from "@/lib/day-plan";
import { cn } from "@/lib/utils";
import type { CycleTask } from "@/types";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function TodayPage() {
  const goals = useAppStore((s) => s.goals);
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const activeDay = useAppStore((s) => s.activeDay);
  const dayAssignments = useAppStore((s) => s.dayAssignments);
  const toggleCycleTask = useAppStore((s) => s.toggleCycleTask);
  const assignTaskToDayPlan = useAppStore((s) => s.assignTaskToDayPlan);
  const unassignTaskFromDayPlan = useAppStore((s) => s.unassignTaskFromDayPlan);
  const setActiveDay = useAppStore((s) => s.setActiveDay);
  const weeks = useAppStore((s) => s.weeks);

  const [viewWeek, setViewWeek] = useState(activeWeek);

  useEffect(() => {
    setViewWeek(activeWeek);
  }, [activeWeek]);

  const today = todayISO();
  const week = viewWeek;
  const selectedDay = activeDay;
  const viewingPastOrFuture = viewWeek !== activeWeek;

  const poolGroups = groupWeekTasksBySphere(cycleTasks, spheres, week, hiddenSphereIds);

  const assignedIds = goalsForDay(dayAssignments, week, selectedDay);
  const assignedTasks = assignedIds
    .map((id) => cycleTasks.find((t) => t.id === id))
    .filter((t): t is CycleTask => !!t);

  const assignedBySphere = useMemo(() => {
    const visible = visibleSpheres(spheres, hiddenSphereIds);
    return visible
      .map((sphere) => ({
        sphere,
        tasks: assignedTasks.filter((t) => t.sphereId === sphere.id),
      }))
      .filter((g) => g.tasks.length > 0);
  }, [assignedTasks, spheres, hiddenSphereIds]);

  const unassigned = useMemo(() => {
    const assignedAnyDay = new Set<string>();
    for (let d = 1; d <= 7; d++) {
      goalsForDay(dayAssignments, week, d).forEach((id) => assignedAnyDay.add(id));
    }
    return poolGroups.map((grp) => ({
      ...grp,
      tasks: grp.tasks.filter((t) => !assignedAnyDay.has(t.id)),
    }));
  }, [poolGroups, dayAssignments, week]);

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

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      <header data-tour="today-board">
        <h1 className="font-display text-2xl font-bold">Сегодня</h1>
        <p className="text-sm text-muted-foreground">
          {today}
          {viewingPastOrFuture
            ? ` · просмотр недели ${viewWeek} (текущая ${activeWeek})`
            : ` · рабочая неделя ${activeWeek}`}
          {" · "}день {selectedDay}
        </p>
      </header>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Неделя цикла</p>
          {viewingPastOrFuture && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setViewWeek(activeWeek)}
            >
              К текущей ({activeWeek})
            </button>
          )}
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-card/40 p-1">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
            const closed = weeks.find((w) => w.number === n)?.closed;
            const isCurrent = n === activeWeek;
            const isView = n === viewWeek;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setViewWeek(n)}
                className={cn(
                  "relative shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isView
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  isCurrent && !isView && "ring-1 ring-primary/50"
                )}
                title={
                  isCurrent
                    ? "Текущая рабочая неделя"
                    : closed
                      ? "Неделя закрыта"
                      : undefined
                }
              >
                {n}
                {isCurrent && (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <SphereFilterBar />

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-card/40 p-1">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  selectedDay === day
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                День {day}
              </button>
            ))}
          </div>

          <Card
            onDragOver={preventDrag}
            onDrop={onDropDay}
            className="border-dashed border-primary/30"
          >
            <CardHeader>
              <CardTitle className="text-lg">День {selectedDay} — план</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[120px] space-y-4">
              {assignedBySphere.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Нажмите «В план» у задачи ниже — или перетащите её сюда
                </p>
              )}
              {assignedBySphere.map(({ sphere, tasks }) => (
                <div key={sphere.id} className="space-y-2">
                  <h3
                    className="text-xs font-semibold"
                    style={{ color: sphere.color }}
                  >
                    {sphere.icon} {sphere.name}
                  </h3>
                  {tasks.map((task) => {
                    const parent = goals.find((g) => g.id === task.goalId);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={onDragStart(task.id)}
                        className="flex cursor-grab items-center gap-2 rounded-lg border border-white/10 bg-background/40 p-2 active:cursor-grabbing"
                        style={{ borderLeftColor: sphere.color, borderLeftWidth: 3 }}
                      >
                        <Checkbox
                          checked={task.done}
                          onCheckedChange={() => toggleCycleTask(task.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm",
                              task.done && "text-muted-foreground line-through"
                            )}
                          >
                            {task.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Цель: {parent?.title}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 shrink-0 px-2 text-xs"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => unassignTaskFromDayPlan(task.id, week)}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                          В неделю
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside
          className="w-full shrink-0 space-y-3 lg:w-72"
          onDragOver={preventDrag}
          onDrop={onDropToPool}
        >
          <p className="text-sm font-medium text-muted-foreground">
            Задачи недели {week}
          </p>
          <p className="text-[10px] text-muted-foreground">
            «В план» добавляет задачу в день {selectedDay}. «В неделю» возвращает обратно.
          </p>
          {unassigned.every((g) => g.tasks.length === 0) && (
            <div className="glass-card border border-dashed border-white/15 p-4 text-center text-xs text-muted-foreground">
              Зона сброса: перетащите задачу из плана дня
            </div>
          )}
          {unassigned.map(({ sphere, tasks }) =>
            tasks.length === 0 ? null : (
              <div
                key={sphere.id}
                className="glass-card p-3"
                onDragOver={preventDrag}
                onDrop={onDropToPool}
              >
                <p
                  className="mb-2 text-xs font-semibold"
                  style={{ color: sphere.color }}
                >
                  {sphere.icon} {sphere.name}
                </p>
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={onDragStart(t.id)}
                      className="flex cursor-grab items-center gap-2 rounded-md border border-white/10 bg-background/50 px-2 py-2 active:cursor-grabbing"
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
                        В план
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </aside>
      </div>
    </div>
  );
}
