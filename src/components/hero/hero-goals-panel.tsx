"use client";

import { memo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SphereAddDialog } from "@/components/spheres/sphere-add-dialog";
import { visibleSpheres } from "@/lib/sphere-filters";
import { SphereGoalEditor } from "@/components/hero/sphere-goal-editor";

export const HeroGoalsPanel = memo(function HeroGoalsPanel() {
  const spheres = useAppStore((s) => s.spheres);
  const hidden = useAppStore((s) => s.hiddenSphereIds);
  const list = visibleSpheres(spheres, hidden);

  return (
    <div data-tour="hero-goals" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Все цели на 12 недель: описание и числа для анализа. Задачи по неделям — во вкладке «12
          недель», привычки — вкладка «Привычки».
        </p>
        <SphereAddDialog />
      </div>

      {list.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-muted-foreground">
          Добавь первую цель кнопкой «+».
        </p>
      )}

      <div className="space-y-4">
        {list.map((sphere) => (
          <SphereGoalEditor key={sphere.id} sphere={sphere} />
        ))}
      </div>
    </div>
  );
});
