"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { computeCycleOverview, weekStatsRows } from "@/lib/stats/cycle-overview";
import {
  xpByDay,
  xpBySourceBucket,
  xpForWeek,
  xpLast7Days,
  sumXp,
  filterLedgerSince,
} from "@/lib/stats/xp-activity";
import { sphereTaskStats } from "@/lib/stats/sphere-task-stats";
import { StatsHeroSummary } from "@/components/stats/stats-hero-summary";
import { StatsWeekGrid } from "@/components/stats/stats-week-grid";
import { StatsSphereCard } from "@/components/stats/stats-sphere-card";
import { StatsXpSources } from "@/components/stats/stats-xp-sources";
import { StatsLegacyGoalsSection } from "@/components/stats/stats-legacy-goals";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const StatsXpChart = dynamic(
  () => import("@/components/stats/stats-xp-chart").then((m) => m.StatsXpChart),
  { ssr: false, loading: () => <div className="h-[200px]" /> }
);

const XP_CHART_DAYS = 14;
const XP_SOURCE_DAYS = 28;

export default function StatsPage() {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const weeks = useAppStore((s) => s.weeks);
  const profile = useAppStore((s) => s.profile);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const cycleStartDate = useAppStore((s) => s.cycleStartDate);
  const seasonFlame = useAppStore((s) => s.seasonFlame);

  const [filterSphere, setFilterSphere] = useState<string>("all");
  const [taskWeekScope, setTaskWeekScope] = useState<"all" | "active">("all");

  const visibleSpheres = useMemo(
    () => spheres.filter((s) => !hiddenSphereIds.includes(s.id)),
    [spheres, hiddenSphereIds]
  );

  const overview = useMemo(
    () => computeCycleOverview(cycleTasks, weeks, activeWeek),
    [cycleTasks, weeks, activeWeek]
  );

  const weekRows = useMemo(
    () => weekStatsRows(cycleTasks, weeks),
    [cycleTasks, weeks]
  );

  const ledger = profile.xpLedger;
  const xp7d = useMemo(() => xpLast7Days(ledger), [ledger]);
  const xpDaily = useMemo(() => xpByDay(ledger, XP_CHART_DAYS), [ledger]);
  const xpSources = useMemo(
    () => xpBySourceBucket(ledger, XP_SOURCE_DAYS),
    [ledger]
  );
  const xpSourceTotal = useMemo(
    () => sumXp(filterLedgerSince(ledger, XP_SOURCE_DAYS)),
    [ledger]
  );

  const weekXpFn = useMemo(
    () => (week: number) => xpForWeek(ledger, cycleStartDate, week),
    [ledger, cycleStartDate]
  );

  const taskWeekFilter = taskWeekScope === "active" ? activeWeek : undefined;
  const weekScopeLabel =
    taskWeekScope === "active" ? `неделя ${activeWeek}` : "весь цикл";

  const spheresToShow =
    filterSphere === "all"
      ? visibleSpheres
      : visibleSpheres.filter((s) => s.id === filterSphere);

  return (
    <div className="space-y-4 px-4 pt-4 pb-8" data-tour="stats-board">
      <h1 className="font-display text-2xl font-bold">Статистика</h1>

      <StatsHeroSummary
        overview={overview}
        cycleStartDate={cycleStartDate}
        streak={profile.streak}
        xp7d={xp7d}
        totalXp={profile.xp}
      />

      <StatsWeekGrid
        rows={weekRows}
        activeWeek={activeWeek}
        activeWeekTactical={overview.activeWeekTactical}
        weekXp={weekXpFn}
      />

      <div className="game-surface space-y-4 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">По целям</h2>
          <div className="flex w-full flex-col gap-1 sm:w-auto sm:items-end">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Задачи
            </span>
            <Select
              value={taskWeekScope}
              onValueChange={(v) => setTaskWeekScope(v as "all" | "active")}
            >
              <SelectTrigger
                className="h-9 w-full min-w-[10.5rem] max-w-[12rem] shrink-0 gap-1 overflow-hidden py-1.5 pl-2.5 pr-2 text-xs font-medium leading-none sm:w-[10.5rem] [&>span:first-of-type]:min-w-0 [&>span:first-of-type]:truncate [&>span:first-of-type]:text-left"
                aria-label="Период задач для статистики"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[10.5rem]">
                <SelectItem value="all">Весь цикл</SelectItem>
                <SelectItem value="active">Неделя {activeWeek}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterSphere("all")}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              filterSphere === "all"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-white/10 text-muted-foreground hover:text-foreground"
            )}
          >
            Все
          </button>
          {visibleSpheres.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilterSphere(s.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition",
                filterSphere === s.id
                  ? "border-white/25 bg-white/10"
                  : "border-white/10 text-muted-foreground hover:text-foreground"
              )}
              style={
                filterSphere === s.id
                  ? { borderColor: s.color, color: s.color }
                  : undefined
              }
            >
              <SphereGlyph icon={s.icon} color={s.color} size="xs" plain />
              <span className="max-w-[6rem] truncate">{s.name}</span>
            </button>
          ))}
        </div>

        {visibleSpheres.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Нет направлений — добавь их при настройке или в «Герой → Цели».
          </p>
        ) : (
          <div className="space-y-3">
            {spheresToShow.map((sphere) => (
              <StatsSphereCard
                key={sphere.id}
                sphere={sphere}
                taskStats={sphereTaskStats(cycleTasks, sphere.id, taskWeekFilter)}
                weekScopeLabel={weekScopeLabel}
              />
            ))}
          </div>
        )}
      </div>

      <div className="game-surface space-y-4 p-4">
        <h2 className="font-display text-lg font-semibold">Активность</h2>
        <p className="text-xs text-muted-foreground">
          Здоровье сейчас: {Math.round(seasonFlame?.value ?? 100)}%
        </p>
        <StatsXpChart data={xpDaily} />
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Источники XP · {XP_SOURCE_DAYS} дн.
          </p>
          <StatsXpSources rows={xpSources} total={xpSourceTotal} />
        </div>
      </div>

      <StatsLegacyGoalsSection />
    </div>
  );
}
