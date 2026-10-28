"use client";

import { startTransition, useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { xpProgressInLevel, rankTitle } from "@/lib/gamification";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { WeekDetail } from "@/components/dashboard/week-detail";
import { WeekNotesArchive } from "@/components/dashboard/week-notes-archive";
import { SphereWeekFilter } from "@/components/spheres/sphere-week-filter";
import { Progress } from "@/components/ui/progress";
import { CoinBadge } from "@/components/hero/coin-badge";
import { weekTacticalPercent } from "@/lib/week-momentum";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";

export default function DashboardPage() {
  const weeks = useAppStore((s) => s.weeks);
  const profile = useAppStore((s) => s.profile);
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const rawCharacter = useAppStore((s) => s.character);
  const character = normalizeCharacter(rawCharacter);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const [selectedWeek, setSelectedWeek] = useState(activeWeek);
  const [detailWeek, setDetailWeek] = useState(activeWeek);
  const xp = xpProgressInLevel(profile.xp);

  useEffect(() => {
    setSelectedWeek(activeWeek);
    setDetailWeek(activeWeek);
  }, [activeWeek]);

  const pickWeek = (week: number) => {
    setSelectedWeek(week);
    startTransition(() => setDetailWeek(week));
  };

  return (
    <div className="space-y-4">
      <header className="px-4 pt-4">
        <div className="game-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                Неделя {activeWeek}
              </h1>
              <p className="text-sm text-muted-foreground">
                из 12 · {rankTitle(xp.level)}
              </p>
            </div>
            <CoinBadge amount={character.coins} />
          </div>
          <div className="mt-4" data-tour="xp-bar">
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Уровень {xp.level}</span>
              <span>{Math.round(xp.percent)}%</span>
            </div>
            <Progress value={xp.percent} className="h-1.5" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {weekTacticalPercent(cycleTasks, activeWeek)}% недели
          </p>
        </div>
      </header>

      <WeekStrip
        activeWeek={activeWeek}
        weeks={weeks}
        selectedWeek={selectedWeek}
        onSelect={pickWeek}
      />

      <div className="flex justify-center px-4">
        <SphereWeekFilter className="w-full" />
      </div>

      <WeekDetail week={detailWeek} />

      <WeekNotesArchive
        onOpenWeek={(w) => {
          pickWeek(w);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
