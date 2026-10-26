"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalTasksList } from "@/components/goals/goal-tasks-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isGoalComplete, isOnetimeComplete } from "@/lib/goals";
import { Checkbox } from "@/components/ui/checkbox";
import type { Goal } from "@/types";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";

export default function GoalsPage() {
  const spheres = useAppStore((s) => s.spheres);
  const goals = useAppStore((s) => s.goals);
  const toggleGoalDone = useAppStore((s) => s.toggleGoalDone);
  const deleteGoal = useAppStore((s) => s.deleteGoal);

  const [addForSphere, setAddForSphere] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null);
  const [expandedTasksId, setExpandedTasksId] = useState<string | null>(null);

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      <div data-tour="goals-board">
        <h1 className="font-display text-2xl font-bold">Цели</h1>
        <p className="text-sm text-muted-foreground">
          Цели на весь 12-недельный период. Недельные задачи — в разделе «12 недель».
        </p>
      </div>

      {editingGoal && (
        <GoalFormDialog
          editGoal={editingGoal}
          open={true}
          onOpenChange={(o) => !o && setEditingGoal(null)}
          hideTrigger
        />
      )}

      {spheres.length === 0 && (
        <div className="glass-card p-8 text-center text-muted-foreground">
          Добавьте сферы в настройках или пройдите онбординг.
        </div>
      )}

      {spheres.map((sphere) => {
        const sphereGoals = goals.filter((g) => g.sphereId === sphere.id);
        return (
          <Card key={sphere.id} className="overflow-hidden">
            <CardHeader
              className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0"
              style={{ borderLeftColor: sphere.color, borderLeftWidth: 4 }}
            >
              <CardTitle className="flex min-w-0 flex-1 items-center gap-2 break-words text-base leading-snug sm:text-lg">
                <SphereGlyph icon={sphere.icon} color={sphere.color} size="sm" />
                <span>{sphere.name}</span>
              </CardTitle>
              <GoalFormDialog
                defaultSphereId={sphere.id}
                open={addForSphere === sphere.id}
                onOpenChange={(o) => setAddForSphere(o ? sphere.id : null)}
                hideTrigger
              />
              <Button size="sm" variant="outline" onClick={() => setAddForSphere(sphere.id)}>
                + Цель
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {sphereGoals.length === 0 && (
                <p className="text-sm text-muted-foreground">Пока нет целей на период</p>
              )}
              {sphereGoals.map((g) => (
                <div
                  key={g.id}
                  className="rounded-lg border border-white/5 bg-background/20 p-3"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      {g.type === "onetime" && (
                        <Checkbox
                          checked={isOnetimeComplete(g)}
                          onCheckedChange={() => toggleGoalDone(g.id)}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium leading-snug">
                          {g.title}
                        </p>
                        <p className="text-[10px] uppercase text-muted-foreground">
                          {g.type === "onetime"
                            ? "Разовая"
                            : g.type === "counter"
                              ? "Счётчик"
                              : "Метрика"}
                          {isGoalComplete(g) && " · выполнена"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5"
                        onClick={() =>
                          setExpandedTasksId(expandedTasksId === g.id ? null : g.id)
                        }
                      >
                        Задачи
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2.5"
                        onClick={() => setEditingGoal(g)}
                      >
                        Изменить
                      </Button>
                      {(g.type === "counter" || g.type === "metric") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2.5"
                          onClick={() =>
                            setExpandedMetricId(expandedMetricId === g.id ? null : g.id)
                          }
                        >
                          {expandedMetricId === g.id ? "Скрыть" : "Прогресс"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 px-2.5"
                        onClick={() => deleteGoal(g.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                  {expandedTasksId === g.id && <GoalTasksList goal={g} />}
                  {expandedMetricId === g.id && (
                    <div className="mt-3 border-t border-white/5 pt-3">
                      <GoalCard goal={g} sphere={sphere} compact />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
