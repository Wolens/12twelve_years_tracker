import { MAX_LEVEL, XP_STREAK_CAP, XP_STREAK_PER_DAY } from "./constants";
import type { AchievementId } from "@/types";

export function xpForLevel(level: number): number {
  if (level < 1) return 0;
  /** К концу 12 недель (задачи + закрытия) уровень ~12–16, без гринда до 100. */
  return Math.round(55 + level * 38);
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 0;
  let accumulated = 0;
  while (level < MAX_LEVEL) {
    const next = xpForLevel(level + 1);
    if (accumulated + next > xp) break;
    accumulated += next;
    level++;
  }
  return Math.max(1, level);
}

export function xpProgressInLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
  percent: number;
} {
  const level = levelFromXp(xp);
  const xpAtLevelStart = totalXpForLevel(level - 1);
  const needed = xpForLevel(level + 1);
  const current = xp - xpAtLevelStart;
  const percent = needed > 0 ? Math.min(100, (current / needed) * 100) : 100;
  return { level, current, needed, percent };
}

export function rankTitle(level: number): string {
  if (level >= 100) return "Легенда 12 недель";
  if (level >= 75) return "Эксперт";
  if (level >= 50) return "Мастер";
  if (level >= 25) return "Практик";
  if (level >= 10) return "Ученик";
  return "Новичок";
}

export function streakBonusXp(streak: number): number {
  return Math.min(XP_STREAK_CAP, streak * XP_STREAK_PER_DAY);
}

/** Календарный день в часовом поясе пользователя, не UTC. */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function updateStreak(
  lastActivityDate: string | null,
  streak: number
): { streak: number; lastActivityDate: string; bonusXp: number } {
  const today = todayISO();
  if (lastActivityDate === today) {
    return { streak, lastActivityDate: today, bonusXp: 0 };
  }
  if (lastActivityDate && daysBetween(lastActivityDate, today) === 1) {
    const newStreak = streak + 1;
    return {
      streak: newStreak,
      lastActivityDate: today,
      bonusXp: streakBonusXp(newStreak),
    };
  }
  return { streak: 1, lastActivityDate: today, bonusXp: XP_STREAK_PER_DAY };
}

export function getCurrentWeekNumber(cycleStartDate: string): number {
  const start = new Date(cycleStartDate + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(12, Math.max(1, week));
}

export function getCurrentDayInWeek(
  cycleStartDate: string,
  week: number
): number {
  const currentWeek = getCurrentWeekNumber(cycleStartDate);
  if (week !== currentWeek) return 1;
  const { start } = weekDateRange(cycleStartDate, week);
  const diff = daysBetween(start, todayISO()) + 1;
  return Math.min(7, Math.max(1, diff));
}

export function weekDateRange(
  cycleStartDate: string,
  weekNumber: number
): { start: string; end: string } {
  const start = new Date(cycleStartDate + "T00:00:00");
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function checkLevelAchievements(
  level: number,
  existing: AchievementId[]
): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const checks: [number, AchievementId][] = [
    [10, "level_10"],
    [25, "level_25"],
    [50, "level_50"],
    [100, "level_100"],
  ];
  for (const [lvl, id] of checks) {
    if (level >= lvl && !existing.includes(id)) unlocked.push(id);
  }
  return unlocked;
}
