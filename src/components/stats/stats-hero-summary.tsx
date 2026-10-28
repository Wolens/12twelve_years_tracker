"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import type { CycleOverview } from "@/lib/stats/cycle-overview";
import { xpProgressInLevel } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { CycleRadial } from "@/components/stats/cycle-radial";
import { Button } from "@/components/ui/button";

type Props = {
  overview: CycleOverview;
  cycleStartDate: string;
  streak: number;
  xp7d: number;
  totalXp: number;
};

export function StatsHeroSummary({
  overview,
  cycleStartDate,
  streak,
  xp7d,
  totalXp,
}: Props) {
  const xp = xpProgressInLevel(totalXp);
  const startLabel = new Date(`${cycleStartDate}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="game-surface space-y-4 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Цикл 12 недель</p>
          <p className="font-display text-xl font-bold">
            Неделя {overview.activeWeek} / 12
          </p>
          <p className="text-xs text-muted-foreground">Старт {startLabel}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Закрыто недель: {overview.closedWeeks}/12
        </p>
      </div>

      {overview.totalTasks === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Задач пока нет — поставь их на «12 недель», чтобы видеть прогресс.
          </p>
          <Button asChild size="sm" className="mt-3" variant="secondary">
            <Link href="/" scroll={false}>К 12 неделям</Link>
          </Button>
        </div>
      ) : (
        <div className="relative">
          <CycleRadial percent={overview.taskPercent} />
          <p className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
            {overview.taskPercent}%
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Задач выполнено: {overview.doneTasks}/{overview.totalTasks}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-1 text-orange-400">
          <Flame className="h-4 w-4" />
          Streak {streak}
        </span>
        <span className="text-muted-foreground">XP за 7 дн.: +{xp7d}</span>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Уровень {xp.level}</span>
          <span>
            {xp.current}/{xp.needed} XP
          </span>
        </div>
        <Progress value={xp.percent} className="h-2" />
      </div>
    </div>
  );
}
