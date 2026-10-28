"use client";

import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { CycleTask, Sphere } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { previewTaskCompletionRewards } from "@/lib/rpg/task-rewards";
import { CoinDisc } from "@/components/hero/coin-badge";
import { cn } from "@/lib/utils";

type Props = {
  task: CycleTask;
  sphere: Sphere;
  goalTitle?: string;
  onComplete: () => void;
  onUndo: () => void;
  onUnassign: () => void;
  onDragStart: (e: React.DragEvent) => void;
};

export function TodayQuestRow({
  task,
  sphere,
  goalTitle,
  onComplete,
  onUndo,
  onUnassign,
  onDragStart,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const level = useAppStore((s) => s.profile.level);

  const rewards = useMemo(
    () => previewTaskCompletionRewards(level, null, 100),
    [level]
  );

  const openConfirm = () => {
    if (task.done) {
      onUndo();
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = () => {
    onComplete();
    setConfirmOpen(false);
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        className={cn(
          "today-quest-row group relative cursor-grab overflow-hidden rounded-md border bg-[#070d0c]/90 active:cursor-grabbing",
          task.done && "opacity-70"
        )}
        style={{
          borderColor: `${sphere.color}40`,
        }}
      >
        <div className="relative py-2 pl-2.5 pr-10 pb-2 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 flex-1 space-y-1">
              <div>
                <p
                  className={cn(
                    "text-[13px] font-semibold leading-tight text-foreground/95",
                    task.done && "text-muted-foreground line-through"
                  )}
                >
                  {task.title}
                </p>
                {goalTitle && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{goalTitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 text-primary/90">
                  +{rewards.xp} XP
                </span>
                <span className="inline-flex items-center gap-0.5 text-amber-200/90">
                  <CoinDisc className="coin-disc-xs" />
                  +{rewards.coins}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openConfirm}
              className={cn(
                "today-quest-execute shrink-0 px-2.5 py-1.5 transition",
                task.done && "today-quest-execute-done"
              )}
            >
              <span className="block text-center text-[10px] font-bold uppercase leading-tight tracking-[0.1em]">
                {task.done ? "Снять" : "Выполнить"}
              </span>
            </button>
          </div>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onUnassign}
            className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-sm border border-white/15 bg-black/40 text-muted-foreground/70 hover:border-white/25 hover:bg-white/5 hover:text-muted-foreground"
            aria-label="Вернуть в неделю"
          >
            <ArrowDown className="h-2.5 w-2.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm border-primary/25 bg-[#0a1412] [&>button.absolute]:hidden">
          <DialogHeader className="border-b border-primary/20 pb-3">
            <DialogTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded border border-primary/40 bg-primary/10 text-sm">
                !
              </span>
              Оповещение
            </DialogTitle>
          </DialogHeader>
          <p className="text-center font-display text-lg font-bold uppercase tracking-wide">
            Выполнить квест?
          </p>
          <p className="text-center text-xs text-muted-foreground">
            [{task.title} · +{rewards.xp} XP · +{rewards.coins} мон.]
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/15 uppercase tracking-wide"
              onClick={() => setConfirmOpen(false)}
            >
              Отмена
            </Button>
            <Button type="button" className="flex-1 uppercase tracking-wide" onClick={confirm}>
              Выполнить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
