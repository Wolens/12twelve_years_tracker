import type { Profile, XpLedgerEntry } from "@/types";
import { todayISO } from "@/lib/gamification";
import {
  DAILY_QUEST_TASKS,
  XP_DAILY_QUEST_BONUS,
  XP_DAILY_RITUAL_MAX,
  XP_DAILY_RITUAL_MIN,
} from "@/lib/constants";

export function xpSourceDailyRitual(date: string): string {
  return `daily_ritual:${date}`;
}

export function xpSourceDailyQuest(date: string): string {
  return `daily_quest:${date}`;
}

function ledgerOnDate(ledger: XpLedgerEntry[] | undefined, date: string): XpLedgerEntry[] {
  return (ledger ?? []).filter((e) => e.at.slice(0, 10) === date);
}

export function cycleTasksCompletedToday(ledger: XpLedgerEntry[] | undefined): number {
  const today = todayISO();
  return ledgerOnDate(ledger, today).filter((e) =>
    e.sourceId?.startsWith("cycle_task:")
  ).length;
}

export function ritualClaimedToday(profile: Profile): boolean {
  return profile.lastRitualDate === todayISO();
}

export function dailyQuestClaimedToday(profile: Profile): boolean {
  return profile.dailyQuestClaimDate === todayISO();
}

export function dailyQuestProgress(ledger: XpLedgerEntry[] | undefined): {
  done: number;
  target: number;
  complete: boolean;
} {
  const done = cycleTasksCompletedToday(ledger);
  return {
    done: Math.min(done, DAILY_QUEST_TASKS),
    target: DAILY_QUEST_TASKS,
    complete: done >= DAILY_QUEST_TASKS,
  };
}

export function canClaimDailyQuest(profile: Profile, ledger: XpLedgerEntry[] | undefined): boolean {
  if (dailyQuestClaimedToday(profile)) return false;
  return dailyQuestProgress(ledger).complete;
}

export function randomRitualXp(): number {
  const span = XP_DAILY_RITUAL_MAX - XP_DAILY_RITUAL_MIN + 1;
  return XP_DAILY_RITUAL_MIN + Math.floor(Math.random() * span);
}

export const RITUAL_LINES = [
  "Сезон не ждёт — но этот день только начался.",
  "Одна галочка сегодня бьёт десять планов на завтра.",
  "Маленький шаг в правильную сферу — уже победа.",
  "Ты здесь — значит, игра продолжается.",
  "Фокус на сегодня, не на весь год.",
];

export function pickRitualLine(): string {
  return RITUAL_LINES[Math.floor(Math.random() * RITUAL_LINES.length)];
}

export function dailyQuestBonusAmount(): number {
  return XP_DAILY_QUEST_BONUS;
}
