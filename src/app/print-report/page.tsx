"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  buildPrintReportData,
  DEFAULT_PRINT_REPORT_SECTIONS,
  formatReportDate,
  type PrintReportSections,
} from "@/lib/stats/print-report-data";
import { PrintReportSectionPicker } from "@/components/print/print-report-section-picker";

function weekHasReflectionContent(w: {
  reflectionNote?: string;
  reflectionWins?: string;
  reflectionStruggles?: string;
  reflectionRating?: number;
}) {
  return !!(
    w.reflectionNote ||
    w.reflectionWins ||
    w.reflectionStruggles ||
    w.reflectionRating
  );
}

export default function PrintReportPage() {
  const state = useAppStore(
    useShallow((s) => ({
      cycleTasks: s.cycleTasks,
      weeks: s.weeks,
      spheres: s.spheres,
      hiddenSphereIds: s.hiddenSphereIds,
      activeWeek: s.activeWeek,
      cycleStartDate: s.cycleStartDate,
      profile: s.profile,
      seasonFlame: s.seasonFlame,
      goals: s.goals,
    }))
  );

  const [sections, setSections] = useState<PrintReportSections>(
    () => ({ ...DEFAULT_PRINT_REPORT_SECTIONS })
  );

  const report = useMemo(
    () => buildPrintReportData(state),
    [
      state.cycleTasks,
      state.weeks,
      state.spheres,
      state.hiddenSphereIds,
      state.activeWeek,
      state.cycleStartDate,
      state.profile,
      state.seasonFlame,
      state.goals,
    ]
  );

  const anySection =
    sections.summary ||
    sections.weeksTable ||
    sections.reflections ||
    sections.spheres ||
    sections.taskDetails ||
    sections.xpActivity ||
    (sections.legacyGoals && report.legacyGoals.length > 0);

  return (
    <div className="space-y-6 px-4 py-8 print:space-y-0 print:px-8 print:py-6">
      <div className="no-print flex flex-wrap gap-2">
        <Button onClick={() => window.print()} disabled={!anySection}>
          Печать / PDF
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">Назад в настройки</Link>
        </Button>
      </div>

      <PrintReportSectionPicker
        value={sections}
        onChange={setSections}
        hasLegacyGoals={report.legacyGoals.length > 0}
      />

      {!anySection && (
        <p className="no-print text-sm text-muted-foreground">
          Выбери хотя бы один блок для отчёта.
        </p>
      )}

      <article className="mx-auto max-w-3xl space-y-8 text-foreground print:max-w-none print:text-black">
        {sections.summary && (
          <header className="border-b border-white/10 pb-4 print:border-black/20">
            <h1 className="font-display text-3xl font-bold">Отчёт: 12 недель</h1>
            <p className="mt-2 text-sm text-muted-foreground print:text-black/70">
              Сформирован {formatReportDate(report.generatedAt)}
            </p>
            <dl className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground print:text-black/60">Игрок</dt>
                <dd>
                  {report.playerName} · ур. {report.level} · {report.totalXp} XP
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground print:text-black/60">Цикл</dt>
                <dd>
                  Старт {formatReportDate(report.cycleStartDate)} · неделя{" "}
                  {report.activeWeek}/12
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground print:text-black/60">Сводка</dt>
                <dd>
                  Задач {report.overview.doneTasks}/{report.overview.totalTasks} (
                  {report.overview.taskPercent}%) · недель закрыто{" "}
                  {report.overview.closedWeeks}/12 · streak {report.streak}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground print:text-black/60">Активность</dt>
                <dd>
                  XP 7 дн. +{report.xp7d} · 28 дн. +{report.xp28d} · здоровье{" "}
                  {report.vitality}%
                </dd>
              </div>
            </dl>
          </header>
        )}

        {(sections.weeksTable || sections.reflections) && (
          <section className="print:break-inside-avoid">
            {sections.weeksTable && (
              <>
                <h2 className="font-display text-xl font-semibold">12 недель</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 print:border-black/20">
                        <th className="py-2 pr-2 font-medium">Нед.</th>
                        <th className="py-2 pr-2 font-medium">Статус</th>
                        <th className="py-2 pr-2 font-medium">Задачи</th>
                        <th className="py-2 pr-2 font-medium">%</th>
                        <th className="py-2 font-medium">XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.weeks.map((w) => (
                        <tr
                          key={w.week}
                          className="border-b border-white/5 print:border-black/10"
                        >
                          <td className="py-2 pr-2">{w.week}</td>
                          <td className="py-2 pr-2">{w.closed ? "Закрыта" : "Открыта"}</td>
                          <td className="py-2 pr-2">
                            {w.total > 0 ? `${w.done}/${w.total}` : "—"}
                          </td>
                          <td className="py-2 pr-2">
                            {w.total > 0 ? `${w.tacticalPercent}%` : "—"}
                          </td>
                          <td className="py-2">{w.xp > 0 ? `+${w.xp}` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {sections.reflections &&
              report.weeks.some(weekHasReflectionContent) && (
                <div className={sections.weeksTable ? "mt-4 space-y-3" : "space-y-3"}>
                  <h2 className="font-display text-xl font-semibold">
                    {sections.weeksTable ? "Рефлексии" : "Заметки и рефлексии"}
                  </h2>
                  {report.weeks.map((w) => {
                    if (!weekHasReflectionContent(w)) return null;
                    return (
                      <div
                        key={w.week}
                        className="rounded-lg border border-white/10 p-3 text-sm print:border-black/15"
                      >
                        <p className="font-medium">
                          Неделя {w.week}
                          {w.reflectionRating != null &&
                            ` · оценка ${w.reflectionRating}/10`}
                        </p>
                        {w.reflectionNote && (
                          <p className="mt-1 whitespace-pre-wrap text-muted-foreground print:text-black/80">
                            {w.reflectionNote}
                          </p>
                        )}
                        {w.reflectionWins && (
                          <p className="mt-1">
                            <span className="text-muted-foreground print:text-black/60">
                              Победы:{" "}
                            </span>
                            {w.reflectionWins}
                          </p>
                        )}
                        {w.reflectionStruggles && (
                          <p className="mt-1">
                            <span className="text-muted-foreground print:text-black/60">
                              Сложности:{" "}
                            </span>
                            {w.reflectionStruggles}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </section>
        )}

        {(sections.spheres || sections.taskDetails) && (
          <section>
            <h2 className="font-display text-xl font-semibold">Цели (направления)</h2>
            {report.spheres.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground print:text-black/70">
                Нет направлений в отчёте.
              </p>
            ) : (
              <div className="mt-4 space-y-6">
                {report.spheres.map((sec) => (
                  <div
                    key={sec.sphere.id}
                    className="print:break-inside-avoid rounded-lg border border-white/10 p-4 print:border-black/15"
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor: sec.sphere.color,
                    }}
                  >
                    {sections.spheres && (
                      <>
                        <h3 className="font-semibold">{sec.sphere.name}</h3>
                        {sec.description && (
                          <p className="mt-1 text-sm text-muted-foreground print:text-black/75">
                            {sec.description}
                          </p>
                        )}
                        {sec.metricLabel && (
                          <p className="mt-2 text-sm">Числовая цель: {sec.metricLabel}</p>
                        )}
                        <p className="mt-2 text-sm">
                          Задачи за цикл: {sec.tasksAll.done}/{sec.tasksAll.total}
                          {sec.tasksAll.total > 0 && ` (${sec.tasksAll.percent}%)`}
                        </p>
                      </>
                    )}
                    {sections.taskDetails && sec.tasksByWeek.length > 0 && (
                      <ul
                        className={
                          sections.spheres ? "mt-3 space-y-2 text-sm" : "space-y-2 text-sm"
                        }
                      >
                        {!sections.spheres && (
                          <li className="font-semibold">{sec.sphere.name}</li>
                        )}
                        {sec.tasksByWeek.map(({ week, tasks }) => (
                          <li key={week}>
                            <span className="font-medium">Неделя {week}</span>
                            <ul className="mt-1 list-inside list-disc text-muted-foreground print:text-black/80">
                              {tasks.map((t) => (
                                <li key={t.id}>
                                  {t.done ? "✓ " : "○ "}
                                  {t.title}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {sections.xpActivity && (
          <section className="print:break-inside-avoid">
            <h2 className="font-display text-xl font-semibold">XP за 28 дней</h2>
            {report.xpSources.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground print:text-black/70">
                Нет начислений за период.
              </p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {report.xpSources.map((s) => (
                  <li key={s.bucket} className="flex justify-between gap-4">
                    <span>{s.label}</span>
                    <span className="font-medium">+{s.xp}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {sections.legacyGoals && report.legacyGoals.length > 0 && (
          <section className="print:break-inside-avoid">
            <h2 className="font-display text-xl font-semibold">Архив целей</h2>
            <p className="mt-1 text-xs text-muted-foreground print:text-black/60">
              Старые счётчики и метрики до обновления приложения.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {report.legacyGoals.map(({ goal, sphereName, progressText, complete }) => (
                <li key={goal.id}>
                  [{sphereName}] {goal.title} — {progressText}
                  {complete ? " ✓" : ""}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
