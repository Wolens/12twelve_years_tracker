"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Repeat, Target, User } from "lucide-react";
import { HeroMasthead } from "@/components/hero/hero-masthead";
import { HeroPanel } from "@/components/hero/hero-tab-panels";
import { HeroGoalsPanel } from "@/components/hero/hero-goals-panel";
import { HeroHabitsPanel } from "@/components/hero/hero-habits-panel";
import { HeroShopDialog } from "@/components/hero/hero-shop-dialog";
import { cn } from "@/lib/utils";

type Tab = "hero" | "goals" | "habits";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "hero", label: "Герой", icon: User },
  { id: "goals", label: "Цели", icon: Target },
  { id: "habits", label: "Привычки", icon: Repeat },
];

function tabFromSearch(search: string): Tab | null {
  const t = new URLSearchParams(search).get("tab");
  if (t === "habits" || t === "shop") return "habits";
  if (t === "goals" || t === "hero") return t;
  return null;
}

export function HeroScreen() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("hero");
  const [shopOpen, setShopOpen] = useState(false);
  const [seen, setSeen] = useState<Record<Tab, boolean>>({
    hero: true,
    goals: false,
    habits: false,
  });

  const select = useCallback((next: Tab) => {
    setTab(next);
    setSeen((prev) => (prev[next] ? prev : { ...prev, [next]: true }));
  }, []);

  const openShop = useCallback(() => setShopOpen(true), []);

  useEffect(() => {
    const fromUrl = tabFromSearch(searchParams.toString());
    if (fromUrl) select(fromUrl);
  }, [searchParams, select]);

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      <HeroMasthead onOpenShop={openShop} />
      <HeroShopDialog open={shopOpen} onOpenChange={setShopOpen} />

      <div
        className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-secondary/70 p-1 shadow-inner dark:border-white/[0.06] dark:bg-black/25"
        role="tablist"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => select(id)}
            className={cn("game-tab", tab === id ? "game-tab-active" : "game-tab-idle")}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {seen.hero && (
        <div role="tabpanel" id="panel-hero" aria-labelledby="tab-hero" hidden={tab !== "hero"}>
          <HeroPanel onOpenShop={openShop} />
        </div>
      )}
      {seen.goals && (
        <div role="tabpanel" id="panel-goals" aria-labelledby="tab-goals" hidden={tab !== "goals"}>
          <HeroGoalsPanel />
        </div>
      )}
      {seen.habits && (
        <div
          role="tabpanel"
          id="panel-habits"
          aria-labelledby="tab-habits"
          hidden={tab !== "habits"}
        >
          <HeroHabitsPanel />
        </div>
      )}
    </div>
  );
}
