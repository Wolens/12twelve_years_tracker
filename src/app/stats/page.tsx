"use client";

import { useEffect, useMemo, useState } from "react";
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
  filterLedgerBySphere,
  filterLedgerByWeek,
  xpByDayForWeek,
  xpBySourceBucketFromLedger,
  xpByDayBySpheres,
  xpByDayBySpheresForWeek,
  XP_SPHERE_OTHER_KEY,
} from "@/lib/stats/xp-activity";
import type { XpChartSeries } from "@/components/stats/stats-xp-chart";
import { sphereTaskStats } from "@/lib/stats/sphere-task-stats";
import { StatsHeroSummary } from "@/components/stats/stats-hero-summary";
import { StatsWeekGrid } from "@/components/stats/stats-week-grid";
import { StatsSphereCard } from "@/components/stats/stats-sphere-card";
import { StatsXpSources } from "@/components/stats/stats-xp-sources";
import { StatsLegacyGoalsSection } from "@/components/stats/stats-legacy-goals";
import { StatsHabitsGrid } from "@/components/stats/stats-habits-grid";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const StatsXpChart = dynamic(
  () => import("@/components/stats/stats-xp-chart").then((m) => m.StatsXpChart),
  { ssr: false, loading: () => <div className="h-[200px]" /> }
);

const XP_CHART_DAYS = 14;
const XP_SOURCE_DAYS = 28;
const HABIT_GRID_DAYS = 14;

export default function StatsPage() {
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const spheres = useAppStore((s) => s.spheres);
  const weeks = useAppStore((s) => s.weeks);
  const profile = useAppStore((s) => s.profile);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const cycleStartDate = useAppStore((s) => s.cycleStartDate);
  const seasonFlame = useAppStore((s) => s.seasonFlame);
  const goals = useAppStore((s) => s.goals);

  const [filterSphere, setFilterSphere] = useState<string>("all");
  const [chartBySphere, setChartBySphere] = useState(false);
  const [taskWeekScope, setTaskWeekScope] = useState<"all" | "by_week">("all");
  const [statsWeek, setStatsWeek] = useState(activeWeek);

  useEffect(() => {
    setStatsWeek(activeWeek);
  }, [activeWeek]);

  useEffect(() => {
    if (filterSphere !== "all") setChartBySphere(false);
  }, [filterSphere]);

  useEffect(() => {
    if (filterSphere !== "all" && !spheres.some((s) => s.id === filterSphere)) {
      setFilterSphere("all");
    }
  }, [spheres, filterSphere]);

  const overview = useMemo(
    () => computeCycleOverview(cycleTasks, weeks, activeWeek),
    [cycleTasks, weeks, activeWeek]
  );

  const weekRows = useMemo(
    () => weekStatsRows(cycleTasks, weeks),
    [cycleTasks, weeks]
  );

  const ledger = profile.xpLedger;

  const activityBaseLedger = useMemo(() => {
    if (taskWeekScope !== "by_week") return ledger;
    return filterLedgerByWeek(ledger, cycleStartDate, statsWeek);
  }, [ledger, taskWeekScope, statsWeek, cycleStartDate]);

  const activityLedger = useMemo(() => {
    if (filterSphere === "all") return activityBaseLedger;
    return filterLedgerBySphere(activityBaseLedger, filterSphere, cycleTasks, goals);
  }, [activityBaseLedger, filterSphere, cycleTasks, goals]);

  const xpDaily = useMemo(() => {
    if (taskWeekScope === "by_week") {
      return xpByDayForWeek(activityLedger, cycleStartDate, statsWeek);
    }
    return xpByDay(activityLedger, XP_CHART_DAYS);
  }, [activityLedger, taskWeekScope, cycleStartDate, statsWeek]);

  const xpDailyBySphere = useMemo(() => {
    if (filterSphere !== "all" || !chartBySphere) return null;
    const sphereIds = spheres.map((s) => s.id);
    if (taskWeekScope === "by_week") {
      return xpByDayBySpheresForWeek(
        ledger,
        cycleStartDate,
        statsWeek,
        sphereIds,
        cycleTasks,
        goals
      );
    }
    return xpByDayBySpheres(ledger, XP_CHART_DAYS, sphereIds, cycleTasks, goals);
  }, [
    ledger,
    filterSphere,
    chartBySphere,
    spheres,
    cycleTasks,
    goals,
    taskWeekScope,
    cycleStartDate,
    statsWeek,
  ]);

  const chartSeries = useMemo((): XpChartSeries[] | undefined => {
    if (!chartBySphere || filterSphere !== "all") return undefined;
    const rows = xpDailyBySphere ?? [];
    const series: XpChartSeries[] = spheres.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
    }));
    if (rows.some((r) => Number(r[XP_SPHERE_OTHER_KEY] ?? 0) > 0)) {
      series.push({ id: XP_SPHERE_OTHER_KEY, name: "Прочее", color: "#94a3b8" });
    }
    return series;
  }, [chartBySphere, filterSphere, spheres, xpDailyBySphere]);
  const xpSources = useMemo(() => {
    if (taskWeekScope === "by_week") {
      return xpBySourceBucketFromLedger(activityLedger);
    }
    return xpBySourceBucket(activityLedger, XP_SOURCE_DAYS);
  }, [activityLedger, taskWeekScope]);
  const xpSourceTotal = useMemo(() => {
    if (taskWeekScope === "by_week") return sumXp(activityLedger ?? []);
    return sumXp(filterLedgerSince(activityLedger, XP_SOURCE_DAYS));
  }, [activityLedger, taskWeekScope]);

  const xp7d = useMemo(() => xpLast7Days(ledger), [ledger]);

  const weekXpFn = useMemo(
    () => (week: number) => xpForWeek(ledger, cycleStartDate, week),
    [ledger, cycleStartDate]
  );

  const taskWeekFilter = taskWeekScope === "by_week" ? statsWeek : undefined;
  const weekScopeLabel =
    taskWeekScope === "by_week" ? `неделя ${statsWeek}` : "весь цикл";

  const spheresToShow =
    filterSphere === "all" ? spheres : spheres.filter((s) => s.id === filterSphere);

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
              Период
            </span>
            <Select
              value={taskWeekScope}
              onValueChange={(v) => {
                const mode = v as "all" | "by_week";
                setTaskWeekScope(mode);
                if (mode === "by_week") setStatsWeek(activeWeek);
              }}
            >
              <SelectTrigger
                className="h-9 w-full min-w-[10.5rem] max-w-[12rem] shrink-0 gap-1 overflow-hidden py-1.5 pl-2.5 pr-2 text-xs font-medium leading-none sm:w-[10.5rem] [&>span:first-of-type]:min-w-0 [&>span:first-of-type]:truncate [&>span:first-of-type]:text-left"
                aria-label="Период для задач и привычек"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[10.5rem]">
                <SelectItem value="all">Весь цикл</SelectItem>
                <SelectItem value="by_week">По неделям</SelectItem>
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
          {spheres.map((s) => (
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

        {taskWeekScope === "by_week" && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Предыдущая неделя"
              disabled={statsWeek <= 1}
              onClick={() => setStatsWeek((w) => Math.max(1, w - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[7rem] text-center text-sm font-medium tabular-nums">
              Неделя {statsWeek}
              {statsWeek === activeWeek && (
                <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                  текущая
                </span>
              )}
            </span>
            <button
              type="button"
              aria-label="Следующая неделя"
              disabled={statsWeek >= 12}
              onClick={() => setStatsWeek((w) => Math.min(12, w + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {spheres.length === 0 ? (
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Активность</h2>
          {filterSphere === "all" && spheres.length > 0 && (
            <button
              type="button"
              aria-pressed={chartBySphere}
              onClick={() => setChartBySphere((v) => !v)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                chartBySphere
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-white/10 text-muted-foreground hover:text-foreground"
              )}
            >
              По направлениям
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {taskWeekScope === "by_week" ? (
            <>Активность за неделю {statsWeek}</>
          ) : filterSphere === "all" ? (
            chartBySphere ? (
              "Опыт по направлениям за 14 дней (ритуал и закрытие недели — в «Прочее»)"
            ) : (
              `Здоровье сейчас: ${Math.round(seasonFlame?.value ?? 100)}%`
            )
          ) : (
            `Только направление «${spheres.find((s) => s.id === filterSphere)?.name ?? ""}»`
          )}
        </p>
        <StatsXpChart
          data={chartBySphere && xpDailyBySphere ? xpDailyBySphere : xpDaily}
          series={chartSeries}
        />
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Источники XP
            {taskWeekScope === "by_week"
              ? ` · неделя ${statsWeek}`
              : ` · ${XP_SOURCE_DAYS} дн.`}
          </p>
          <StatsXpSources rows={xpSources} total={xpSourceTotal} />
        </div>
      </div>

      <div className="game-surface space-y-3 p-4">
        <h2 className="font-display text-lg font-semibold">Привычки</h2>
        <p className="text-xs text-muted-foreground">
          {taskWeekScope === "by_week" ? (
            <>
              Календарь недели {statsWeek}
              {filterSphere !== "all"
                ? ` · «${spheres.find((s) => s.id === filterSphere)?.name ?? ""}»`
                : ""}
            </>
          ) : (
            <>
              Выполнение за последние {HABIT_GRID_DAYS} дней · весь цикл
              {filterSphere !== "all"
                ? ` · «${spheres.find((s) => s.id === filterSphere)?.name ?? ""}»`
                : ""}
            </>
          )}
        </p>
        {taskWeekScope === "by_week" && (
          <p className="text-[11px] text-muted-foreground">
            Тот же период, что у задач выше. Пунктир — дни, которые ещё не наступили.
          </p>
        )}
        <StatsHabitsGrid
          taskWeekScope={taskWeekScope}
          statsWeek={statsWeek}
          cycleStartDate={cycleStartDate}
          filterSphere={filterSphere}
        />
      </div>

      <StatsLegacyGoalsSection />
    </div>
  );
}
