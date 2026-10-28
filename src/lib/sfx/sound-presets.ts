/** Фиксированный щелчок интерфейса */
export type ClickPresetId = "prism";

/** Приключенческие темы для «Пути» */
export type PathPresetId =
  | "road"
  | "forest"
  | "mountain"
  | "camp"
  | "market"
  | "sea"
  | "caravan"
  | "treasure"
  | "sprint"
  | "horizon"
  | "off";

export const UI_CLICK_LABEL = {
  title: "Призма",
  hint: "Стекло с лёгким обертоном — всегда этот щелчок",
};

export const PATH_PRESET_LABELS: Record<PathPresetId, { title: string; hint: string }> = {
  road: { title: "Дорога", hint: "Ровный шаг вперёд, мажор, «идём дальше»" },
  forest: { title: "Лесная тропа", hint: "Светло-зелёный лад, переливы вверх" },
  mountain: { title: "Перевал", hint: "Широкие ноты, чувство подъёма" },
  camp: { title: "Привал", hint: "Тёплый костёр, медленные аккорды" },
  market: { title: "Ярмарка", hint: "Живо, короткие скачки — как на базаре" },
  sea: { title: "Морской бриз", hint: "Качка волны, лёгкий мажор" },
  caravan: { title: "Караван", hint: "Уверенный ритм, дорога через пустыню" },
  treasure: { title: "Клад", hint: "Быстрые arpeggio, азарт находки" },
  sprint: { title: "Рывок", hint: "Темп выше — «ещё один квест»" },
  horizon: { title: "Горизонт", hint: "Открытый финал, надежда впереди" },
  off: { title: "Без музыки", hint: "На «Пути» тишина" },
};

const PATH_KEY = "twelve-weeks-path-preset";

export const PATH_PRESET_ORDER: PathPresetId[] = [
  "road",
  "forest",
  "mountain",
  "camp",
  "market",
  "sea",
  "caravan",
  "treasure",
  "sprint",
  "horizon",
  "off",
];

const PATH_IDS = new Set<PathPresetId>(PATH_PRESET_ORDER);

const LEGACY_PATH: Record<string, PathPresetId> = {
  cave: "forest",
  crypt: "camp",
  catacombs: "camp",
  mine: "caravan",
  lair: "mountain",
  sewers: "road",
  ruins: "horizon",
  abyss: "horizon",
  vault: "treasure",
  ancient_hall: "mountain",
  harp: "treasure",
  wind: "sea",
  quiet: "camp",
  bells: "market",
  space: "horizon",
  dawn: "horizon",
  night: "forest",
  creek: "forest",
  drift: "sea",
};

function normalizePath(stored: string | null): PathPresetId {
  if (!stored) return "road";
  if (PATH_IDS.has(stored as PathPresetId)) return stored as PathPresetId;
  return LEGACY_PATH[stored] ?? "road";
}

export function getClickPreset(): ClickPresetId {
  return "prism";
}

export function getPathPreset(): PathPresetId {
  if (typeof window === "undefined") return "road";
  return normalizePath(localStorage.getItem(PATH_KEY));
}

export function setPathPreset(id: PathPresetId) {
  localStorage.setItem(PATH_KEY, id);
}
