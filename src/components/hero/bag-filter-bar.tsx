"use client";

import { Footprints, Gem, HardHat, Shirt, Swords } from "lucide-react";
import type { EquipSlot } from "@/types/rpg";
import { cn } from "@/lib/utils";

const SLOTS: { id: EquipSlot; title: string; color: string; Icon: typeof Shirt }[] = [
  { id: "head", title: "Голова", color: "#7dd3fc", Icon: HardHat },
  { id: "torso", title: "Тело", color: "#34d399", Icon: Shirt },
  { id: "legs", title: "Ноги", color: "#fbbf24", Icon: Footprints },
  { id: "weapon", title: "Оружие", color: "#fb7185", Icon: Swords },
  { id: "charm", title: "Амулеты", color: "#c4b5fd", Icon: Gem },
];

type Props = {
  hiddenSlots: EquipSlot[];
  onToggle: (slot: EquipSlot) => void;
  className?: string;
};

export function BagFilterBar({ hiddenSlots, onToggle, className }: Props) {
  return (
    <div
      className={cn("sticky top-3 flex w-11 shrink-0 flex-col items-center gap-1.5 self-start", className)}
      role="group"
      aria-label="Фильтр сумки"
    >
      {SLOTS.map(({ id, title, color, Icon }) => {
        const visible = !hiddenSlots.includes(id);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={visible}
            title={title}
            aria-label={`${visible ? "Скрыть" : "Вернуть"}: ${title}`}
            onClick={() => onToggle(id)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
              visible ? "border-transparent bg-white/[0.04]" : "border-dashed border-white/20 bg-transparent opacity-45"
            )}
            style={visible ? { boxShadow: `inset 0 0 0 1.5px ${color}` } : undefined}
          >
            <Icon className="h-4 w-4" style={{ color: visible ? color : "#a1a1aa" }} />
          </button>
        );
      })}
    </div>
  );
}
