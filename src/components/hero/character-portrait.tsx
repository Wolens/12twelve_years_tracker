"use client";

import { memo } from "react";
import { CharacterFlat } from "./character-flat";
import { cn } from "@/lib/utils";

/** Круглый портрет героя (лицо) для профиля и настроек. */
export const CharacterPortrait = memo(function CharacterPortrait({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-28 w-28" : "h-14 w-14";
  const scale = size === "sm" ? "scale-[1.35]" : size === "lg" ? "scale-[1.2]" : "scale-[1.3]";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-border bg-secondary shadow-inner dark:border-white/15 dark:bg-[#0c1016]/90",
        box,
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 flex items-start justify-center pt-[6%]",
          scale
        )}
      >
        <div className="h-[165%] w-[165%] max-w-none">
          <CharacterFlat />
        </div>
      </div>
    </div>
  );
});
