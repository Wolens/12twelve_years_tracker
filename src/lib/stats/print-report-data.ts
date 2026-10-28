import type {
  AppState,
  CycleTask,
  Goal,
  Sphere,
  WeekData,
  XpLedgerEntry,
} from "@/types";
import { computeCycleOverview, weekStatsRows, type WeekStatRow } from "./cycle-overview";
import { sphereMetricProgress } from "./sphere-metric-progress";
import { sphereTaskStats } from "./sphere-task-stats";
import {
  xpBySourceBucket,
  xpForWeek,
  xpLast7Days,
  sumXp,
  filterLedgerSince,
} from "./xp-activity";
import {
  counterProgress,
  isGoalComplete,
  metricProgressPercent,
} from "@/lib/goals";
import { todayISO } from "@/lib/gamification";

export type PrintReportWeekRow = WeekStatRow & {
  xp: number;
  reflectionNote?: string;
  reflectionRating?: number;
  reflectionWins?: string;
  reflectionStruggles?: string;
};

export type PrintReportSphereSection = {
  sphere: Sphere;
  description?: string;
  metricLabel: string | null;
  metricPercent: number | null;
  tasksAll: { done: number; total: number; percent: number };
  tasksByWeek: { week: number; tasks: CycleTask[] }[];
};

export type PrintReportLegacyGoal = {
  goal: Goal;
  sphereName: string;
  progressText: string;
  complete: boolean;
};

export type PrintReportData = {
  generatedAt: string;
  cycleStartDate: string;
  activeWeek: number;
  playerName: string;
  level: number;
  totalXp: number;
  streak: number;
  vitality: number;
  overview: ReturnType<typeof computeCycleOverview>;
  xp7d: number;
  xp28d: number;
  xpSources: ReturnType<typeof xpBySourceBucket>;
  weeks: PrintReportWeekRow[];
  spheres: PrintReportSphereSection[];
  legacyGoals: PrintReportLegacyGoal[];
};

function groupTasksByWeek(tasks: CycleTask[]): { week: number; tasks: CycleTask[] }[] {
  const weeks = new Set(tasks.map((t) => t.week));
  return Array.from(weeks)
    .sort((a, b) => a - b)
    .map((week) => ({
      week,
      tasks: tasks.filter((t) => t.week === week).sort((a, b) => a.title.localeCompare(b.title, "ru")),
    }));
}

export function buildPrintReportData(state: Pick<
  AppState,
  | "cycleTasks"
  | "weeks"
  | "spheres"
  | "hiddenSphereIds"
  | "activeWeek"
  | "cycleStartDate"
  | "profile"
  | "seasonFlame"
  | "goals"
>): PrintReportData {
  const ledger: XpLedgerEntry[] = state.profile.xpLedger ?? [];
  const visibleSpheres = state.spheres.filter(
    (s) => !state.hiddenSphereIds.includes(s.id)
  );

  const overview = computeCycleOverview(
    state.cycleTasks,
    state.weeks,
    state.activeWeek
  );

  const weekRows: PrintReportWeekRow[] = weekStatsRows(
    state.cycleTasks,
    state.weeks
  ).map((row) => {
    const w = state.weeks.find((x) => x.number === row.week);
    const ref = w?.reflection;
    return {
      ...row,
      xp: xpForWeek(ledger, state.cycleStartDate, row.week),
      reflectionNote: ref?.note?.trim() || undefined,
      reflectionRating: ref?.rating,
      reflectionWins: ref?.wins?.trim() || undefined,
      reflectionStruggles: ref?.struggles?.trim() || undefined,
    };
  });

  const spheres: PrintReportSphereSection[] = visibleSpheres.map((sphere) => {
    const sphereTasks = state.cycleTasks.filter((t) => t.sphereId === sphere.id);
    const stats = sphereTaskStats(state.cycleTasks, sphere.id);
    const metric = sphereMetricProgress(sphere);
    return {
      sphere,
      description: sphere.description?.trim() || undefined,
      metricLabel: metric?.label ?? null,
      metricPercent: metric && !metric.missingCurrent ? metric.percent : null,
      tasksAll: stats,
      tasksByWeek: groupTasksByWeek(sphereTasks),
    };
  });

  const legacyGoals: PrintReportLegacyGoal[] = state.goals
    .filter((g) => !state.hiddenSphereIds.includes(g.sphereId))
    .map((g) => {
      const sphere = state.spheres.find((s) => s.id === g.sphereId);
      const progressText =
        g.type === "counter"
          ? `${counterProgress(g)}/${g.targetCount ?? "?"}`
          : g.type === "metric"
            ? `${Math.round(metricProgressPercent(g))}%`
            : g.done || g.completed
              ? "выполнено"
              : "не выполнено";
      return {
        goal: g,
        sphereName: sphere?.name ?? "—",
        progressText,
        complete: isGoalComplete(g),
      };
    });

  return {
    generatedAt: todayISO(),
    cycleStartDate: state.cycleStartDate,
    activeWeek: state.activeWeek,
    playerName: state.profile.name || "Игрок",
    level: state.profile.level,
    totalXp: state.profile.xp,
    streak: state.profile.streak,
    vitality: Math.round(state.seasonFlame?.value ?? 100),
    overview,
    xp7d: xpLast7Days(ledger),
    xp28d: sumXp(filterLedgerSince(ledger, 28)),
    xpSources: xpBySourceBucket(ledger, 28),
    weeks: weekRows,
    spheres,
    legacyGoals,
  };
}

function formatRuDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatReportDate(iso: string): string {
  return formatRuDate(iso);
}

export type PrintReportSectionId =
  | "summary"
  | "weeksTable"
  | "reflections"
  | "spheres"
  | "taskDetails"
  | "xpActivity"
  | "legacyGoals";

export type PrintReportSections = Record<PrintReportSectionId, boolean>;

export const DEFAULT_PRINT_REPORT_SECTIONS: PrintReportSections = {
  summary: true,
  weeksTable: true,
  reflections: true,
  spheres: true,
  taskDetails: true,
  xpActivity: true,
  legacyGoals: true,
};

export const PRINT_REPORT_SECTION_LABELS: Record<
  PrintReportSectionId,
  { title: string; hint?: string }
> = {
  summary: { title: "Сводка", hint: "Игрок, цикл, задачи, streak, XP" },
  weeksTable: { title: "Таблица 12 недель", hint: "Статус, задачи, %, XP по неделям" },
  reflections: {
    title: "Заметки и рефлексии",
    hint: "Короткие заметки, оценки недель",
  },
  spheres: {
    title: "Цели (направления)",
    hint: "Описание, числовые цели, сводка задач",
  },
  taskDetails: {
    title: "Списки задач",
    hint: "Подробный перечень по неделям внутри целей",
  },
  xpActivity: { title: "XP за 28 дней", hint: "Источники опыта" },
  legacyGoals: { title: "Архив старых целей", hint: "Счётчики и метрики до обновления" },
};

export const PRINT_REPORT_SECTION_ORDER: PrintReportSectionId[] = [
  "summary",
  "weeksTable",
  "reflections",
  "spheres",
  "taskDetails",
  "xpActivity",
  "legacyGoals",
];
