"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { formatLedgerTime, totalXpFromLedger } from "@/lib/xp-ledger";
import { cn } from "@/lib/utils";
import { ScrollText } from "lucide-react";

const VISIBLE_LIMIT = 40;

export function XpHistoryTrigger() {
  const profile = useAppStore((s) => s.profile);
  const ledger = [...(profile.xpLedger ?? [])].reverse();
  const shown = ledger.slice(0, VISIBLE_LIMIT);
  const hiddenCount = Math.max(0, ledger.length - VISIBLE_LIMIT);
  const count = ledger.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="История начисления опыта"
          title="История опыта"
        >
          <ScrollText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(85vh,32rem)] gap-0 overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>История опыта</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Всего по журналу: {totalXpFromLedger(profile.xpLedger ?? [])} XP
          {count > 0 && ` · записей: ${count}`}
        </p>
        <div className="mt-3 max-h-[min(60vh,22rem)] overflow-y-auto pr-1">
          {ledger.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пока нет начислений. XP — за задачи недели, закрытие недели и выполненные
              цели.
            </p>
          ) : (
            <ul className="space-y-2">
              {shown.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="leading-snug">{e.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatLedgerTime(e.at)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      e.amount >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {e.amount > 0 ? "+" : ""}
                    {e.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {hiddenCount > 0 && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Показаны последние {VISIBLE_LIMIT} из {count} записей
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
