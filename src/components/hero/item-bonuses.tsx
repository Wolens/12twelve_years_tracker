import { Heart, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

export function ItemBonuses({
  health,
  strength,
  className,
  compact,
}: {
  health: number;
  strength: number;
  className?: string;
  compact?: boolean;
}) {
  if (health <= 0 && strength <= 0) return null;
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {health > 0 && (
        <span className={cn("flex items-center gap-0.5 tabular-nums text-rose-700 dark:text-rose-200", compact ? "text-[9px]" : "text-[10px]")}>
          <Heart className={cn("shrink-0", compact ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden />
          +{health}
        </span>
      )}
      {strength > 0 && (
        <span className={cn("flex items-center gap-0.5 tabular-nums text-sky-800 dark:text-sky-200", compact ? "text-[9px]" : "text-[10px]")}>
          <Swords className={cn("shrink-0", compact ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden />
          +{strength}
        </span>
      )}
    </div>
  );
}
