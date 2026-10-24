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

type Props = {
  sphereId: string;
  week: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: CycleTask | null;
};

export function WeekTaskFormDialog({
  sphereId,
  week,
  open,
  onOpenChange,
  editTask,
}: Props) {
  const goals = useAppStore((s) => s.goals);
  const addCycleTask = useAppStore((s) => s.addCycleTask);
  const updateCycleTask = useAppStore((s) => s.updateCycleTask);

  const effectiveSphereId = editTask?.sphereId ?? sphereId;
  const sphereGoals = goals.filter((g) => g.sphereId === effectiveSphereId);
  const [goalId, setGoalId] = useState(sphereGoals[0]?.id ?? "");
  const [title, setTitle] = useState("");

  const isEdit = Boolean(editTask);

  useEffect(() => {
    if (!open) return;
    if (editTask) {
      setGoalId(editTask.goalId);
      setTitle(editTask.title);
      return;
    }
    const list = goals.filter((g) => g.sphereId === sphereId);
    setGoalId(list[0]?.id ?? "");
    setTitle("");
  }, [open, sphereId, goals, editTask]);

  const submit = () => {
    if (!goalId || !title.trim()) return;
    if (editTask) {
      updateCycleTask(editTask.id, { goalId, title: title.trim() });
    } else {
      addCycleTask({
        goalId,
        sphereId,
        week,
        title: title.trim(),
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
            {isEdit ? "Редактировать задачу" : `Задача на неделю ${week}`}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {sphereGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Сначала добавьте цель на период в разделе «Цели» для этой сферы.
            </p>
          ) : (
            <>
              <div>
                <Label>Цель периода</Label>
                <Select value={goalId} onValueChange={setGoalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите цель" />
                  </SelectTrigger>
                  <SelectContent>
                    {sphereGoals.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Задача</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Что сделать на этой неделе"
                />
              </div>
              <Button type="submit" className="w-full">
                {isEdit ? "Сохранить" : "Добавить"}
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
