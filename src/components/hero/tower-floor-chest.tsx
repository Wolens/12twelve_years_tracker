"use client";

import { isWeekStartFloor } from "@/lib/rpg/floor-chest";
import type { DayState } from "@/lib/rpg/tower";
import { cn } from "@/lib/utils";
import { DungeonChestGraphic } from "./dungeon-chest-graphic";

export function TowerFloorChest({
  floorDay,
  todayDay,
  floorState,
  claimed,
  locked,
  onOpen,
}: {
  floorDay: number;
  todayDay: number | null;
  floorState: DayState;
  claimed: boolean;
  locked: boolean;
  onOpen: () => void;
}) {
  if (!isWeekStartFloor(floorDay)) return null;

  const reachable = todayDay !== null && floorDay <= todayDay && !locked;
  const entered = floorState === "done" || floorState === "visited" || floorState === "today";
  const missed = floorState === "missed" && !claimed;
  const canOpen = reachable && !claimed && entered;
  const variant = claimed ? "open" : missed ? "missed" : canOpen ? "ready" : "closed";

  return (
    <button
      type="button"
      aria-label={
        claimed
          ? `Сундук недели на этаже ${floorDay} уже открыт`
          : canOpen
            ? `Открыть сундук недели на этаже ${floorDay}`
            : missed
              ? `Сундук на этаже ${floorDay} пропущен`
              : `Сундук недели на этаже ${floorDay}`
      }
      disabled={!canOpen}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (canOpen) onOpen();
      }}
      className={cn(
        "absolute bottom-[1.2rem] left-[59.5%] z-[25] h-12 w-[3.6rem] -translate-x-1/2 transition-transform",
        canOpen && "tower-chest-ready hover:scale-105 active:scale-95",
        locked && "opacity-45 saturate-50",
        missed && "opacity-90",
        claimed && "opacity-95"
      )}
    >
      <DungeonChestGraphic variant={variant} />
    </button>
  );
}
