"use client";

import { memo, useId, useState, type ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";
import { itemById, RACES, RARITY_STYLES } from "@/lib/rpg/catalog";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import { spriteColorForItem } from "@/lib/rpg/item-sprite-colors";
import type { EquipSlot } from "@/types/rpg";
import { ItemBonuses } from "./item-bonuses";
import { ItemGlyph } from "./item-glyph";
import { GlyphShape } from "./item-glyph-shapes";
import { cn } from "@/lib/utils";

const SLOTS: { id: EquipSlot; title: string; place: string }[] = [
  { id: "head", title: "Голова", place: "left-[calc(50%-5.55rem)] top-[0.2rem]" },
  { id: "weapon", title: "Оружие", place: "left-[calc(50%-5.55rem)] top-[5.65rem]" },
  { id: "legs", title: "Ноги", place: "left-[calc(50%-5.55rem)] top-[9.85rem]" },
  { id: "torso", title: "Тело", place: "right-[calc(50%-5.55rem)] top-[2.85rem]" },
  { id: "charm", title: "Амулет", place: "right-[calc(50%-5.55rem)] top-[7.2rem]" },
];

const SHAPE: Record<EquipSlot, string> = {
  head: "M32 5 C47 5 57 16 57 31 C57 42 52 49 47 54 L43 73 L21 73 L17 54 C12 49 7 42 7 31 C7 16 17 5 32 5 Z",
  torso: "M18 14 C18 6 26 3 32 3 C38 3 46 6 46 14 L56 26 L51 74 L13 74 L8 26 Z",
  legs: "M18 14 H46 V26 H40 L38 68 H30 V40 H28 V68 H20 L18 26 Z",
  weapon: "M32 4 L37 16 L34 22 L34 50 L46 56 L32 70 L18 56 L30 50 L30 22 L27 16 Z",
  charm: "M32 4 L39 12 L36 18 C50 22 54 36 48 48 C42 62 32 76 32 76 C32 76 22 62 16 48 C10 36 14 22 28 18 L25 12 Z",
};

/** Icon placement inside each body-part slot (viewBox 64×80). */
const SLOT_ICON: Record<EquipSlot, { tx: number; ty: number; scale: number }> = {
  head: { tx: 16, ty: 18, scale: 1.45 },
  torso: { tx: 16, ty: 22, scale: 1.45 },
  legs: { tx: 14, ty: 22, scale: 1.35 },
  weapon: { tx: 15, ty: 14, scale: 1.5 },
  charm: { tx: 16, ty: 18, scale: 1.45 },
};

export const EquipSlots = memo(function EquipSlots({
  onOpenShop,
  children,
}: {
  onOpenShop?: () => void;
  children?: ReactNode;
}) {
  const raw = useAppStore((s) => s.character);
  const character = normalizeCharacter(raw);
  const equip = useAppStore((s) => s.equipGameItem);
  const unequip = useAppStore((s) => s.unequipGameItem);
  const race = useAppStore((s) => normalizeCharacter(s.character).race);
  const [open, setOpen] = useState<EquipSlot | null>(null);
  const clipPrefix = useId().replace(/:/g, "");

  const slot = SLOTS.find((s) => s.id === open);
  const owned = open
    ? character.inventory
        .map((id) => itemById(id))
        .filter((item) => item?.slot === open)
    : [];

  return (
    <div>
      <div className="relative h-[16.75rem] w-full overflow-visible">
        {children}
        {SLOTS.map((entry) => {
          const id = character.equipped[entry.id];
          const item = id ? itemById(id) : undefined;
          const selected = open === entry.id;
          const clipId = `${clipPrefix}-${entry.id}`;
          const iconBox = SLOT_ICON[entry.id];
          const itemFill = item ? spriteColorForItem(item.id, "#475569") : undefined;
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={selected}
              aria-label={item ? `${entry.title}: ${item.name}` : `${entry.title}, пусто`}
              onClick={() => setOpen((current) => (current === entry.id ? null : entry.id))}
              className={cn(
                "absolute z-20 h-[3.55rem] w-[3rem]",
                entry.place,
                item ? RARITY_STYLES[item.rarity].text : "text-muted-foreground/60 dark:text-white/45",
                selected && "text-primary"
              )}
            >
              <svg viewBox="0 0 64 80" className="h-full w-full overflow-visible" aria-hidden>
                <defs>
                  <clipPath id={clipId}>
                    <path d={SHAPE[entry.id]} />
                  </clipPath>
                </defs>
                <path
                  d={SHAPE[entry.id]}
                  fill={item ? itemFill : "rgba(0,0,0,0.2)"}
                  fillOpacity={item ? 0.92 : 1}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                  strokeDasharray={item ? undefined : "3.2 2.4"}
                />
                {item ? (
                  <g clipPath={`url(#${clipId})`} opacity="0.42">
                    <g transform={`translate(${iconBox.tx} ${iconBox.ty}) scale(${iconBox.scale})`}>
                      <GlyphShape glyph={item.glyph} itemId={item.id} accent="#ffffff" />
                    </g>
                  </g>
                ) : (
                  <text
                    x="32"
                    y="74"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize={7}
                    fontWeight={500}
                  >
                    {entry.title.toUpperCase()}
                  </text>
                )}
              </svg>
            </button>
          );
        })}
      </div>
      <p className="pointer-events-none -mt-0.5 text-center">
        <span className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-foreground shadow-sm dark:border-white/10 dark:bg-black/50 dark:text-white/90 dark:shadow-none dark:backdrop-blur-sm">
          {RACES[race].name}
        </span>
      </p>

      {slot && (
        <div className="mt-3 rounded-2xl border border-border bg-card/80 p-2 shadow-sm dark:border-white/10 dark:bg-black/20 dark:shadow-none">
          <div className="mb-1 flex items-center justify-between gap-2 px-1">
            <p className="text-[11px] font-medium">{slot.title}</p>
            {character.equipped[slot.id] && (
              <button
                type="button"
                className="text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={() => unequip(slot.id)}
              >
                Снять
              </button>
            )}
          </div>
          {owned.length === 0 ? (
            <button type="button" className="w-full px-2 py-2 text-left text-xs text-muted-foreground" onClick={onOpenShop}>
              В этом слоте пока пусто. Вещи лежат в магазине.
            </button>
          ) : (
            <div className="flex gap-2 overflow-x-auto">
              {owned.map((item) => {
                if (!item) return null;
                const worn = character.equipped[item.slot] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => (worn ? unequip(item.slot) : equip(item.id))}
                    className={cn(
                      "flex w-[6.5rem] shrink-0 flex-col items-center gap-1 rounded-xl border px-2 py-2 text-center",
                      worn ? "border-primary/50 bg-primary/10" : "border-border dark:border-white/10",
                      RARITY_STYLES[item.rarity].text
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-1">
                      <ItemGlyph itemId={item.id} glyph={item.glyph} className="h-7 w-7 shrink-0" />
                      <ItemBonuses health={item.healthBonus} strength={item.strengthBonus} compact />
                    </div>
                    <span className="line-clamp-2 w-full text-[10px] leading-tight text-foreground">{item.name}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {worn ? "Снять" : item.slot === "weapon" ? "Взять" : "Надеть"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
