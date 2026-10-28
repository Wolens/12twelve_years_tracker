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
import {
  DEFAULT_EXTRA_SPHERE_ICON,
  EXTRA_SPHERE_ICONS,
  EXTRA_SPHERE_ICON_LABELS,
  EXTRA_SPHERE_ICON_KEYS,
  isExtraSphereIcon,
  LEGACY_EMOJI_TO_EXTRA,
} from "./sphere-extra-icons";

/** Ключи готовых иконок сфер (Lucide). */
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

/** Готовые направления без «Своё». */
export const PRESET_SPHERE_ICON_KEYS = SPHERE_ICON_KEYS.filter(
  (k): k is Exclude<SphereIconKey, "custom"> => k !== "custom"
);

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

const EMOJI_TO_PRESET: Record<string, Exclude<SphereIconKey, "custom">> = {
  "💪": "health",
  "🧠": "mind",
  "💼": "career",
  "💰": "finance",
  "🎨": "creative",
  "📚": "learn",
  "❤️": "relations",
  "🌱": "growth",
};

export function isPresetSphereIcon(icon: string): icon is Exclude<SphereIconKey, "custom"> {
  return icon in SPHERE_ICONS && icon !== "custom";
}

export function normalizeSphereIcon(icon: string): SphereIconKey {
  if (isPresetSphereIcon(icon)) return icon;
  if (isExtraSphereIcon(icon)) return "custom";
  const fromEmoji = EMOJI_TO_PRESET[icon];
  if (fromEmoji) return fromEmoji;
  return "custom";
}

export function resolveLucideSphereIcon(icon: string): LucideIcon {
  if (icon === "restored") return Recycle;
  if (isPresetSphereIcon(icon)) return SPHERE_ICONS[icon];
  if (isExtraSphereIcon(icon)) return EXTRA_SPHERE_ICONS[icon];
  if (icon === "custom") return SPHERE_ICONS.custom;
  const legacyExtra = LEGACY_EMOJI_TO_EXTRA[icon];
  if (legacyExtra === "restored") return Recycle;
  if (legacyExtra && isExtraSphereIcon(legacyExtra)) return EXTRA_SPHERE_ICONS[legacyExtra];
  return SPHERE_ICONS.custom;
}

/** Ключ для «своих» сфер (Lucide), не unicode. */
export function resolveExtraSphereIconKey(icon: string): string {
  if (icon === "restored") return icon;
  if (isExtraSphereIcon(icon)) return icon;
  if (icon === "custom") return DEFAULT_EXTRA_SPHERE_ICON;
  if (LEGACY_EMOJI_TO_EXTRA[icon]) {
    const mapped = LEGACY_EMOJI_TO_EXTRA[icon];
    if (mapped === "restored") return mapped;
    return mapped;
  }
  if (isPresetSphereIcon(icon)) return DEFAULT_EXTRA_SPHERE_ICON;
  return DEFAULT_EXTRA_SPHERE_ICON;
}

export type SphereIconDisplay =
  | { kind: "preset"; key: Exclude<SphereIconKey, "custom"> }
  | { kind: "extra"; key: string }
  | { kind: "restored" };

export function resolveSphereIconDisplay(icon: string): SphereIconDisplay {
  if (icon === "restored") return { kind: "restored" };
  if (isPresetSphereIcon(icon)) return { kind: "preset", key: icon };
  if (isExtraSphereIcon(icon)) return { kind: "extra", key: icon };
  const legacy = LEGACY_EMOJI_TO_EXTRA[icon];
  if (legacy === "restored") return { kind: "restored" };
  if (legacy && isExtraSphereIcon(legacy)) return { kind: "extra", key: legacy };
  if (icon === "custom") return { kind: "extra", key: DEFAULT_EXTRA_SPHERE_ICON };
  return { kind: "extra", key: DEFAULT_EXTRA_SPHERE_ICON };
}

export function resolveSphereIcon(icon: string): LucideIcon {
  return resolveLucideSphereIcon(icon);
}

export function preserveSphereIcon(icon: string): string {
  if (icon === "restored") return icon;
  if (isPresetSphereIcon(icon)) return icon;
  if (isExtraSphereIcon(icon)) return icon;
  const presetEmoji = EMOJI_TO_PRESET[icon];
  if (presetEmoji) return presetEmoji;
  const extraEmoji = LEGACY_EMOJI_TO_EXTRA[icon];
  if (extraEmoji) return extraEmoji;
  if (icon === "custom") return DEFAULT_EXTRA_SPHERE_ICON;
  return DEFAULT_EXTRA_SPHERE_ICON;
}

export {
  EXTRA_SPHERE_ICON_DEFS,
  EXTRA_SPHERE_ICON_KEYS,
  EXTRA_SPHERE_ICON_LABELS,
  DEFAULT_EXTRA_SPHERE_ICON,
  isExtraSphereIcon,
} from "./sphere-extra-icons";

/** @deprecated используйте resolveExtraSphereIconKey */
export function resolveCustomSphereEmoji(icon: string): string {
  return resolveExtraSphereIconKey(icon);
}

export { DEFAULT_EXTRA_SPHERE_ICON as DEFAULT_CUSTOM_SPHERE_EMOJI };
