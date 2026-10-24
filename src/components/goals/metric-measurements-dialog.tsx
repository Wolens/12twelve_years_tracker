"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Goal } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { History, Trash2 } from "lucide-react";

function formatDate(iso: string): string {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function MetricMeasurementsDialog({ goal }: { goal: Goal }) {
  const deleteMetricMeasurement = useAppStore((s) => s.deleteMetricMeasurement);
  const measurements = goal.measurements ?? [];
  const count = measurements.length;

  if (goal.type !== "metric" || count === 0) return null;

  const reversed = measurements
    .map((m, i) => ({ m, i }))
    .reverse();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="gap-1">
          <History className="h-3.5 w-3.5" />
          Журнал ({count})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Замеры: {goal.title}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Удаление записи пересчитает «сейчас» по последнему оставшемуся замеру (или по
          старту, если журнал пуст).
        </p>
        <ul className="space-y-2">
          {reversed.map(({ m, i }) => {
            const key = m.id ?? `idx:${i}`;
            return (
              <li
                key={key}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {m.value} {goal.unit ?? ""}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatDate(m.date)}
                  </span>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                  aria-label="Удалить замер"
                  onClick={() => deleteMetricMeasurement(goal.id, key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
