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
export const DAILY_QUEST_TASKS = 3;

export const MAX_LEVEL = 100;

export const ACHIEVEMENTS_META: Record<
  string,
  { title: string; description: string; emoji: string }
> = {
  first_week_closed: {
    title: "Первая неделя",
    description: "Закрыта первая неделя цикла",
    emoji: "📅",
  },
  streak_7: {
    title: "Огонёк 7",
    description: "7 дней подряд с активностью",
    emoji: "🔥",
  },
  streak_30: {
    title: "Несгораемый",
    description: "30 дней streak",
    emoji: "💥",
  },
  level_10: {
    title: "Ученик",
    description: "Достигнут 10 уровень",
    emoji: "⭐",
  },
  level_25: {
    title: "Практик",
    description: "Достигнут 25 уровень",
    emoji: "🌟",
  },
  level_50: {
    title: "Мастер",
    description: "Достигнут 50 уровень",
    emoji: "🏆",
  },
  level_100: {
    title: "Легенда",
    description: "Максимальный уровень",
    emoji: "👑",
  },
  first_goal_done: {
    title: "Цель достигнута",
    description: "Первая цель выполнена",
    emoji: "🎯",
  },
  all_sphere_goals: {
    title: "Сфера закрыта",
    description: "Все цели одной сферы выполнены",
    emoji: "💎",
  },
  cycle_complete: {
    title: "12 недель",
    description: "Цикл полностью завершён",
    emoji: "🎉",
  },
  first_counter_log: {
    title: "Счётчик",
    description: "Первый прогресс по количественной цели",
    emoji: "➕",
  },
  first_metric_log: {
    title: "Замер",
    description: "Первый замер метрики",
    emoji: "📏",
  },
  week_perfect_3: {
    title: "Три подряд",
    description: "3 недели закрыты подряд",
    emoji: "🔗",
  },
  onboarding_done: {
    title: "Старт",
    description: "Онбординг завершён",
    emoji: "🚀",
  },
  demo_loaded: {
    title: "Демо",
    description: "Загружены примеры данных",
    emoji: "🧪",
  },
};
