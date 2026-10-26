import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Brain,
  Briefcase,
  Heart,
  Palette,
  PiggyBank,
  Recycle,
  Sparkles,
  Sprout,
} from "lucide-react";

/** Ключи иконок сфер (хранятся в `sphere.icon`, не эмодзи). */
export const SPHERE_ICON_KEYS = [
  "health",
  "mind",
  "career",
  "finance",
  "creative",
  "learn",
  "relations",
  "growth",
  "custom",
] as const;

export type SphereIconKey = (typeof SPHERE_ICON_KEYS)[number];

export const SPHERE_ICONS: Record<SphereIconKey, LucideIcon> = {
  health: Activity,
  mind: Brain,
  career: Briefcase,
  finance: PiggyBank,
  creative: Palette,
  learn: BookOpen,
  relations: Heart,
  growth: Sprout,
  custom: Sparkles,
};

export const SPHERE_ICON_LABELS: Record<SphereIconKey, string> = {
  health: "Тело",
  mind: "Разум",
  career: "Работа",
  finance: "Деньги",
  creative: "Творчество",
  learn: "Учёба",
  relations: "Люди",
  growth: "Рост",
  custom: "Своё",
};

const EMOJI_TO_KEY: Record<string, SphereIconKey> = {
  "💪": "health",
  "🧠": "mind",
  "💼": "career",
  "💰": "finance",
  "🎨": "creative",
  "📚": "learn",
  "❤️": "relations",
  "🌱": "growth",
  "⭐": "custom",
  "♻️": "custom",
};

export function normalizeSphereIcon(icon: string): SphereIconKey {
  if (icon in SPHERE_ICONS) return icon as SphereIconKey;
  const fromEmoji = EMOJI_TO_KEY[icon];
  if (fromEmoji) return fromEmoji;
  return "custom";
}

export function resolveSphereIcon(icon: string): LucideIcon {
  const key = normalizeSphereIcon(icon);
  if (key === "custom" && icon === "restored") {
    return Recycle;
  }
  return SPHERE_ICONS[key];
}
