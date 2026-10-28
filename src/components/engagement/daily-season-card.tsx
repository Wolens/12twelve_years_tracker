"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  canClaimDailyQuest,
  dailyQuestClaimedToday,
  dailyQuestProgress,
  ritualClaimedToday,
} from "@/lib/daily-engagement";

import { DailyQuestInfoPlaque } from "@/components/engagement/daily-quest-info";

/** Квест дня. Открытие этажа — только на «Пути». */
export function DailySeasonCard() {
  const profile = useAppStore((s) => s.profile);
  const claimDailyQuestBonus = useAppStore((s) => s.claimDailyQuestBonus);

  const ritualDone = ritualClaimedToday(profile);
  const quest = useMemo(() => dailyQuestProgress(profile.xpLedger), [profile.xpLedger]);
  const questClaimable = canClaimDailyQuest(profile, profile.xpLedger);
  const questDone = dailyQuestClaimedToday(profile);
  const questPct = (quest.done / quest.target) * 100;

  if (!ritualDone) {
    return (
      <p className="text-sm text-muted-foreground">
        Сначала{" "}
        <Link href="/path" scroll={false} className="font-medium text-primary underline-offset-2 hover:underline">
          открой этаж на башне
        </Link>
        .
      </p>
    );
  }

  if (questDone) return null;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${questPct}%, rgba(255,255,255,0.08) ${questPct}%)`,
        }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-[10px] font-bold">
          {quest.done}/{quest.target}
        </div>
      </div>
      <p className="min-w-0 flex-1 text-sm">Квест дня</p>
      <DailyQuestInfoPlaque />
      {questClaimable ? (
        <Button
          size="sm"
          onClick={() => {
            const amount = claimDailyQuestBonus();
            if (amount > 0) toast({ title: `+${amount} XP` });
          }}
        >
          Забрать
        </Button>
      ) : null}
    </div>
  );
}
