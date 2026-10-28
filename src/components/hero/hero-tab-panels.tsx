"use client";

import { memo, useRef, useState } from "react";
import { ChevronDown, Heart, Swords } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { xpProgressInLevel } from "@/lib/gamification";
import { GAME_ITEMS, RACES } from "@/lib/rpg/catalog";
import { canSelectRace, computeCharacterStats } from "@/lib/rpg/character-stats";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import { RacePicker } from "@/components/hero/race-picker";
import { chestTierLabel } from "@/lib/rpg/chest-roll";
import type { EquipSlot } from "@/types/rpg";
import { ItemCard } from "@/components/hero/item-card";
import { BagFilterBar } from "@/components/hero/bag-filter-bar";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const SLOTS: { id: EquipSlot; title: string }[] = [
  { id: "head", title: "Голова" },
  { id: "torso", title: "Тело" },
  { id: "legs", title: "Ноги" },
  { id: "weapon", title: "Оружие" },
  { id: "charm", title: "Амулеты" },
];

const CHEST_TONE: Record<string, string> = {
  mystery: "border-violet-400/40 bg-violet-400/10",
  rare: "border-sky-400/40 bg-sky-400/10",
  legendary: "border-amber-300/50 bg-amber-300/10",
};

export const HeroPanel = memo(function HeroPanel({ onOpenShop }: { onOpenShop: () => void }) {
  const raw = useAppStore((s) => s.character);
  const character = normalizeCharacter(raw);
  const level = useAppStore((s) => xpProgressInLevel(s.profile.xp).level);
  const vitality = useAppStore((s) => s.seasonFlame?.value ?? 100);
  const stats = computeCharacterStats(level, character, vitality);
  const hurt = stats.health < stats.maxHealth;
  const equipItem = useAppStore((s) => s.equipGameItem);
  const unequipItem = useAppStore((s) => s.unequipGameItem);
  const sellItem = useAppStore((s) => s.sellGameItem);
  const openChest = useAppStore((s) => s.openGameChest);
  const busy = useRef(new Set<string>());
  const [hiddenSlots, setHiddenSlots] = useState<EquipSlot[]>([]);

  const toggleSlot = (slot: EquipSlot) => {
    setHiddenSlots((prev) =>
      prev.includes(slot) ? prev.filter((id) => id !== slot) : [...prev, slot]
    );
  };

  const bagItems = character.inventory
    .map((id) => GAME_ITEMS.find((i) => i.id === id))
    .filter((item): item is NonNullable<typeof item> => !!item);
  const visibleBagItems = bagItems.filter((item) => !hiddenSlots.includes(item.slot));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="game-surface p-4">
          <Heart className="h-4 w-4 text-rose-600 dark:text-rose-300" />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Здоровье</p>
          <p className="font-display text-3xl font-bold text-rose-700 dark:text-rose-100">{stats.health}</p>
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
            {hurt ? `из ${stats.maxHealth} · пропуск дня снижает` : "Пропуск дня снижает"}
          </p>
        </div>
        <div className="game-surface p-4">
          <Swords className="h-4 w-4 text-sky-700 dark:text-sky-300" />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Сила</p>
          <p className="font-display text-3xl font-bold text-sky-900 dark:text-sky-100">{stats.strength}</p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {RACES[character.race].name} · {RACES[character.race].perk}
      </p>

      {canSelectRace(level) && <RacePicker />}

      {character.pendingChests.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Сундуки
          </p>
          {character.pendingChests.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left",
                CHEST_TONE[c.tier]
              )}
              onClick={() => {
                if (busy.current.has(c.id)) return;
                busy.current.add(c.id);
                const name = openChest(c.id);
                if (!name) {
                  busy.current.delete(c.id);
                  toast({ title: "Сундук пуст" });
                  return;
                }
                toast({ title: name, description: "Предмет уже в сумке" });
                void import("canvas-confetti").then(({ default: confetti }) => {
                  confetti({
                    particleCount: 70,
                    spread: 58,
                    origin: { y: 0.68 },
                    colors: ["#fbbf24", "#34d399", "#a78bfa", "#fde68a"],
                  });
                });
              }}
            >
              <span className="loot-chest" aria-hidden />
              <span>
                <span className="block text-sm font-medium">{chestTierLabel(c.tier)}</span>
                <span className="block text-[11px] text-muted-foreground">Нажми, чтобы открыть</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Сумка</p>
        {character.inventory.length === 0 ? (
          <button
            type="button"
            onClick={onOpenShop}
            className="w-full rounded-2xl border border-dashed border-white/15 px-4 py-6 text-center"
          >
            <p className="text-sm font-medium">Сумка пустая</p>
            <p className="mt-1 text-xs text-muted-foreground">В магазине есть с чего начать</p>
          </button>
        ) : (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {visibleBagItems.length === 0 ? (
                <p className="px-1 py-6 text-sm text-muted-foreground">
                  Слоты справа выключены. Нажми, чтобы вернуть вещи.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {visibleBagItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      owned
                      equipped={character.equipped[item.slot] === item.id}
                      onEquip={() => equipItem(item.id)}
                      onUnequip={() => unequipItem(item.slot)}
                      onSell={() => {
                        if (sellItem(item.id)) {
                          toast({
                            title: "Продано",
                            description: `${item.name} снова в магазине.`,
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <BagFilterBar hiddenSlots={hiddenSlots} onToggle={toggleSlot} />
          </div>
        )}
      </div>
    </div>
  );
});

export const ShopPanel = memo(function ShopPanel() {
  const raw = useAppStore((s) => s.character);
  const character = normalizeCharacter(raw);
  const level = useAppStore((s) => xpProgressInLevel(s.profile.xp).level);
  const buyItem = useAppStore((s) => s.buyGameItem);
  const [openSlots, setOpenSlots] = useState<Partial<Record<EquipSlot, boolean>>>({});

  return (
    <div className="space-y-2">
      {SLOTS.map((slot) => {
        const catalog = GAME_ITEMS.filter((item) => item.slot === slot.id && item.price > 0);
        const shopItems = catalog.filter((item) => !character.inventory.includes(item.id));
        const ownedCount = catalog.length - shopItems.length;
        const isOpen = !!openSlots[slot.id];
        return (
          <div
            key={slot.id}
            className={cn("rounded-2xl border border-white/10 bg-black/20", isOpen && "bg-black/30")}
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpenSlots((prev) => ({ ...prev, [slot.id]: !prev[slot.id] }))}
            >
              <h2 className="min-w-0 flex-1 text-sm font-medium">{slot.title}</h2>
              <span className="text-[11px] text-muted-foreground">
                {shopItems.length} в продаже · у тебя {ownedCount}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <div className="grid grid-cols-2 gap-2 px-2 pb-3 md:grid-cols-3">
                {shopItems.length === 0 ? (
                  <p className="col-span-full px-2 py-4 text-center text-xs text-muted-foreground">
                    Все вещи этого слота у тебя в сумке. Продай лишнее — снова появятся здесь.
                  </p>
                ) : (
                  shopItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      canAfford={character.coins >= item.price && level >= item.requiredLevel}
                      playerLevel={level}
                      onBuy={() => {
                        if (!buyItem(item.id)) toast({ title: "Не хватает монет или уровня" });
                        else toast({ title: "Куплено", description: item.name });
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
