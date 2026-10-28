import type { GameItem, ItemRarity, RaceId } from "@/types/rpg";

export const RARITY_STYLES: Record<
  ItemRarity,
  { label: string; border: string; glow: string; text: string }
> = {
  common: {
    label: "Обычный",
    border: "border-slate-500/50",
    glow: "shadow-none",
    text: "text-slate-600 dark:text-slate-300",
  },
  uncommon: {
    label: "Необычный",
    border: "border-emerald-500/50",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.25)]",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  rare: {
    label: "Редкий",
    border: "border-sky-500/60",
    glow: "shadow-[0_0_14px_rgba(56,189,248,0.35)]",
    text: "text-sky-700 dark:text-sky-300",
  },
  epic: {
    label: "Эпический",
    border: "border-violet-500/60",
    glow: "shadow-[0_0_16px_rgba(167,139,250,0.4)]",
    text: "text-violet-700 dark:text-violet-300",
  },
  legendary: {
    label: "Легендарный",
    border: "border-amber-400/70",
    glow: "shadow-[0_0_18px_rgba(251,191,36,0.45)]",
    text: "text-amber-800 dark:text-amber-300",
  },
};

export const STARTER_ITEM_IDS = ["tunic_worn", "pants_worn"] as const;

export const GAME_ITEMS: GameItem[] = [
  {
    id: "tunic_worn",
    name: "Поношенная рубаха",
    slot: "torso",
    rarity: "common",
    price: 0,
    requiredLevel: 1,
    healthBonus: 0,
    strengthBonus: 0,
    glyph: "shirt",
  },
  {
    id: "pants_worn",
    name: "Старые штаны",
    slot: "legs",
    rarity: "common",
    price: 0,
    requiredLevel: 1,
    healthBonus: 0,
    strengthBonus: 0,
    glyph: "pants",
  },
  { id: "cap_trainee", name: "Кепка новичка", slot: "head", rarity: "common", price: 40, requiredLevel: 1, healthBonus: 2, strengthBonus: 0, glyph: "cap" },
  { id: "beret_ink", name: "Берет", slot: "head", rarity: "common", price: 48, requiredLevel: 1, healthBonus: 1, strengthBonus: 1, glyph: "beret" },
  { id: "band_cloth", name: "Повязка", slot: "head", rarity: "common", price: 36, requiredLevel: 1, healthBonus: 3, strengthBonus: 0, glyph: "band" },
  { id: "veil_dusk", name: "Платок", slot: "head", rarity: "uncommon", price: 90, requiredLevel: 2, healthBonus: 4, strengthBonus: 1, glyph: "veil" },
  { id: "hood_focus", name: "Капюшон фокуса", slot: "head", rarity: "uncommon", price: 120, requiredLevel: 3, healthBonus: 4, strengthBonus: 2, glyph: "hood" },
  { id: "circlet_thin", name: "Тонкий обруч", slot: "head", rarity: "rare", price: 210, requiredLevel: 6, healthBonus: 6, strengthBonus: 3, glyph: "circlet" },
  { id: "crown_week", name: "Венец недели", slot: "head", rarity: "rare", price: 280, requiredLevel: 8, healthBonus: 8, strengthBonus: 4, glyph: "crown" },
  { id: "helm_watch", name: "Шлем дозора", slot: "head", rarity: "epic", price: 460, requiredLevel: 12, healthBonus: 10, strengthBonus: 6, glyph: "helm" },
  { id: "shirt_basic", name: "Футболка башни", slot: "torso", rarity: "common", price: 55, requiredLevel: 1, healthBonus: 3, strengthBonus: 1, glyph: "shirt" },
  { id: "jacket_road", name: "Дорожная куртка", slot: "torso", rarity: "common", price: 70, requiredLevel: 2, healthBonus: 4, strengthBonus: 2, glyph: "jacket" },
  { id: "vest_runner", name: "Жилет бегуна", slot: "torso", rarity: "uncommon", price: 150, requiredLevel: 4, healthBonus: 6, strengthBonus: 3, glyph: "vest" },
  { id: "cloak_fog", name: "Плащ тумана", slot: "torso", rarity: "uncommon", price: 180, requiredLevel: 5, healthBonus: 8, strengthBonus: 2, glyph: "cloak" },
  { id: "dress_evening", name: "Длинное платье", slot: "torso", rarity: "rare", price: 260, requiredLevel: 6, healthBonus: 9, strengthBonus: 2, glyph: "dress" },
  { id: "robe_quiet", name: "Тихая роба", slot: "torso", rarity: "rare", price: 300, requiredLevel: 9, healthBonus: 10, strengthBonus: 4, glyph: "robe" },
  { id: "armor_season", name: "Кираса 12 недель", slot: "torso", rarity: "epic", price: 520, requiredLevel: 15, healthBonus: 14, strengthBonus: 8, glyph: "armor" },
  { id: "pants_basic", name: "Штаны тренировки", slot: "legs", rarity: "common", price: 45, requiredLevel: 2, healthBonus: 2, strengthBonus: 2, glyph: "pants" },
  { id: "shorts_warm", name: "Шорты", slot: "legs", rarity: "common", price: 38, requiredLevel: 1, healthBonus: 1, strengthBonus: 2, glyph: "shorts" },
  { id: "skirt_hem", name: "Юбка", slot: "legs", rarity: "uncommon", price: 110, requiredLevel: 3, healthBonus: 4, strengthBonus: 1, glyph: "skirt" },
  { id: "sandals_dust", name: "Сандалии", slot: "legs", rarity: "common", price: 32, requiredLevel: 1, healthBonus: 2, strengthBonus: 1, glyph: "sandals" },
  { id: "boots_sprint", name: "Ботинки рывка", slot: "legs", rarity: "rare", price: 240, requiredLevel: 7, healthBonus: 5, strengthBonus: 6, glyph: "boots" },
  { id: "greaves_iron", name: "Поножи", slot: "legs", rarity: "epic", price: 420, requiredLevel: 13, healthBonus: 8, strengthBonus: 7, glyph: "greaves" },
  { id: "weapon_staff", name: "Посох тропы", slot: "weapon", rarity: "common", price: 55, requiredLevel: 1, healthBonus: 2, strengthBonus: 3, glyph: "staff" },
  { id: "weapon_dagger", name: "Кинжал", slot: "weapon", rarity: "common", price: 65, requiredLevel: 1, healthBonus: 0, strengthBonus: 4, glyph: "dagger" },
  { id: "weapon_sword", name: "Короткий меч", slot: "weapon", rarity: "uncommon", price: 130, requiredLevel: 3, healthBonus: 1, strengthBonus: 6, glyph: "sword" },
  { id: "weapon_bow", name: "Лук странника", slot: "weapon", rarity: "uncommon", price: 150, requiredLevel: 4, healthBonus: 2, strengthBonus: 5, glyph: "bow" },
  { id: "weapon_axe", name: "Топор лесника", slot: "weapon", rarity: "rare", price: 230, requiredLevel: 6, healthBonus: 2, strengthBonus: 8, glyph: "axe" },
  { id: "weapon_spear", name: "Копьё дозора", slot: "weapon", rarity: "rare", price: 250, requiredLevel: 7, healthBonus: 3, strengthBonus: 7, glyph: "spear" },
  { id: "weapon_mace", name: "Булава", slot: "weapon", rarity: "rare", price: 290, requiredLevel: 9, healthBonus: 4, strengthBonus: 9, glyph: "mace" },
  { id: "weapon_blade", name: "Клинок клятвы", slot: "weapon", rarity: "epic", price: 470, requiredLevel: 12, healthBonus: 4, strengthBonus: 12, glyph: "blade" },
  { id: "weapon_wand", name: "Жезл зари", slot: "weapon", rarity: "epic", price: 510, requiredLevel: 14, healthBonus: 10, strengthBonus: 7, glyph: "wand" },
  { id: "weapon_relic", name: "Клинок башни", slot: "weapon", rarity: "legendary", price: 840, requiredLevel: 18, healthBonus: 8, strengthBonus: 16, glyph: "relic" },
  { id: "charm_leaf", name: "Амулет листа", slot: "charm", rarity: "uncommon", price: 90, requiredLevel: 3, healthBonus: 5, strengthBonus: 1, glyph: "leaf" },
  { id: "charm_fang", name: "Клык", slot: "charm", rarity: "uncommon", price: 100, requiredLevel: 4, healthBonus: 2, strengthBonus: 4, glyph: "fang" },
  { id: "charm_moon", name: "Лунный знак", slot: "charm", rarity: "rare", price: 220, requiredLevel: 7, healthBonus: 7, strengthBonus: 3, glyph: "moon" },
  { id: "charm_ring", name: "Кольцо обещания", slot: "charm", rarity: "rare", price: 250, requiredLevel: 8, healthBonus: 4, strengthBonus: 6, glyph: "ring" },
  { id: "charm_flame", name: "Осколок пламени", slot: "charm", rarity: "rare", price: 310, requiredLevel: 10, healthBonus: 8, strengthBonus: 5, glyph: "flame" },
  { id: "charm_star", name: "Звезда цикла", slot: "charm", rarity: "legendary", price: 800, requiredLevel: 20, healthBonus: 12, strengthBonus: 12, glyph: "star" },
];

export function itemById(id: string): GameItem | undefined {
  return GAME_ITEMS.find((i) => i.id === id);
}

export const RACES: Record<
  RaceId,
  {
    name: string;
    description: string;
    healthMod: number;
    strengthMod: number;
    perk: string;
    aura: string;
  }
> = {
  human: {
    name: "Человек",
    description: "Пока без особого дара. Зато монеты капают чуть щедрее — на одежду хватит раньше.",
    healthMod: 0,
    strengthMod: 0,
    perk: "+5% монет",
    aura: "#34d399",
  },
  vampire: {
    name: "Вампир",
    description: "Пропуск ранит вдвое слабее, чем остальных.",
    healthMod: 2,
    strengthMod: 4,
    perk: "Пропуск ранит слабее",
    aura: "#fb7185",
  },
  witch: {
    name: "Ведьма",
    description: "Открытие дня лечит её сильнее.",
    healthMod: 8,
    strengthMod: 3,
    perk: "День лечит сильнее",
    aura: "#c4b5fd",
  },
  fairy: {
    name: "Фея",
    description: "Здоровье не опускается ниже четверти, даже после долгого пропуска.",
    healthMod: 12,
    strengthMod: 0,
    perk: "Здоровье не падает ниже четверти",
    aura: "#7dd3fc",
  },
  jedi: {
    name: "Джедай",
    description: "Собранность. Выполненный квест дня приносит больше опыта и монет.",
    healthMod: 4,
    strengthMod: 8,
    perk: "Квест дня щедрее",
    aura: "#67e8f9",
  },
  knight: {
    name: "Рыцарь",
    description: "Клятва недели. Закрытая неделя даёт больше монет, а надетая броня — больше силы.",
    healthMod: 6,
    strengthMod: 10,
    perk: "Неделя и экипировка сильнее",
    aura: "#fcd34d",
  },
  druid: {
    name: "Друид",
    description: "Каждая закрытая задача немного лечит. Снятая галочка забирает это обратно.",
    healthMod: 14,
    strengthMod: 2,
    perk: "Задача немного лечит",
    aura: "#86efac",
  },
};

const LEGACY_RACE: Record<string, RaceId> = {
  sylvian: "fairy",
  forgeborn: "knight",
  astral: "jedi",
};

export function normalizeRace(race: unknown): RaceId {
  if (typeof race === "string" && Object.prototype.hasOwnProperty.call(RACES, race)) {
    return race as RaceId;
  }
  if (typeof race === "string" && Object.prototype.hasOwnProperty.call(LEGACY_RACE, race)) {
    return LEGACY_RACE[race];
  }
  return "human";
}
