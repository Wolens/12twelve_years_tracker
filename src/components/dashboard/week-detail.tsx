"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider-simple";
import { WeekControls } from "@/components/dashboard/week-controls";
import { groupWeekTasksBySphere } from "@/lib/sphere-filters";
import { WeekTaskFormDialog } from "@/components/goals/week-task-form-dialog";
import type { CycleTask, WeekReflection } from "@/types";
import { Pencil } from "lucide-react";

type Props = { week: number };

type TaskDialogState =
  | { mode: "add"; sphereId: string }
  | { mode: "edit"; task: CycleTask }
  | null;

export function WeekDetail({ week }: Props) {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.weekHiddenSphereIds);
  const weekFilterSphereId = useAppStore((s) => s.weekFilterSphereId);
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

  const groups = groupWeekTasksBySphere(
    cycleTasks,
    spheres,
    week,
    hiddenSphereIds,
    weekFilterSphereId
  );
  const block = groups[0];
  const tasks = block?.tasks ?? [];
  const sphere = block?.sphere;
  const allDone = tasks.length > 0 && tasks.every((t) => t.done);

  const saveReflection = (patch: Partial<WeekReflection>) => {
    setWeekReflection(week, { ...reflection, ...patch });
  };

  return (
    <div className="space-y-4 px-4">
      <Card>
        <CardContent className="space-y-6 pt-6">
          {!sphere && (
            <p className="text-sm text-muted-foreground">
              Добавьте цель на 12 недель или выберите вкладку выше.
            </p>
          )}
          {sphere && (
            <div className="space-y-3">
              <div className="flex justify-end">
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
              <div className="space-y-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-md border border-white/5 bg-background/30 p-2"
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
          )}
          <WeekTaskFormDialog
            sphereId={
              taskDialog?.mode === "add"
                ? taskDialog.sphereId
                : taskDialog?.mode === "edit"
                  ? taskDialog.task.sphereId
                  : weekFilterSphereId
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
