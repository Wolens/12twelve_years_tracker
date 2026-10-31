"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { weekTasksAllDone } from "@/lib/week-completion";
import { toast } from "@/components/ui/use-toast";

export function WeekControls() {
  const activeWeek = useAppStore((s) => s.activeWeek);
  const cycleTasks = useAppStore((s) => s.cycleTasks);
  const weeks = useAppStore((s) => s.weeks);
  const completeActiveWeekAndAdvance = useAppStore(
    (s) => s.completeActiveWeekAndAdvance
  );
  const revertActiveWeekAdvance = useAppStore((s) => s.revertActiveWeekAdvance);
  const setActiveWeek = useAppStore((s) => s.setActiveWeek);

  const weekData = weeks.find((w) => w.number === activeWeek);
  const allDone = weekTasksAllDone(cycleTasks, activeWeek);
  const canClose = weekData && !weekData.bonusAwarded && !weekData.closed;

  const finishWeek = () => {
    if (activeWeek >= 12) return;

    if (allDone) {
      const ok = confirm(
        `Закрыть неделю ${activeWeek}? Получишь +50 XP и перейдёшь к неделе ${activeWeek + 1}.`
      );
      if (!ok) return;
      completeActiveWeekAndAdvance(false);
      return;
    }

    const ok = confirm(
      `Не все задачи недели ${activeWeek} выполнены — бонус +50 XP за закрытие не начислится.\n\nВсё равно завершить неделю в жизни и перейти к ${activeWeek + 1}?`
    );
    if (!ok) return;
    completeActiveWeekAndAdvance(true);
    toast({
      title: "Неделя закрыта без бонуса",
      description: "XP за закрытие не начислен — не все задачи были выполнены.",
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 pt-4">
        <p className="text-sm">
          Рабочая неделя: <strong>{activeWeek}</strong> из 12
        </p>
        <p className="text-xs text-muted-foreground">
          Закройте неделю и перейдите дальше, если уже завершили её в жизни (например,
          начать 2-ю неделю с 1-го дня). Неделя в приложении также сдвигается по датам
          старта цикла.
        </p>
        {canClose && (
          <div className="rounded-xl border border-white/10 bg-background/40 p-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              {allDone
                ? "Все задачи на эту неделю выполнены — можно закрыть с бонусом XP."
                : "Есть невыполненные задачи — неделю можно закрыть, но без бонуса XP."}
            </p>
            <Button size="sm" className="w-full" onClick={finishWeek}>
              {allDone ? "Закрыть неделю (+50 XP)" : "Закрыть неделю без бонуса XP"}
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
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
