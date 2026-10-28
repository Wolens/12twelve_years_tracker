import type { CharacterState, SeasonFlameState } from "@/types/rpg";

export type { CharacterState, SeasonFlameState, RaceId, CharacterGender, ItemRarity } from "@/types/rpg";

export type Sphere = {
  id: string;
  name: string;
  icon: string;
  color: string;
  custom?: boolean;
  /** Описание цели на 12 недель */
  description?: string;
  /** Начальное значение (число, для анализа) */
  startValue?: number;
  /** Целевое значение (число, для анализа) */
  targetValue?: number;
  /** Текущее значение (число, для анализа и статистики) */
  currentValue?: number;
};

export type GoalType = "counter" | "metric" | "onetime";

export type IncrementEntry = { date: string; amount: number };

export type MeasurementEntry = { id?: string; date: string; value: number };

/** Недельная задача внутри цели (сферы) на 12 недель */
export type CycleTask = {
  id: string;
  /** Устарело: раньше привязка к цели периода; новые задачи только по sphereId */
  goalId?: string;
  sphereId: string;
  week: number;
  title: string;
  done: boolean;
};

export type Goal = {
  id: string;
  sphereId: string;
  title: string;
  type: GoalType;
  unit?: string;
  targetCount?: number;
  increments?: IncrementEntry[];
  startValue?: number;
  targetValue?: number;
  currentValue?: number;
  direction?: "up" | "down";
  measurements?: MeasurementEntry[];
  done?: boolean;
  completed?: boolean;
};

export type WeekReflection = {
  note: string;
  rating: number;
  wins: string;
  struggles: string;
};

export type WeekData = {
  number: number;
  reflection?: WeekReflection;
  closed: boolean;
  bonusAwarded?: boolean;
};

export type AchievementId =
  | "first_week_closed"
  | "streak_7"
  | "streak_30"
  | "level_10"
  | "level_25"
  | "level_50"
  | "level_100"
  | "first_goal_done"
  | "all_sphere_goals"
  | "cycle_complete"
  | "week_perfect_3"
  | "floor_opened"
  | "ritual_7"
  | "first_purchase"
  | "chest_opened"
  | "race_chosen"
  | "first_counter_log"
  | "first_metric_log"
  | "onboarding_done"
  | "demo_loaded";

export type XpLedgerEntry = {
  id: string;
  /** ISO datetime */
  at: string;
  amount: number;
  label: string;
  /** Для отмены: снять галочку, откат недели и т.д. */
  sourceId?: string;
};

export type Profile = {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string | null;
  achievements: AchievementId[];
  xpLedger?: XpLedgerEntry[];
  /** ISO date — «Открыть день» */
  lastRitualDate?: string | null;
  /** ISO date — бонус за дневной квест */
  dailyQuestClaimDate?: string | null;
};

export type ThemeMode = "dark" | "light";

/** ключ `${week}-${day}` (день 1–7), значение — id задач (CycleTask) */
export type DayAssignments = Record<string, string[]>;

export type AppState = {
  version: number;
  onboardingComplete: boolean;
  tourComplete: boolean;
  cycleStartDate: string;
  /** Текущая рабочая неделя цикла (1–12), вручную или по календарю */
  activeWeek: number;
  /** Текущий день внутри рабочей недели (1–7) */
  activeDay: number;
  spheres: Sphere[];
  goals: Goal[];
  cycleTasks: CycleTask[];
  weeks: WeekData[];
  profile: Profile;
  theme: ThemeMode;
  hiddenSphereIds: string[];
  /** Фильтр сфер только для раздела «12 недель». Не связан с «Сегодня». */
  weekHiddenSphereIds: string[];
  /** Выбранная цель в «12 недель» (всегда одна). */
  weekFilterSphereId: string;
  /** Выбранная цель на странице «Цели». */
  goalsFilterSphereId: string;
  dayAssignments: DayAssignments;
  character: CharacterState;
  seasonFlame: SeasonFlameState;
};

export const STORAGE_KEY = "twelve-weeks-tracker-v1";
export const AUTH_STORAGE_KEY = "twelve-weeks-auth-v1";
export const DATA_VERSION = 13;
