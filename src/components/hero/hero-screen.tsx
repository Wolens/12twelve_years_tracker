"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, Target, User } from "lucide-react";
import { HeroMasthead } from "@/components/hero/hero-masthead";
import { HeroPanel, ShopPanel } from "@/components/hero/hero-tab-panels";
import { HeroGoalsPanel } from "@/components/hero/hero-goals-panel";
import { cn } from "@/lib/utils";

type Tab = "hero" | "goals" | "shop";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "hero", label: "Герой", icon: User },
  { id: "goals", label: "Цели", icon: Target },
  { id: "shop", label: "Магазин", icon: ShoppingBag },
];

function tabFromSearch(search: string): Tab | null {
  const t = new URLSearchParams(search).get("tab");
  if (t === "shop" || t === "goals" || t === "hero") return t;
  return null;
}

export function HeroScreen() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("hero");
  const [seen, setSeen] = useState<Record<Tab, boolean>>({
    hero: true,
    goals: false,
    shop: false,
  });

  const select = useCallback((next: Tab) => {
    setTab(next);
    setSeen((prev) => (prev[next] ? prev : { ...prev, [next]: true }));
  }, []);

  const openShop = useCallback(() => select("shop"), [select]);

  useEffect(() => {
    const fromUrl = tabFromSearch(searchParams.toString());
    if (fromUrl) select(fromUrl);
  }, [searchParams, select]);

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      <HeroMasthead onOpenShop={openShop} />

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
      {seen.shop && (
        <div role="tabpanel" id="panel-shop" aria-labelledby="tab-shop" hidden={tab !== "shop"}>
          <ShopPanel />
        </div>
      )}
    </div>
  );
}
