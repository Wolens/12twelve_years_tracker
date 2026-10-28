import { todayISO } from "@/lib/gamification";
import type { XpLedgerEntry } from "@/types";

export const CYCLE_DAYS = 84;

export type DayTone = "future" | "today" | "walked" | "absent" | "idle";

const MARK = /^(cycle_task:|onetime_goal:|goal_complete:|daily_quest:)/;

export function cycleDayDate(start: string, index: number): string {
  const d = new Date(start + "T12:00:00");
  d.setDate(d.getDate() + index);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toneForDate(date: string, today: string, ledger: XpLedgerEntry[]): DayTone {
  if (date > today) return "future";
  const rows = ledger.filter((e) => e.at.slice(0, 10) === date && e.amount > 0);
  const marked = rows.some((e) => Boolean(e.sourceId && MARK.test(e.sourceId)));
  if (marked) return "walked";
  if (date === today) return "today";
  const visited = rows.some((e) => e.sourceId?.startsWith("daily_ritual:"));
  if (!visited) return "absent";
  return "idle";
}

export function todayIndex(start: string): number {
  const today = todayISO();
  const startDate = new Date(start + "T12:00:00");
  const now = new Date(today + "T12:00:00");
  return Math.round((now.getTime() - startDate.getTime()) / 86400000);
}

export function toneLabel(tone: DayTone): string {
  if (tone === "walked") return "день с делом";
  if (tone === "absent") return "без захода";
  if (tone === "idle") return "заход без отметки";
  if (tone === "today") return "сегодня";
  return "впереди";
}
