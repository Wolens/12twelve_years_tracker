"use client";

import { cn } from "@/lib/utils";
import { SphereIconVisual } from "./sphere-icon-visual";

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
  plain?: boolean;
};

export function SphereGlyph({
  icon,
  color,
  size = "md",
  className,
  plain = false,
}: Props) {
  const px = ICON_PX[size];
  const stroke = STROKE[size];

  if (plain) {
    return (
      <SphereIconVisual
        icon={icon}
        color={color}
        px={px}
        stroke={stroke}
        className={className}
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
      <SphereIconVisual icon={icon} color={color} px={px} stroke={stroke} />
    </span>
  );
}
