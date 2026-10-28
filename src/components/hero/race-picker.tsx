"use client";

import { memo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { xpProgressInLevel } from "@/lib/gamification";
import { RACES } from "@/lib/rpg/catalog";
import { canSelectRace } from "@/lib/rpg/character-stats";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import type { RaceId } from "@/types/rpg";
import { cn } from "@/lib/utils";

export const RacePicker = memo(function RacePicker() {
  const level = useAppStore((s) => xpProgressInLevel(s.profile.xp).level);
  const race = useAppStore((s) => normalizeCharacter(s.character).race);
  const setRace = useAppStore((s) => s.setCharacterRace);
  const open = canSelectRace(level);

  if (!open) {
    return (
      <p className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">
        На 10-м уровне можно выбрать облик.
      </p>
    );
  }

  return (
    <section className="space-y-2" aria-label="Выбор облика">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Облик</h2>
        <p className="text-[11px] text-muted-foreground">Можно сменить снова</p>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x">
        {(Object.keys(RACES) as RaceId[]).map((id) => {
          const selected = race === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setRace(id)}
              aria-pressed={selected}
              className={cn(
                "w-[9.25rem] shrink-0 snap-start rounded-2xl border p-3 text-left transition-colors",
                selected ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/[0.04]"
              )}
            >
              <span
                className="mb-2 block h-8 w-8 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #fff, ${RACES[id].aura})`,
                }}
              />
              <span className="block text-sm font-semibold">{RACES[id].name}</span>
              <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                {RACES[id].perk}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-sm leading-snug text-muted-foreground">{RACES[race].description}</p>
    </section>
  );
});
