import type { AppState, CycleTask, Goal, Sphere, AchievementId } from "@/types";
import { generateId } from "./utils";
import { todayISO } from "./gamification";

function sphereId(name: string, spheres: Sphere[]): string {
  return spheres.find((s) => s.name.includes(name))?.id ?? spheres[0].id;
}

export function buildDemoGoals(spheres: Sphere[]): { goals: Goal[]; cycleTasks: CycleTask[] } {
  const health = sphereId("Здоровье", spheres);
  const creative = sphereId("Творчество", spheres);
  const finance = sphereId("Финансы", spheres);

  const today = todayISO();
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const reelsId = generateId();
  const healthId = generateId();
  const financeId = generateId();

  const goals: Goal[] = [
    {
      id: reelsId,
      sphereId: creative,
      title: "12 рилсов за цикл",
      type: "counter",
      targetCount: 12,
      unit: "рилс",
      increments: [
        { date: daysAgo(14), amount: 1 },
        { date: daysAgo(10), amount: 2 },
        { date: daysAgo(5), amount: 1 },
        { date: today, amount: 1 },
      ],
    },
    {
      id: healthId,
      sphereId: health,
      title: "Вес до 72 кг",
      type: "metric",
      unit: "кг",
      startValue: 78,
      targetValue: 72,
      currentValue: 75.2,
      direction: "down",
      measurements: [
        { date: daysAgo(28), value: 78 },
        { date: daysAgo(21), value: 77.1 },
        { date: daysAgo(14), value: 76.4 },
        { date: daysAgo(7), value: 75.8 },
        { date: today, value: 75.2 },
      ],
    },
    {
      id: financeId,
      sphereId: finance,
      title: "Накопить 100 000 ₽",
      type: "metric",
      unit: "₽",
      startValue: 0,
      targetValue: 100000,
      currentValue: 32000,
      direction: "up",
      measurements: [
        { date: daysAgo(30), value: 5000 },
        { date: daysAgo(20), value: 15000 },
        { date: daysAgo(10), value: 24000 },
        { date: today, value: 32000 },
      ],
    },
    {
      id: generateId(),
      sphereId: finance,
      title: "Сделать сайт",
      type: "onetime",
      done: false,
    },
  ];

  const siteGoal = goals.find((g) => g.title === "Сделать сайт")!;

  const cycleTasks: CycleTask[] = [
    {
      id: generateId(),
      goalId: reelsId,
      sphereId: creative,
      week: 1,
      title: "2 рилса",
      done: true,
    },
    {
      id: generateId(),
      goalId: reelsId,
      sphereId: creative,
      week: 2,
      title: "Смонтировать рилс",
      done: true,
    },
    {
      id: generateId(),
      goalId: healthId,
      sphereId: health,
      week: 1,
      title: "3 тренировки",
      done: true,
    },
    {
      id: generateId(),
      goalId: healthId,
      sphereId: health,
      week: 3,
      title: "10k шагов × 4",
      done: false,
    },
    {
      id: generateId(),
      goalId: siteGoal.id,
      sphereId: finance,
      week: 4,
      title: "Сверстать главную",
      done: false,
    },
  ];

  return { goals, cycleTasks };
}

export function applyDemoPatch(state: AppState): Partial<AppState> {
  const demo = buildDemoGoals(state.spheres);
  return {
    goals: demo.goals,
    cycleTasks: demo.cycleTasks,
    profile: {
      ...state.profile,
      xp: 420,
      level: 5,
      streak: 4,
      lastActivityDate: todayISO(),
      achievements: Array.from(
        new Set<AchievementId>([...state.profile.achievements, "demo_loaded"])
      ),
    },
    weeks: state.weeks.map((w) =>
      w.number <= 2 ? { ...w, closed: true, bonusAwarded: true } : w
    ),
  };
}
