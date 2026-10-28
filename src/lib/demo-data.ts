import type { AppState, CycleTask, Sphere, AchievementId } from "@/types";
import { generateId } from "./utils";
import { todayISO } from "./gamification";

function sphereId(name: string, spheres: Sphere[]): string {
  return spheres.find((s) => s.name.includes(name))?.id ?? spheres[0].id;
}

export function buildDemoGoals(spheres: Sphere[]): { goals: []; cycleTasks: CycleTask[] } {
  const health = sphereId("Здоровье", spheres);
  const creative = sphereId("Творчество", spheres);
  const finance = sphereId("Финансы", spheres);

  const cycleTasks: CycleTask[] = [
    {
      id: generateId(),
      sphereId: creative,
      week: 1,
      title: "2 рилса",
      done: true,
    },
    {
      id: generateId(),
      sphereId: creative,
      week: 2,
      title: "Смонтировать рилс",
      done: true,
    },
    {
      id: generateId(),
      sphereId: health,
      week: 1,
      title: "3 тренировки",
      done: true,
    },
    {
      id: generateId(),
      sphereId: health,
      week: 3,
      title: "10k шагов × 4",
      done: false,
    },
    {
      id: generateId(),
      sphereId: finance,
      week: 4,
      title: "Сверстать главную",
      done: false,
    },
  ];

  return { goals: [], cycleTasks };
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
