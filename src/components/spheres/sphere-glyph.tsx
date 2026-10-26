"use client";

import { cn } from "@/lib/utils";
import { resolveSphereIcon } from "@/lib/sphere-icons";

type Size = "xs" | "sm" | "md" | "lg";

const BOX: Record<Size, string> = {
  xs: "h-5 w-5 rounded-md",
  sm: "h-7 w-7 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-2xl",
};

const STROKE: Record<Size, number> = {
  xs: 1.75,
  sm: 2,
  md: 2,
  lg: 2.25,
};

const ICON_PX: Record<Size, number> = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 22,
};

type Props = {
  icon: string;
  color: string;
  size?: Size;
  className?: string;
  /** Без подложки — только контур иконки */
  plain?: boolean;
};

export function SphereGlyph({
  icon,
  color,
  size = "md",
  className,
  plain = false,
}: Props) {
  const Lucide = resolveSphereIcon(icon);
  const px = ICON_PX[size];

  if (plain) {
    return (
      <Lucide
        className={cn("shrink-0", className)}
        size={px}
        strokeWidth={STROKE[size]}
        style={{ color }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        BOX[size],
        className
      )}
      style={{
        backgroundColor: `${color}1f`,
        color,
        boxShadow: `inset 0 0 0 1px ${color}33`,
      }}
      aria-hidden
    >
      <Lucide size={px} strokeWidth={STROKE[size]} />
    </span>
  );
}
