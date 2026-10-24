"use client";

import { useAppStore } from "@/store/useAppStore";
import { counterProgress, metricProgressPercent, isGoalComplete } from "@/lib/goals";
import { Button } from "@/components/ui/button";

export default function PrintReportPage() {
  const goals = useAppStore((s) => s.goals);
  const spheres = useAppStore((s) => s.spheres);
  const weeks = useAppStore((s) => s.weeks);
  const profile = useAppStore((s) => s.profile);
  const cycleStartDate = useAppStore((s) => s.cycleStartDate);

  return (
    <div className="px-4 py-8 print:p-8">
      <div className="no-print mb-6 flex gap-2">
        <Button onClick={() => window.print()}>Печать / PDF</Button>
      </div>
      <div className="print-only hidden text-black">
        <h1 className="text-2xl font-bold">Отчёт: 12 недель</h1>
        <p className="text-sm">Старт цикла: {cycleStartDate}</p>
        <p className="text-sm">Игрок: {profile.name} · Уровень {profile.level}</p>
        <hr className="my-4" />
        <h2 className="font-semibold">Цели</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {goals.map((g) => {
            const sphere = spheres.find((s) => s.id === g.sphereId);
            const progress =
              g.type === "counter"
                ? `${counterProgress(g)}/${g.targetCount}`
                : `${Math.round(metricProgressPercent(g))}%`;
            return (
              <li key={g.id}>
                [{sphere?.name}] {g.title} — {progress}{" "}
                {isGoalComplete(g) ? "✓" : ""}
              </li>
            );
          })}
        </ul>
        <h2 className="mt-6 font-semibold">Недели</h2>
        <ul className="mt-2 text-sm">
          {weeks.map((w) => (
            <li key={w.number}>
              Неделя {w.number}: {w.closed ? "закрыта" : "в процессе"}
              {w.reflection?.rating && ` · оценка ${w.reflection.rating}/10`}
            </li>
          ))}
        </ul>
      </div>
      <div className="print:hidden text-muted-foreground">
        <p>На экране печати откроется версия для PDF. Нажмите «Печать / PDF».</p>
      </div>
      <article className="mt-8 space-y-4 text-foreground print:text-black">
        <h1 className="font-display text-3xl font-bold">Итоги 12 недель</h1>
        <p>Старт: {cycleStartDate}</p>
        {goals.map((g) => (
          <section key={g.id} className="rounded border p-4">
            <h3 className="font-semibold">{g.title}</h3>
            <p className="text-sm text-muted-foreground">
              {g.type === "counter"
                ? `Прогресс: ${counterProgress(g)} / ${g.targetCount}`
                : `Прогресс: ${Math.round(metricProgressPercent(g))}%`}
            </p>
          </section>
        ))}
      </article>
    </div>
  );
}
