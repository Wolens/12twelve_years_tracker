"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { CoinDisc } from "@/components/hero/coin-badge";

export type TaskRewardFlashPayload = {
  title: string;
  xp: number;
  coins: number;
};

export function TaskRewardFlash({
  payload,
  onDismiss,
}: {
  payload: TaskRewardFlashPayload | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!payload) return;
    const t = window.setTimeout(onDismiss, 2600);
    return () => window.clearTimeout(t);
  }, [payload, onDismiss]);

  if (!payload) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[max(1.5rem,env(safe-area-inset-top))]"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "quest-reward-panel w-full max-w-xs animate-in fade-in zoom-in-95 duration-300",
          "rounded-xl border border-primary/45 bg-card px-5 py-4 text-center shadow-[0_8px_32px_rgba(16,185,129,0.18)] backdrop-blur-md dark:bg-[#061510]/95 dark:shadow-[0_0_40px_rgba(52,211,153,0.25)]"
        )}
      >
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">
          [ задача выполнена ]
        </p>
        <p className="mt-3 font-display text-2xl font-bold text-primary">+{payload.xp} XP</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-1 text-amber-200/95">
            <CoinDisc className="coin-disc-sm" />
            +{payload.coins}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-[11px] text-muted-foreground">{payload.title}</p>
      </div>
    </div>
  );
}
