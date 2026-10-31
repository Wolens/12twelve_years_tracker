"use client";

import { HabitsPanel } from "@/components/habits/habits-panel";

export function HeroHabitsPanel() {
  return (
    <div data-tour="hero-habits" className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Календарные повторения — отдельно от целей. Отмечай на «Сегодня».
      </p>
      <HabitsPanel />
    </div>
  );
}
