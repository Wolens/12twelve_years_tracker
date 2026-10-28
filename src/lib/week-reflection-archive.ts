import type { WeekData } from "@/types";

export type WeekNoteArchiveEntry = {
  week: number;
  closed: boolean;
  note: string;
  rating: number | null;
};

export function weekHasDiaryEntry(week: WeekData): boolean {
  const ref = week.reflection;
  if (!ref) return false;
  if (ref.note?.trim()) return true;
  if (typeof ref.rating === "number" && ref.rating !== 7) return true;
  return false;
}

/** Заметки и оценки по неделям (новые сверху). */
export function listWeekNoteArchive(weeks: WeekData[]): WeekNoteArchiveEntry[] {
  return weeks
    .map((w) => {
      const ref = w.reflection;
      const note = ref?.note?.trim() ?? "";
      const rating = typeof ref?.rating === "number" ? ref.rating : null;
      if (!note && rating === null) return null;
      return {
        week: w.number,
        closed: w.closed,
        note,
        rating,
      };
    })
    .filter((e): e is WeekNoteArchiveEntry => e !== null)
    .sort((a, b) => b.week - a.week);
}
