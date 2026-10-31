"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export function WeekRolloverDialog() {
  const prompt = useAppStore((s) => s.weekRolloverPrompt);
  const resolve = useAppStore((s) => s.resolveWeekRollover);

  if (!prompt) return null;

  const count = prompt.incompleteTaskIds.length;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) resolve("keep");
      }}
    >
      <DialogContent className="game-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая неделя по календарю</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Неделя {prompt.week} уже закончилась в жизни, но{" "}
          {count === 1 ? "осталась" : "остались"} {count}{" "}
          {count === 1 ? "незакрытая задача" : "незакрытых задач"}.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button type="button" onClick={() => resolve("move")}>
            Перенести в неделю {prompt.targetWeek}
          </Button>
          <Button type="button" variant="outline" onClick={() => resolve("keep")}>
            Оставить как есть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
