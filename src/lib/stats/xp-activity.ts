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

export const XP_SPHERE_OTHER_KEY = "_other";

export function xpEntrySphereId(
  entry: XpLedgerEntry,
  tasks: { id: string; sphereId: string }[],
  goals: { id: string; sphereId: string }[]
): string | null {
  const sourceId = entry.sourceId ?? "";
  if (sourceId.startsWith("cycle_task:")) {
    const id = sourceId.slice("cycle_task:".length);
    return tasks.find((t) => t.id === id)?.sphereId ?? null;
  }
  if (sourceId.startsWith("onetime_goal:")) {
    const id = sourceId.slice("onetime_goal:".length);
    return goals.find((g) => g.id === id)?.sphereId ?? null;
  }
  if (sourceId.startsWith("goal_complete:")) {
    const id = sourceId.slice("goal_complete:".length);
    return goals.find((g) => g.id === id)?.sphereId ?? null;
  }
  return null;
}

export function filterLedgerBySphere(
  ledger: XpLedgerEntry[] | undefined,
  sphereId: string,
  tasks: { id: string; sphereId: string }[],
  goals: { id: string; sphereId: string }[]
): XpLedgerEntry[] {
  return (ledger ?? []).filter((entry) => xpEntrySphereId(entry, tasks, goals) === sphereId);
}

export type XpDayBySphereRow = { date: string } & Record<string, number>;

/** XP по дням с колонками на каждое направление (+ прочее без привязки к сфере). */
export function xpByDayBySpheres(
  ledger: XpLedgerEntry[] | undefined,
  days: number,
  sphereIds: string[],
  tasks: { id: string; sphereId: string }[],
  goals: { id: string; sphereId: string }[]
): XpDayBySphereRow[] {
  const filtered = filterLedgerSince(ledger, days);
  const rows: XpDayBySphereRow[] = [];
  const byDate = new Map<string, XpDayBySphereRow>();

  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoISO(i);
    const row = { date } as XpDayBySphereRow;
    for (const id of sphereIds) row[id] = 0;
    row[XP_SPHERE_OTHER_KEY] = 0;
    rows.push(row);
    byDate.set(date, row);
  }

  for (const e of filtered) {
    const d = e.at.slice(0, 10);
    const row = byDate.get(d);
    if (!row) continue;
    const sphereId = xpEntrySphereId(e, tasks, goals);
    if (sphereId && sphereIds.includes(sphereId)) {
      row[sphereId] = (row[sphereId] ?? 0) + e.amount;
    } else {
      row[XP_SPHERE_OTHER_KEY] = (row[XP_SPHERE_OTHER_KEY] ?? 0) + e.amount;
    }
  }

  return rows;
}

export function xpLast7Days(ledger: XpLedgerEntry[] | undefined): number {
  return sumXp(filterLedgerSince(ledger, 7));
}
