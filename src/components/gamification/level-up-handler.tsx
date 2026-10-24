"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/components/ui/use-toast";
import { rankTitle } from "@/lib/gamification";

export function LevelUpHandler() {
  const levelUpEvent = useAppStore((s) => s.levelUpEvent);
  const clearLevelUpEvent = useAppStore((s) => s.clearLevelUpEvent);
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (!levelUpEvent) return;
    const key = `${levelUpEvent.from}-${levelUpEvent.to}`;
    if (fired.current === key) return;
    fired.current = key;

    toast({
      title: `Уровень ${levelUpEvent.to}!`,
      description: `Новое звание: ${rankTitle(levelUpEvent.to)}`,
    });

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#34d399", "#a78bfa", "#f472b6", "#fbbf24"],
    });

    const t = setTimeout(() => clearLevelUpEvent(), 500);
    return () => clearTimeout(t);
  }, [levelUpEvent, clearLevelUpEvent]);

  return null;
}
