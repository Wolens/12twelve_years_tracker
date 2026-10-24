"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WeekControls() {
  const activeWeek = useAppStore((s) => s.activeWeek);
  const completeActiveWeekAndAdvance = useAppStore(
    (s) => s.completeActiveWeekAndAdvance
  );
  const revertActiveWeekAdvance = useAppStore((s) => s.revertActiveWeekAdvance);
  const setActiveWeek = useAppStore((s) => s.setActiveWeek);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 pt-4">
        <p className="text-sm">
          Рабочая неделя: <strong>{activeWeek}</strong> из 12
        </p>
        <p className="text-xs text-muted-foreground">
          Закройте неделю и перейдите дальше, если уже завершили её в жизни (например,
          начать 2-ю неделю с 1-го дня).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (
                confirm(
                  `Завершить неделю ${activeWeek} (+50 XP) и перейти к неделе ${Math.min(12, activeWeek + 1)}?`
                )
              ) {
                completeActiveWeekAndAdvance();
              }
            }}
            disabled={activeWeek >= 12}
          >
            Завершить и следующая неделя
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => revertActiveWeekAdvance()}
            disabled={activeWeek <= 1}
          >
            Откатить переход
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              size="sm"
              variant={n === activeWeek ? "default" : "ghost"}
              className="h-8 w-8 p-0"
              onClick={() => setActiveWeek(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
