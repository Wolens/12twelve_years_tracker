import type { PendingChest } from "@/types/rpg";
import { generateId } from "@/lib/utils";

export type LevelMilestone = {
  level: number;
  title: string;
  description: string;
  chest?: PendingChest["tier"];
  unlock?: string;
};

export const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    level: 1,
    title: "Старт",
    description: "Магазин открыт. Одежда появится, когда накопятся монеты.",
  },
  {
    level: 3,
    title: "Тайный сундук",
    description: "Случайный предмет необычной редкости",
    chest: "mystery",
  },
  { level: 5, title: "Усиление", description: "+монеты за закрытие задач недели" },
  {
    level: 8,
    title: "Редкий сундук",
    description: "Шанс на редкий предмет",
    chest: "rare",
  },
  {
    level: 10,
    title: "Опытный странник",
    description: "Больше монет за задачи и закрытие недель",
  },
  {
    level: 15,
    title: "Эпический сундук",
    description: "Мощная экипировка",
    chest: "rare",
  },
  {
    level: 20,
    title: "Легендарный шанс",
    description: "Сундук с шансом на легенду",
    chest: "legendary",
  },
  { level: 25, title: "Мастер башни", description: "Скоро: битвы с боссами (в разработке)" },
];

export function milestoneForLevel(level: number): LevelMilestone | undefined {
  return LEVEL_MILESTONES.find((m) => m.level === level);
}

export function milestonesUpTo(maxLevel: number): LevelMilestone[] {
  return LEVEL_MILESTONES.filter((m) => m.level <= maxLevel);
}

export function createChestForLevel(level: number, tier: PendingChest["tier"]): PendingChest {
  return {
    id: generateId(),
    earnedAtLevel: level,
    tier,
  };
}

/** Склонение: 1 уровень, 2 уровня, 5 уровней. */
export function levelNoun(count: number): "уровень" | "уровня" | "уровней" {
  const n = Math.abs(Math.trunc(count));
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return "уровень";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "уровня";
  return "уровней";
}

export function chestLevelsToGrant(
  level: number,
  alreadyClaimed: number[]
): { level: number; tier: PendingChest["tier"] }[] {
  const out: { level: number; tier: PendingChest["tier"] }[] = [];
  for (const m of LEVEL_MILESTONES) {
    if (m.level > level) break;
    if (!m.chest) continue;
    if (alreadyClaimed.includes(m.level)) continue;
    out.push({ level: m.level, tier: m.chest });
  }
  return out;
}
