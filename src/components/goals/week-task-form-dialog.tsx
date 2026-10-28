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
  /** Если задана — неделя фиксирована (экран «12 недель»). Иначе можно выбрать 1–12. */
  week?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: CycleTask | null;
};

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

  const isEdit = Boolean(editTask);
  const weekLocked = fixedWeek != null && !isEdit;

  useEffect(() => {
    if (!open) return;
    if (editTask) {
      setTaskWeek(editTask.week);
      setTitle(editTask.title);
      return;
    }
    setTaskWeek(fixedWeek ?? activeWeek);
    setTitle("");
  }, [open, fixedWeek, activeWeek, editTask]);

  const submit = () => {
    if (!title.trim() || taskWeek < 1 || taskWeek > 12) return;
    if (editTask) {
      updateCycleTask(editTask.id, { title: title.trim(), week: taskWeek });
    } else {
      addCycleTask({
        sphereId: effectiveSphereId,
        week: taskWeek,
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
