"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import type { CycleTask } from "@/types";
import { PLAN_DAY_SHORT } from "@/lib/cycle-task-plan";
import { cn } from "@/lib/utils";

type Props = {
  sphereId: string;
  week?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: CycleTask | null;
};

const NONE_DAY = "none";

export function WeekTaskFormDialog({
  sphereId,
  week: fixedWeek,
  open,
  onOpenChange,
  editTask,
}: Props) {
  const addCycleTask = useAppStore((s) => s.addCycleTask);
  const updateCycleTask = useAppStore((s) => s.updateCycleTask);
  const activeWeek = useAppStore((s) => s.activeWeek);

  const effectiveSphereId = editTask?.sphereId ?? sphereId;
  const [taskWeek, setTaskWeek] = useState(fixedWeek ?? activeWeek);
  const [title, setTitle] = useState("");
  const [planDayRaw, setPlanDayRaw] = useState<string>(NONE_DAY);

  const isEdit = Boolean(editTask);
  const weekLocked = fixedWeek != null && !isEdit;

  useEffect(() => {
    if (!open) return;
    if (editTask) {
      setTaskWeek(editTask.week);
      setTitle(editTask.title);
      setPlanDayRaw(
        editTask.planDay != null && editTask.planDay >= 1 && editTask.planDay <= 7
          ? String(editTask.planDay)
          : NONE_DAY
      );
      return;
    }
    setTaskWeek(fixedWeek ?? activeWeek);
    setTitle("");
    setPlanDayRaw(NONE_DAY);
  }, [open, fixedWeek, activeWeek, editTask]);

  const submit = () => {
    if (!title.trim() || taskWeek < 1 || taskWeek > 12) return;
    const planDay =
      planDayRaw === NONE_DAY ? undefined : Number(planDayRaw);
    if (editTask) {
      updateCycleTask(editTask.id, {
        title: title.trim(),
        week: taskWeek,
        planDay,
      });
    } else {
      addCycleTask({
        sphereId: effectiveSphereId,
        week: taskWeek,
        title: title.trim(),
        planDay,
      });
    }
    onOpenChange(false);
    setTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редактировать задачу" : `Задача · неделя ${taskWeek}`}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {!weekLocked && (
            <div>
              <Label>Неделя</Label>
              <Select
                value={String(taskWeek)}
                onValueChange={(v) => setTaskWeek(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                    <SelectItem key={w} value={String(w)}>
                      Неделя {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>День недели</Label>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs",
                  planDayRaw === NONE_DAY
                    ? "border-primary bg-primary/10"
                    : "border-white/10 text-muted-foreground"
                )}
                onClick={() => setPlanDayRaw(NONE_DAY)}
              >
                Не выбран
              </button>
              {PLAN_DAY_SHORT.slice(1).map((label, i) => {
                const d = i + 1;
                return (
                  <button
                    key={d}
                    type="button"
                    className={cn(
                      "h-9 w-9 rounded-lg border text-xs font-medium",
                      planDayRaw === String(d)
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/10 text-muted-foreground"
                    )}
                    onClick={() => setPlanDayRaw(String(d))}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label>Задача</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что сделать на этой неделе"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            {isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
