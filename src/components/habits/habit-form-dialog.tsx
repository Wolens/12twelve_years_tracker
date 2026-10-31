"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useAppStore";
import type { HabitScope, HabitSchedule } from "@/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { WEEKDAY_LABELS } from "@/lib/habits";

type Props = {
  edit?: {
    id: string;
    title: string;
    schedule: HabitSchedule;
    scope: HabitScope;
  };
  trigger?: React.ReactNode;
  onDone?: () => void;
};

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

function defaultWeekdays(edit: Props["edit"]): number[] {
  if (edit?.schedule.kind === "weekly") return [...edit.schedule.weekdays];
  return [1, 2, 3, 4, 5];
}

export function HabitFormDialog({ edit, trigger, onDone }: Props) {
  const addHabit = useAppStore((s) => s.addHabit);
  const updateHabit = useAppStore((s) => s.updateHabit);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<HabitScope>("cycle");
  const [daily, setDaily] = useState(true);
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  const resetForm = () => {
    setTitle(edit?.title ?? "");
    setScope(edit?.scope ?? "cycle");
    setDaily(edit?.schedule.kind !== "weekly");
    setWeekdays(defaultWeekdays(edit));
  };

  const schedule = (): HabitSchedule =>
    daily
      ? { kind: "daily" }
      : { kind: "weekly", weekdays: [...weekdays].sort((a, b) => a - b) };

  const trySubmit = (): boolean => {
    const t = title.trim();
    if (!t) return false;
    if (!daily && weekdays.length === 0) return false;
    const sched = schedule();
    if (edit) {
      updateHabit(edit.id, { title: t, schedule: sched, scope });
    } else {
      addHabit({ title: t, schedule: sched, scope });
    }
    onDone?.();
    return true;
  };

  const toggleWeekday = (d: number) => {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm" variant="outline" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Привычка
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{edit ? "Редактировать привычку" : "Новая привычка"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (trySubmit()) setOpen(false);
          }}
        >
          <div>
            <Label htmlFor={edit ? `habit-title-${edit.id}` : "habit-title-new"}>
              Название
            </Label>
            <Input
              id={edit ? `habit-title-${edit.id}` : "habit-title-new"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: 10 минут чтения"
              className="mt-1"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Расписание</Label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm",
                  daily ? "border-primary bg-primary/10" : "border-white/10"
                )}
                onClick={() => setDaily(true)}
              >
                Каждый день
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm",
                  !daily ? "border-primary bg-primary/10" : "border-white/10"
                )}
                onClick={() => setDaily(false)}
              >
                Дни недели
              </button>
            </div>
            {!daily && (
              <div className="mt-2 flex flex-wrap gap-1">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={cn(
                      "h-9 w-9 rounded-lg border text-xs font-medium",
                      weekdays.includes(d)
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/10 text-muted-foreground"
                    )}
                    onClick={() => toggleWeekday(d)}
                  >
                    {WEEKDAY_LABELS[d]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Срок</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["cycle", "Только этот цикл"],
                  ["persistent", "Навсегда"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs leading-snug",
                    scope === id ? "border-primary bg-primary/10" : "border-white/10"
                  )}
                  onClick={() => setScope(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Отметка «сделал сегодня» — на вкладке «Сегодня». Не связано с целями на 12 недель.
          </p>
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            {edit ? "Сохранить" : "Добавить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
