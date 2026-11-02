"use client";

import { useMemo } from "react";
import { Repeat, Minus, Plus } from "lucide-react";
import type { Habit } from "@/types";
import { getHabitCount, habitStreak } from "@/lib/habits";
import type { HabitCompletions } from "@/types";
import { previewHabitCompletionRewards } from "@/lib/rpg/task-rewards";
import { CoinDisc } from "@/components/hero/coin-badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const HABIT_ACCENT = "#2dd4bf";

type Props = {
  habit: Habit;
  dateISO: string;
  completions: HabitCompletions;
  onAdjust: (delta: number) => void;
};

export function TodayHabitRow({ habit, dateISO, completions, onAdjust }: Props) {
  const count = getHabitCount(completions, dateISO, habit.id);
  const streak = habitStreak(habit, completions, dateISO);
  const rewards = useMemo(() => previewHabitCompletionRewards(), []);

  return (
    <div
      className={cn(
        "today-quest-row group relative overflow-hidden rounded-md border bg-[#070d0c]/90",
        count > 0 && "opacity-95"
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[13px] font-semibold leading-tight text-foreground/95">
              {habit.title}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Сегодня:{" "}
              <span className="tabular-nums font-medium text-foreground/80">{count}</span>
              {streak > 1 && (
                <span className="ml-2">· серия {streak} дн.</span>
              )}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-primary/80">
                +{rewards.xp} XP за раз
              </span>
              <span className="inline-flex items-center gap-0.5 text-amber-200/80">
                <CoinDisc className="coin-disc-xs" />
                +{rewards.coins}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 self-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-white/15 bg-black/20"
              disabled={count === 0}
              aria-label="Уменьшить"
              onClick={() => onAdjust(-1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">
              {count}
            </span>
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-md"
              aria-label="Увеличить"
              onClick={() => onAdjust(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
