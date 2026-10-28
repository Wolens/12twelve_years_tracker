"use client";

import type { Sphere } from "@/types";
import type { SphereTaskStats } from "@/lib/stats/sphere-task-stats";
import { sphereMetricProgress } from "@/lib/stats/sphere-metric-progress";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";
import { Progress } from "@/components/ui/progress";

type Props = {
  sphere: Sphere;
  taskStats: SphereTaskStats;
  weekScopeLabel: string;
};

export function StatsSphereCard({ sphere, taskStats, weekScopeLabel }: Props) {
  const metric = sphereMetricProgress(sphere);

  return (
    <div
      className="space-y-3 rounded-xl border border-white/10 bg-card/25 p-4"
      style={{ borderTopColor: sphere.color, borderTopWidth: 3 }}
    >
      <div className="flex items-center gap-2">
        <SphereGlyph icon={sphere.icon} color={sphere.color} size="sm" />
        <p className="min-w-0 flex-1 truncate font-medium">{sphere.name}</p>
      </div>

      {sphere.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{sphere.description}</p>
      )}

      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Задачи · {weekScopeLabel}
        </p>
        {taskStats.total === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Нет задач в этом периоде</p>
        ) : (
          <>
            <p className="mt-1 text-sm">
              {taskStats.done}/{taskStats.total} выполнено ({taskStats.percent}%)
            </p>
            <Progress value={taskStats.percent} className="mt-2 h-1.5" />
          </>
        )}
      </div>

      {metric && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Числовая цель
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
          {!metric.missingCurrent && (
            <Progress value={metric.percent} className="mt-2 h-1.5" />
          )}
        </div>
      )}
    </div>
  );
}
