import type { XpLedgerEntry } from "@/types";
import { todayISO } from "@/lib/gamification";
import { weekDateRange } from "@/lib/gamification";

export type XpSourceBucket =
  | "tasks"
  | "week_close"
  | "ritual"
  | "quest"
  | "goal"
  | "other";

export function classifyXpSource(sourceId: string | undefined): XpSourceBucket {
  if (!sourceId) return "other";
  if (sourceId.startsWith("cycle_task:")) return "tasks";
  if (sourceId.startsWith("week_close:")) return "week_close";
  if (sourceId.startsWith("daily_ritual:")) return "ritual";
  if (sourceId.startsWith("daily_quest:")) return "quest";
  if (sourceId.startsWith("onetime_goal:") || sourceId.startsWith("goal_complete:"))
    return "goal";
  return "other";
}

const BUCKET_LABELS: Record<XpSourceBucket, string> = {
  tasks: "Задачи",
  week_close: "Закрытие недели",
  ritual: "Ритуал дня",
  quest: "Квест дня",
  goal: "Цели (архив)",
  other: "Прочее",
};

export function xpSourceBucketLabel(bucket: XpSourceBucket): string {
  return BUCKET_LABELS[bucket];
}

function daysAgoISO(days: number): string {
  const d = new Date(`${todayISO()}T12:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function filterLedgerSince(
  ledger: XpLedgerEntry[] | undefined,
  days: number
): XpLedgerEntry[] {
  const list = ledger ?? [];
  const since = daysAgoISO(days - 1);
  return list.filter((e) => e.at.slice(0, 10) >= since);
}

export function sumXp(entries: XpLedgerEntry[]): number {
  return entries.reduce((s, e) => s + e.amount, 0);
}

export function xpByDay(
  ledger: XpLedgerEntry[] | undefined,
  days: number
): { date: string; xp: number }[] {
  const filtered = filterLedgerSince(ledger, days);
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    map.set(daysAgoISO(i), 0);
  }
  for (const e of filtered) {
    const d = e.at.slice(0, 10);
    if (!map.has(d)) continue;
    map.set(d, (map.get(d) ?? 0) + e.amount);
  }
  return Array.from(map.entries()).map(([date, xp]) => ({ date, xp }));
}

export function xpBySourceBucket(
  ledger: XpLedgerEntry[] | undefined,
  days: number
): { bucket: XpSourceBucket; xp: number; label: string }[] {
  const filtered = filterLedgerSince(ledger, days);
  const totals: Record<XpSourceBucket, number> = {
    tasks: 0,
    week_close: 0,
    ritual: 0,
    quest: 0,
    goal: 0,
    other: 0,
  };
  for (const e of filtered) {
    totals[classifyXpSource(e.sourceId)] += e.amount;
  }
  return (Object.keys(totals) as XpSourceBucket[])
    .filter((b) => totals[b] > 0)
    .map((bucket) => ({
      bucket,
      xp: totals[bucket],
      label: xpSourceBucketLabel(bucket),
    }))
    .sort((a, b) => b.xp - a.xp);
}

export function xpForWeek(
  ledger: XpLedgerEntry[] | undefined,
  cycleStartDate: string,
  weekNumber: number
): number {
  const { start, end } = weekDateRange(cycleStartDate, weekNumber);
  return sumXp(
    (ledger ?? []).filter((e) => {
      const d = e.at.slice(0, 10);
      return d >= start && d <= end;
    })
  );
}

export function filterLedgerBySphere(
  ledger: XpLedgerEntry[] | undefined,
  sphereId: string,
  tasks: { id: string; sphereId: string }[],
  goals: { id: string; sphereId: string }[]
): XpLedgerEntry[] {
  const taskIds = new Set(tasks.filter((t) => t.sphereId === sphereId).map((t) => t.id));
  const goalIds = new Set(goals.filter((g) => g.sphereId === sphereId).map((g) => g.id));
  return (ledger ?? []).filter((entry) => {
    const sourceId = entry.sourceId ?? "";
    if (sourceId.startsWith("cycle_task:")) return taskIds.has(sourceId.slice("cycle_task:".length));
    if (sourceId.startsWith("onetime_goal:")) return goalIds.has(sourceId.slice("onetime_goal:".length));
    if (sourceId.startsWith("goal_complete:")) return goalIds.has(sourceId.slice("goal_complete:".length));
    return false;
  });
}

export function xpLast7Days(ledger: XpLedgerEntry[] | undefined): number {
  return sumXp(filterLedgerSince(ledger, 7));
}
