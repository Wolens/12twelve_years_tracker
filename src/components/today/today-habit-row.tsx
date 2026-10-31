"use client";

import { useMemo, useState } from "react";
import { Repeat } from "lucide-react";
import type { Habit } from "@/types";
import { habitStreak } from "@/lib/habits";
import type { HabitCompletions } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { previewHabitCompletionRewards } from "@/lib/rpg/task-rewards";
import { CoinDisc } from "@/components/hero/coin-badge";
import { cn } from "@/lib/utils";

const HABIT_ACCENT = "#2dd4bf";

type Props = {
  habit: Habit;
  dateISO: string;
  completions: HabitCompletions;
  checked: boolean;
  onComplete: () => void;
  onUndo: () => void;
};

export function TodayHabitRow({
  habit,
  dateISO,
  completions,
  checked,
  onComplete,
  onUndo,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const streak = habitStreak(habit, completions, dateISO);
  const rewards = useMemo(() => previewHabitCompletionRewards(), []);

  const openConfirm = () => {
    if (checked) {
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
        className={cn(
          "today-quest-row group relative overflow-hidden rounded-md border bg-[#070d0c]/90",
          checked && "opacity-70"
        )}
        style={{ borderColor: `${HABIT_ACCENT}40` }}
      >
        <div
          className="relative flex gap-2 py-2 pl-2 pr-3"
          style={{ borderLeftWidth: 3, borderLeftColor: HABIT_ACCENT }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-md border border-white/10 bg-black/30 text-[#2dd4bf]"
            aria-hidden
          >
            <Repeat className="h-3.5 w-3.5" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className={cn(
                  "text-[13px] font-semibold leading-tight text-foreground/95",
                  checked && "text-muted-foreground line-through"
                )}
              >
                {habit.title}
              </p>
              {streak > 1 && (
                <p className="text-[10px] text-muted-foreground">Серия: {streak} дн.</p>
              )}
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 text-primary/80">
                  +{rewards.xp} XP
                </span>
                <span className="inline-flex items-center gap-0.5 text-amber-200/80">
                  <CoinDisc className="coin-disc-xs" />
                  +{rewards.coins}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openConfirm}
              className={cn(
                "today-quest-execute shrink-0 self-center transition",
                checked && "today-quest-execute-done"
              )}
            >
              <span className="text-[10px] font-bold uppercase leading-none tracking-[0.1em]">
                {checked ? "Снять" : "Выполнить"}
              </span>
            </button>
          </div>
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
            Отметить привычку?
          </p>
          <p className="text-center text-xs text-muted-foreground">
            [{habit.title} · +{rewards.xp} XP · +{rewards.coins} мон.]
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
