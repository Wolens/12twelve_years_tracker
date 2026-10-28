import type { Profile, XpLedgerEntry } from "@/types";
import { todayISO } from "@/lib/gamification";
import { syncProfileFromLedger } from "@/lib/xp-ledger";
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

export function localDateOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pickBestDailyEntry(
  map: Map<string, XpLedgerEntry>,
  day: string,
  entry: XpLedgerEntry,
  sourceForDay: (d: string) => string
): void {
  const prev = map.get(day);
  if (!prev || entry.amount > prev.amount) {
    map.set(day, { ...entry, sourceId: sourceForDay(day) });
  }
}

/** Не больше одной записи daily_ritual / daily_quest на календарный день (локальное время). */
export function dedupeXpLedger(ledger: XpLedgerEntry[]): XpLedgerEntry[] {
  const other: XpLedgerEntry[] = [];
  const bySource = new Map<string, XpLedgerEntry>();
  const ritualByDay = new Map<string, XpLedgerEntry>();
  const questByDay = new Map<string, XpLedgerEntry>();

  for (const entry of ledger) {
    const sid = entry.sourceId;
    if (sid?.startsWith("daily_ritual:")) {
      const sidDay = sid.slice("daily_ritual:".length);
      const cal = localDateOf(entry.at);
      pickBestDailyEntry(ritualByDay, sidDay, entry, xpSourceDailyRitual);
      if (cal !== sidDay) pickBestDailyEntry(ritualByDay, cal, entry, xpSourceDailyRitual);
      continue;
    }
    if (sid?.startsWith("daily_quest:")) {
      const sidDay = sid.slice("daily_quest:".length);
      const cal = localDateOf(entry.at);
      pickBestDailyEntry(questByDay, sidDay, entry, xpSourceDailyQuest);
      if (cal !== sidDay) pickBestDailyEntry(questByDay, cal, entry, xpSourceDailyQuest);
      continue;
    }
    if (sid) {
      if (!bySource.has(sid)) bySource.set(sid, entry);
    } else {
      other.push(entry);
    }
  }

  const rituals = new Map<string, XpLedgerEntry>();
  for (const e of Array.from(ritualByDay.values())) {
    const day = localDateOf(e.at);
    pickBestDailyEntry(rituals, day, e, xpSourceDailyRitual);
  }
  const quests = new Map<string, XpLedgerEntry>();
  for (const e of Array.from(questByDay.values())) {
    const day = localDateOf(e.at);
    pickBestDailyEntry(quests, day, e, xpSourceDailyQuest);
  }

  return [
    ...Array.from(bySource.values()),
    ...Array.from(rituals.values()),
    ...Array.from(quests.values()),
    ...other,
  ];
}

/** Свести lastRitualDate / XP с журналом после merge или дубля на двух устройствах. */
export function reconcileProfileDailyEngagement(profile: Profile): Profile {
  const ledger = dedupeXpLedger(profile.xpLedger ?? []);
  const today = todayISO();
  let lastRitualDate = profile.lastRitualDate;
  if (ritualClaimedToday({ ...profile, xpLedger: ledger })) {
    lastRitualDate = today;
  }
  let dailyQuestClaimDate = profile.dailyQuestClaimDate;
  if (ledger.some((e) => e.sourceId === xpSourceDailyQuest(today))) {
    dailyQuestClaimDate = today;
  }
  return syncProfileFromLedger({
    ...profile,
    xpLedger: ledger,
    lastRitualDate,
    dailyQuestClaimDate,
  });
}

export function ritualClaimedToday(profile: Profile): boolean {
  const today = todayISO();
  if (profile.lastRitualDate === today) return true;
  return (profile.xpLedger ?? []).some((e) => {
    if (!e.sourceId?.startsWith("daily_ritual:")) return false;
    if (e.sourceId === xpSourceDailyRitual(today)) return true;
    return localDateOf(e.at) === today;
  });
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
