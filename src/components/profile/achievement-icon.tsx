import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Box,
  CalendarCheck2,
  Coins,
  Compass,
  Flag,
  Hexagon,
  Layers3,
  ListTodo,
  Milestone,
  Mountain,
  Radar,
  Shield,
  Sunrise,
  VenetianMask,
  Zap,
} from "lucide-react";
import type { AchievementId } from "@/types";
import { ACHIEVEMENTS_META, type AchievementIconName } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<AchievementIconName, LucideIcon> = {
  sunrise: Sunrise,
  "calendar-check": CalendarCheck2,
  "list-todo": ListTodo,
  milestone: Milestone,
  layers: Layers3,
  flag: Flag,
  radar: Radar,
  coins: Coins,
  "package-open": Box,
  mask: VenetianMask,
  zap: Zap,
  shield: Shield,
  "book-open": BookOpen,
  compass: Compass,
  hexagon: Hexagon,
  mountain: Mountain,
};

export function AchievementIcon({
  id,
  className,
  unlocked = true,
}: {
  id: AchievementId;
  className?: string;
  unlocked?: boolean;
}) {
  const meta = ACHIEVEMENTS_META[id];
  if (!meta) return null;
  const Icon = ICONS[meta.icon];
  return (
    <Icon
      className={cn(
        "mx-auto h-7 w-7",
        unlocked ? "text-emerald-400/90" : "text-muted-foreground",
        className
      )}
      strokeWidth={1.65}
      aria-hidden
    />
  );
}
