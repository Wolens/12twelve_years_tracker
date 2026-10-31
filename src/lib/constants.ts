import type { Sphere } from "@/types";

export const DEFAULT_SPHERES: Omit<Sphere, "id">[] = [
  { name: "Здоровье и тело", icon: "health", color: "#34d399" },
  { name: "Ментальное состояние", icon: "mind", color: "#a78bfa" },
  { name: "Карьера / работа", icon: "career", color: "#60a5fa" },
  { name: "Финансы", icon: "finance", color: "#fbbf24" },
  { name: "Творчество / хобби", icon: "creative", color: "#f472b6" },
  { name: "Обучение", icon: "learn", color: "#38bdf8" },
  { name: "Отношения", icon: "relations", color: "#fb7185" },
  { name: "Личностный рост", icon: "growth", color: "#4ade80" },
];

export const XP_TASK = 10;
export const XP_WEEK_CLOSED = 50;
export const XP_GOAL_COMPLETED = 100;
export const XP_STREAK_PER_DAY = 5;
export const XP_STREAK_CAP = 50;
export const XP_DAILY_RITUAL_MIN = 12;
export const XP_DAILY_RITUAL_MAX = 28;
export const XP_DAILY_QUEST_BONUS = 40;
export const XP_HABIT = 5;
export const DAILY_QUEST_TASKS = 3;

export const MAX_LEVEL = 100;

export type AchievementIconName =
  | "sunrise"
  | "calendar-check"
  | "list-todo"
  | "milestone"
  | "layers"
  | "flag"
  | "radar"
  | "coins"
  | "package-open"
  | "mask"
  | "zap"
  | "shield"
  | "book-open"
  | "compass"
  | "hexagon"
  | "mountain";

export const ACHIEVEMENTS_META: Record<
  string,
  { title: string; description: string; icon: AchievementIconName }
> = {
  floor_opened: {
    title: "Этаж открыт",
    description: "Первый раз открыл этаж в башне",
    icon: "sunrise",
  },
  ritual_7: {
    title: "Неделя в башне",
    description: "7 разных дней с открытым этажом",
    icon: "calendar-check",
  },
  first_goal_done: {
    title: "Первая задача",
    description: "Отмечена первая задача недели",
    icon: "list-todo",
  },
  first_week_closed: {
    title: "Первая неделя",
    description: "Неделя закрыта и бонус получен",
    icon: "milestone",
  },
  week_perfect_3: {
    title: "Три подряд",
    description: "Три недели закрыты подряд",
    icon: "layers",
  },
  cycle_complete: {
    title: "12 недель",
    description: "Все 12 недель цикла закрыты",
    icon: "flag",
  },
  all_sphere_goals: {
    title: "Направление закрыто",
    description: "Все задачи одного направления выполнены",
    icon: "radar",
  },
  first_purchase: {
    title: "Первая покупка",
    description: "Куплена вещь в магазине",
    icon: "coins",
  },
  chest_opened: {
    title: "Сундук",
    description: "Открыт сундук этажа или уровня",
    icon: "package-open",
  },
  race_chosen: {
    title: "Облик",
    description: "Выбран облик героя вместо человека",
    icon: "mask",
  },
  streak_7: {
    title: "Огонёк 7",
    description: "7 дней подряд с активностью",
    icon: "zap",
  },
  streak_30: {
    title: "Несгораемый",
    description: "30 дней подряд с активностью",
    icon: "shield",
  },
  level_10: {
    title: "Ученик",
    description: "Достигнут 10 уровень",
    icon: "book-open",
  },
  level_25: {
    title: "Практик",
    description: "Достигнут 25 уровень",
    icon: "compass",
  },
  level_50: {
    title: "Мастер",
    description: "Достигнут 50 уровень",
    icon: "hexagon",
  },
  level_100: {
    title: "Легенда",
    description: "Максимальный уровень",
    icon: "mountain",
  },
  habit_streak_7: {
    title: "Ритм 7",
    description: "7 подряд выполненных дней у одной привычки",
    icon: "calendar-check",
  },
};
