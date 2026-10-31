"use client";

import { memo, useEffect, useState } from "react";
import { Swords, ShoppingBag, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { rankTitle, xpProgressInLevel } from "@/lib/gamification";
import { LEVEL_MILESTONES } from "@/lib/rpg/level-roadmap";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import { CharacterFlat } from "./character-flat";
import { EquipSlots } from "./equip-slots";
import { CoinBadge } from "./coin-badge";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export const HeroMasthead = memo(function HeroMasthead({ onOpenShop }: { onOpenShop: () => void }) {
  const xp = useAppStore((s) => s.profile.xp);
  const name = useAppStore((s) => s.profile.name);
  const coins = useAppStore((s) => normalizeCharacter(s.character).coins);
  const progress = xpProgressInLevel(xp);
  const title = name.trim() || "Герой";
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const upcoming =
    progress.level < 10
      ? LEVEL_MILESTONES.filter((m) => m.level > progress.level && m.level <= 10)
      : LEVEL_MILESTONES.filter((m) => m.level > progress.level).slice(0, 4);

  useEffect(() => {
    if (!rewardsOpen) return;
    const close = () => setRewardsOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [rewardsOpen]);

  const openBattlesTeaser = () => {
    toast({
      title: "Битвы",
      description: "Режим сражений скоро появится — готовь экипировку и следи за обновлениями.",
    });
  };

  const openFriendsTeaser = () => {
    toast({
      title: "Друзья",
      description: "Список друзей и совместный прогресс скоро появятся — следи за обновлениями.",
    });
  };

  return (
    <div className="space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div className="relative min-w-0">
          <h1 className="truncate font-display text-2xl font-bold tracking-tight">{title}</h1>
          <button
            type="button"
            className="mt-0.5 text-left"
            aria-expanded={rewardsOpen}
            aria-label="Что ждёт на следующих уровнях"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setRewardsOpen((open) => !open)}
          >
            <p className="text-sm text-muted-foreground">
              Уровень {progress.level} · {rankTitle(progress.level)}
            </p>
            <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-secondary dark:bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
            </div>
          </button>
          {rewardsOpen && upcoming.length > 0 && (
            <div
              className="absolute left-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-3 shadow-xl dark:border-white/10 dark:bg-zinc-950/95 dark:shadow-2xl dark:backdrop-blur"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="relative flex justify-between gap-1">
                <span className="absolute left-4 right-4 top-4 h-px bg-border dark:bg-white/15" />
                {upcoming.map((milestone) => (
                  <div key={milestone.level} className="relative flex w-14 flex-col items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border font-display text-xs",
                        milestone.unlock === "race"
                          ? "border-amber-200/80 bg-amber-300/15 text-amber-100"
                          : "border-border bg-secondary dark:border-white/20 dark:bg-black/50"
                      )}
                    >
                      {milestone.level}
                    </span>
                    <span className="mt-1 text-center text-[10px] leading-tight">{milestone.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <CoinBadge amount={coins} onClick={onOpenShop} />
          <button
            type="button"
            onClick={openFriendsTeaser}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
              "border-sky-500/30 bg-card/90 text-sky-700 shadow-sm",
              "hover:border-sky-500/45 hover:bg-sky-500/10",
              "dark:border-sky-400/25 dark:bg-background/80 dark:text-sky-300"
            )}
            aria-label="Друзья — скоро будет доступно"
          >
            <Users className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            onClick={openBattlesTeaser}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
              "border-rose-500/30 bg-card/90 text-rose-600 shadow-sm",
              "hover:border-rose-500/45 hover:bg-rose-500/10",
              "dark:border-rose-400/25 dark:bg-background/80 dark:text-rose-300"
            )}
            aria-label="Битвы — скоро будет доступно"
          >
            <Swords className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onOpenShop}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
              "border-amber-500/35 bg-card/90 text-amber-700 shadow-sm",
              "hover:border-amber-500/50 hover:bg-amber-500/10",
              "dark:border-amber-400/30 dark:bg-background/80 dark:text-amber-200"
            )}
            aria-label="Магазин"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </header>

      <EquipSlots onOpenShop={onOpenShop}>
        <div
          className="pointer-events-none absolute inset-x-[16%] bottom-6 top-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 50% at 50% 82%, rgba(52,211,153,0.16), transparent 72%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 overflow-visible">
          <div className="mx-auto h-full w-[13rem]">
            <CharacterFlat />
          </div>
        </div>
      </EquipSlots>
    </div>
  );
});
