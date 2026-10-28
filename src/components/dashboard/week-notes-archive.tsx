"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { listWeekNoteArchive } from "@/lib/week-reflection-archive";
import { cn } from "@/lib/utils";
import { ChevronDown, BookOpen } from "lucide-react";

type Props = {
  onOpenWeek?: (week: number) => void;
};

export function WeekNotesArchive({ onOpenWeek }: Props) {
  const weeks = useAppStore((s) => s.weeks);
  const [open, setOpen] = useState(false);

  const entries = useMemo(() => listWeekNoteArchive(weeks), [weeks]);

  return (
    <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-card/30">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm"
      >
        <BookOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0 flex-1 font-medium">Архив заметок</span>
        <span className="shrink-0 text-xs text-muted-foreground">{entries.length}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-2 border-t border-white/10 px-4 pb-4 pt-2">
            {entries.length === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">
                Пока пусто. «Короткая заметка» в дневнике недели сохраняется здесь автоматически.
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.week}
                  className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => onOpenWeek?.(entry.week)}
                    >
                      Неделя {entry.week}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {entry.closed ? "закрыта" : "в процессе"}
                      {entry.rating != null && ` · ${entry.rating}/10`}
                    </span>
                  </div>
                  {entry.note ? (
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{entry.note}</p>
                  ) : (
                    <p className="mt-2 text-xs italic text-muted-foreground">Без текста</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
