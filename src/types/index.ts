export type Sphere = {
  id: string;
  name: string;
  icon: string;
  color: string;
  custom?: boolean;
};

export type GoalType = "counter" | "metric" | "onetime";

export type IncrementEntry = { date: string; amount: number };

export type MeasurementEntry = { id?: string; date: string; value: number };

/** Недельная задача в разделе «12 недель», привязана к цели периода */
export type CycleTask = {
  id: string;
  goalId: string;
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
  | "first_counter_log"
  | "first_metric_log"
  | "week_perfect_3"
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
  dayAssignments: DayAssignments;
};

export const STORAGE_KEY = "twelve-weeks-tracker-v1";
export const AUTH_STORAGE_KEY = "twelve-weeks-auth-v1";
export const DATA_VERSION = 5;
