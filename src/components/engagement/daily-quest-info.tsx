"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DAILY_QUEST_TASKS, XP_DAILY_QUEST_BONUS } from "@/lib/constants";
import { COINS_PER_DAILY_QUEST } from "@/lib/rpg/coins";

export function DailyQuestInfoPlaque() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        aria-label="Что такое квест дня"
      >
        <Info className="h-3 w-3" aria-hidden />
        <span>?</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm border-white/10">
          <DialogHeader>
            <DialogTitle>Квест дня</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Это бонус за активный день: после того как ты{" "}
                  <strong className="font-medium text-foreground">открыл этаж на башне</strong>, нужно
                  выполнить{" "}
                  <strong className="font-medium text-foreground">
                    {DAILY_QUEST_TASKS} задачи недели
                  </strong>{" "}
                  (галочки в «Сегодня» или где отмечаешь задачи цикла).
                </p>
                <p>
                  Когда счётчик дойдёт до {DAILY_QUEST_TASKS}/{DAILY_QUEST_TASKS}, нажми{" "}
                  <strong className="font-medium text-foreground">«Забрать»</strong>: +{XP_DAILY_QUEST_BONUS}{" "}
                  опыта и +{COINS_PER_DAILY_QUEST} монет (один раз в день).
                </p>
                <p className="text-xs">
                  Разовые цели и открытие этажа в квест не идут — только выполненные задачи недели.
                </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
