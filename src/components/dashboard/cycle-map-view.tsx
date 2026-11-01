"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { groupCycleTasksByWeekForSphere } from "@/lib/cycle-map";
import { WeekTaskFormDialog } from "@/components/goals/week-task-form-dialog";
import { CycleMapColumn } from "@/components/dashboard/cycle-map-column";
import type { CycleTask } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TaskDialogState =
  | { mode: "add"; week: number }
  | { mode: "edit"; task: CycleTask }
  | null;

export function CycleMapView({ onOpenWeek }: { onOpenWeek: (week: number) => void }) {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const weeks = useAppStore((s) => s.weeks);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const weekFilterSphereId = useAppStore((s) => s.weekFilterSphereId);
  const moveCycleTaskToWeek = useAppStore((s) => s.moveCycleTaskToWeek);
  const deleteCycleTask = useAppStore((s) => s.deleteCycleTask);

  const [taskDialog, setTaskDialog] = useState<TaskDialogState>(null);
  const [moveTask, setMoveTask] = useState<CycleTask | null>(null);
  const [dragOverWeek, setDragOverWeek] = useState<number | null>(null);

  const sphere = spheres.find((s) => s.id === weekFilterSphereId);
  const accentColor = sphere?.color ?? "#34d399";

  const byWeek = useMemo(
    () => groupCycleTasksByWeekForSphere(cycleTasks, weekFilterSphereId),
    [cycleTasks, weekFilterSphereId]
  );

  if (!weekFilterSphereId || !sphere) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Выберите направление выше, чтобы увидеть карту цикла.
      </p>
    );
  }

  return (
    <>
      <p className="mx-auto mb-2 max-w-2xl px-4 text-center text-[11px] text-muted-foreground">
        {sphere.name} · перетащите задачу в другую неделю или нажмите ⋮ на телефоне
      </p>
      <div
        className="no-print mx-auto w-full overflow-x-auto pb-4 snap-x snap-mandatory scroll-pl-4"
        data-tour="cycle-map"
      >
        <div className="flex min-w-max gap-2 px-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
            <CycleMapColumn
              key={week}
              week={week}
              weekData={weeks.find((w) => w.number === week)}
              tasks={byWeek.get(week) ?? []}
              activeWeek={activeWeek}
              accentColor={accentColor}
              dragOver={dragOverWeek === week}
              onHeaderClick={() => onOpenWeek(week)}
              onAdd={() => setTaskDialog({ mode: "add", week })}
              onEditTask={(task) => setTaskDialog({ mode: "edit", task })}
              onDeleteTask={(id) => deleteCycleTask(id)}
              onMoveTask={(task) => setMoveTask(task)}
              onDragOverColumn={(over) => setDragOverWeek(over ? week : null)}
              onDropTask={(taskId) => {
                const t = cycleTasks.find((x) => x.id === taskId);
                if (t && t.week !== week) moveCycleTaskToWeek(taskId, week);
              }}
            />
          ))}
        </div>
      </div>

      <WeekTaskFormDialog
        sphereId={weekFilterSphereId}
        week={
          taskDialog?.mode === "add"
            ? taskDialog.week
            : taskDialog?.mode === "edit"
              ? taskDialog.task.week
              : activeWeek
        }
        open={taskDialog !== null}
        onOpenChange={(open) => {
          if (!open) setTaskDialog(null);
        }}
        editTask={taskDialog?.mode === "edit" ? taskDialog.task : null}
      />

      <Dialog open={moveTask !== null} onOpenChange={(open) => !open && setMoveTask(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Перенести в неделю</DialogTitle>
          </DialogHeader>
          {moveTask && (
            <p className="text-sm text-muted-foreground line-clamp-2">{moveTask.title}</p>
          )}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
              <Button
                key={w}
                type="button"
                variant={moveTask?.week === w ? "secondary" : "outline"}
                size="sm"
                className="h-9 px-0"
                disabled={moveTask?.week === w}
                onClick={() => {
                  if (moveTask) {
                    moveCycleTaskToWeek(moveTask.id, w);
                    setMoveTask(null);
                  }
                }}
              >
                {w}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
