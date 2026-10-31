"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider-simple";
import { WeekControls } from "@/components/dashboard/week-controls";
import { groupWeekTasksByVisibleSpheres } from "@/lib/sphere-filters";
import { WeekTaskFormDialog } from "@/components/goals/week-task-form-dialog";
import { TodayQuestRow } from "@/components/today/today-quest-row";
import { planDayLabel, sortCycleTasksByPlanDay } from "@/lib/cycle-task-plan";
import { previewTaskCompletionRewards } from "@/lib/rpg/task-rewards";
import type { CycleTask, WeekReflection } from "@/types";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";
import { Pencil, Trash2 } from "lucide-react";
import { TaskRewardFlash, type TaskRewardFlashPayload } from "@/components/today/task-reward-flash";

type Props = { week: number };

type TaskDialogState =
  | { mode: "add"; sphereId: string }
  | { mode: "edit"; task: CycleTask }
  | null;

export function WeekDetail({ week }: Props) {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.weekHiddenSphereIds);
  const weeks = useAppStore((s) => s.weeks);
  const profile = useAppStore((s) => s.profile);
  const toggleCycleTask = useAppStore((s) => s.toggleCycleTask);
  const deleteCycleTask = useAppStore((s) => s.deleteCycleTask);
  const setWeekReflection = useAppStore((s) => s.setWeekReflection);
  const activeWeek = useAppStore((s) => s.activeWeek);

  const [taskDialog, setTaskDialog] = useState<TaskDialogState>(null);
  const [rewardFlash, setRewardFlash] = useState<TaskRewardFlashPayload | null>(null);

  const weekData = weeks.find((w) => w.number === week);
  const reflection = weekData?.reflection ?? {
    note: "",
    rating: 7,
    wins: "",
    struggles: "",
  };

  const groups = useMemo(
    () => groupWeekTasksByVisibleSpheres(cycleTasks, spheres, week, hiddenSphereIds),
    [cycleTasks, spheres, week, hiddenSphereIds]
  );

  const saveReflection = (patch: Partial<WeekReflection>) => {
    setWeekReflection(week, { ...reflection, ...patch });
  };

  const completeTask = (task: CycleTask) => {
    if (task.done) return;
    const preview = previewTaskCompletionRewards(profile.level, null, 100);
    toggleCycleTask(task.id);
    setRewardFlash({
      title: task.title,
      xp: preview.xp,
      coins: preview.coins,
    });
  };

  return (
    <div className="space-y-4 px-4">
      <TaskRewardFlash payload={rewardFlash} onDismiss={() => setRewardFlash(null)} />

      {spheres.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Добавь цель в «Герой → Цели», затем создавай задачи здесь.
        </p>
      )}

      {groups.map(({ sphere, tasks }) => {
        const sorted = sortCycleTasksByPlanDay(tasks);
        return (
          <Card key={sphere.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="flex min-w-0 items-center gap-2 text-base">
                <SphereGlyph icon={sphere.icon} color={sphere.color} size="sm" />
                <span className="truncate">{sphere.name}</span>
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => setTaskDialog({ mode: "add", sphereId: sphere.id })}
              >
                + Задача
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {sorted.length === 0 && (
                <p className="text-xs text-muted-foreground">Нет задач на эту неделю</p>
              )}
              {sorted.map((task) => (
                <div key={task.id} className="flex items-start gap-1">
                  <div className="min-w-0 flex-1">
                    <TodayQuestRow
                      task={task}
                      sphere={sphere}
                      compact
                      planDayLabel={planDayLabel(task.planDay)}
                      onComplete={() => completeTask(task)}
                      onUndo={() => toggleCycleTask(task.id)}
                    />
                  </div>
                  <div className="flex shrink-0 flex-col gap-0.5 pt-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground"
                      aria-label="Редактировать"
                      onClick={() => setTaskDialog({ mode: "edit", task })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground"
                      aria-label="Удалить"
                      onClick={() => deleteCycleTask(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <WeekTaskFormDialog
        sphereId={
          taskDialog?.mode === "add"
            ? taskDialog.sphereId
            : taskDialog?.mode === "edit"
              ? taskDialog.task.sphereId
              : spheres[0]?.id ?? ""
        }
        week={week}
        open={taskDialog !== null}
        onOpenChange={(o) => {
          if (!o) setTaskDialog(null);
        }}
        editTask={taskDialog?.mode === "edit" ? taskDialog.task : null}
      />

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
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Сохраняется в архиве ниже на этой странице — по каждой неделе отдельно.
            </p>
          </div>
        </CardContent>
      </Card>

      {week === activeWeek && <WeekControls />}
    </div>
  );
}
