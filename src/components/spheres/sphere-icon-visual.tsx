"use client";

import { cn } from "@/lib/utils";
import {
  isStoredSphereEmoji,
  resolveLucideSphereIcon,
} from "@/lib/sphere-icons";

type Props = {
  icon: string;
  color: string;
  px: number;
  stroke?: number;
  className?: string;
};

/** Lucide-ключ или сохранённый unicode-emoji. */
export function SphereIconVisual({
  icon,
  color,
  px,
  stroke = 2,
  className,
}: Props) {
  if (isStoredSphereEmoji(icon)) {
    return (
      <span
        className={cn("inline-block shrink-0 select-none leading-none", className)}
        style={{ fontSize: Math.round(px * 1.15), color }}
        aria-hidden
      >
        {icon}
      </span>
    );
  }

  const Lucide = resolveLucideSphereIcon(icon);
  return (
    <Lucide
      className={cn("shrink-0", className)}
      size={px}
      strokeWidth={stroke}
      style={{ color }}
      aria-hidden
    />
  );
}
