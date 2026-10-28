import { todayISO } from "@/lib/gamification";

const PREFIX = "daily-entry-routed:";

/** Один раз за день: уже показывали «Путь» как стартовый экран до открытия этажа. */
export function hasDailyEntryRouted(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(PREFIX + todayISO()) === "1";
}

export function markDailyEntryRouted(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PREFIX + todayISO(), "1");
}
