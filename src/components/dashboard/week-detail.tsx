"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider-simple";
import { SphereFilterBar } from "@/components/spheres/sphere-filter-bar";
import { groupWeekTasksBySphere } from "@/lib/sphere-filters";
import { groupTasksByGoal } from "@/lib/week-tasks";
import { WeekTaskFormDialog } from "@/components/goals/week-task-form-dialog";
import type { WeekReflection } from "@/types";
import { WeekControls } from "@/components/dashboard/week-controls";
import type { CycleTask } from "@/types";
import { Pencil } from "lucide-react";

type Props = { week: number };

type TaskDialogState =
  | { mode: "add"; sphereId: string }
  | { mode: "edit"; task: CycleTask }
  | null;

export function WeekDetail({ week }: Props) {
  const goals = useAppStore((s) => s.goals);
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const weeks = useAppStore((s) => s.weeks);
  const toggleCycleTask = useAppStore((s) => s.toggleCycleTask);
  const deleteCycleTask = useAppStore((s) => s.deleteCycleTask);
  const setWeekReflection = useAppStore((s) => s.setWeekReflection);
  const closeWeek = useAppStore((s) => s.closeWeek);
  const activeWeek = useAppStore((s) => s.activeWeek);

  const [taskDialog, setTaskDialog] = useState<TaskDialogState>(null);

  const weekData = weeks.find((w) => w.number === week);
  const reflection = weekData?.reflection ?? {
    note: "",
    rating: 7,
    wins: "",
    struggles: "",
  };

  const groups = groupWeekTasksBySphere(cycleTasks, spheres, week, hiddenSphereIds);
  const allTasks = groups.flatMap((g) => g.tasks);
  const allDone = allTasks.length > 0 && allTasks.every((t) => t.done);

  const saveReflection = (patch: Partial<WeekReflection>) => {
    setWeekReflection(week, { ...reflection, ...patch });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 px-4"
    >
      <SphereFilterBar className="px-0" />

      <Card>
        <CardHeader>
          <CardTitle>Задачи недели {week}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Отметьте сферы в фильтре выше, чтобы видеть блоки задач.
            </p>
          )}
          {groups.map(({ sphere, tasks }) => {
            const sphereGoals = goals.filter((g) => g.sphereId === sphere.id);
            const byGoal = groupTasksByGoal(tasks, sphereGoals);

            return (
              <div key={sphere.id} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: sphere.color }}
                  >
                    <span>{sphere.icon}</span>
                    {sphere.name}
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTaskDialog({ mode: "add", sphereId: sphere.id })}
                  >
                    + Задача
                  </Button>
                </div>
                {tasks.length === 0 && (
                  <p className="text-xs text-muted-foreground">Нет задач на эту неделю</p>
                )}
                {byGoal.map(({ goal, tasks: goalTasks }) => (
                  <div
                    key={goal?.id ?? "orphan"}
                    className="rounded-lg border border-white/5 bg-background/20 p-2"
                  >
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      {goal ? `🎯 ${goal.title}` : "Без цели"}
                    </p>
                    <div className="space-y-1">
                      {goalTasks.map((task) => (
                        <div
                          key={task.id}
                          className="ml-3 flex items-start gap-3 rounded-md border border-white/5 border-l-2 bg-background/30 p-2 pl-3"
                          style={{ borderLeftColor: sphere.color }}
                        >
                          <Checkbox
                            id={task.id}
                            checked={task.done}
                            onCheckedChange={() => toggleCycleTask(task.id)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={task.id}
                              className="cursor-pointer text-sm font-normal leading-snug"
                            >
                              {task.title}
                            </Label>
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground"
                              aria-label="Редактировать"
                              onClick={() => setTaskDialog({ mode: "edit", task })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground"
                              onClick={() => deleteCycleTask(task.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          <WeekTaskFormDialog
            sphereId={
              taskDialog?.mode === "add"
                ? taskDialog.sphereId
                : taskDialog?.mode === "edit"
                  ? taskDialog.task.sphereId
                  : ""
            }
            week={week}
            open={taskDialog !== null}
            onOpenChange={(o) => {
              if (!o) setTaskDialog(null);
            }}
            editTask={taskDialog?.mode === "edit" ? taskDialog.task : null}
          />
          {allDone && !weekData?.bonusAwarded && (
            <Button className="w-full" onClick={() => closeWeek(week)}>
              Закрыть неделю (+50 XP)
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Дневник недели</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Оценка недели: {reflection.rating}/10</Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[reflection.rating]}
              onValueChange={([v]) => saveReflection({ rating: v })}
            />
          </div>
          <div>
            <Label>Короткая заметка</Label>
            <Textarea
              value={reflection.note}
              onChange={(e) => saveReflection({ note: e.target.value })}
              placeholder="Главное за неделю..."
            />
          </div>
          <div>
            <Label>Что получилось</Label>
            <Textarea
              value={reflection.wins}
              onChange={(e) => saveReflection({ wins: e.target.value })}
            />
          </div>
          <div>
            <Label>Что не получилось</Label>
            <Textarea
              value={reflection.struggles}
              onChange={(e) => saveReflection({ struggles: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {week === activeWeek && <WeekControls />}
    </motion.div>
  );
}
