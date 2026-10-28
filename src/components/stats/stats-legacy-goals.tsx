"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterGoalsByVisibleSpheres } from "@/lib/sphere-filters";

const CounterChart = dynamic(
  () => import("@/components/charts/counter-chart").then((m) => m.CounterChart),
  { ssr: false, loading: () => <div className="h-40" /> }
);
const MetricChart = dynamic(
  () => import("@/components/charts/metric-chart").then((m) => m.MetricChart),
  { ssr: false, loading: () => <div className="h-40" /> }
);

export function StatsLegacyGoalsSection() {
  const goals = useAppStore((s) => s.goals);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const [filterSphere, setFilterSphere] = useState("all");
  const [filterGoal, setFilterGoal] = useState("all");

  const visibleGoals = filterGoalsByVisibleSpheres(goals, hiddenSphereIds);
  const trackable = visibleGoals.filter(
    (g) => g.type === "counter" || g.type === "metric"
  );

  const filteredGoals = useMemo(() => {
    let list = visibleGoals;
    if (filterSphere !== "all") list = list.filter((g) => g.sphereId === filterSphere);
    if (filterGoal !== "all") list = list.filter((g) => g.id === filterGoal);
    return list;
  }, [visibleGoals, filterSphere, filterGoal]);

  const chartGoals = filteredGoals.filter((g) => g.type !== "onetime");

  if (trackable.length === 0) return null;

  return (
    <section className="space-y-4 border-t border-white/10 pt-6">
      <h2 className="font-display text-lg font-semibold">Архив целей</h2>
      <p className="text-sm text-muted-foreground">
        Старые счётчики и метрики — если ты пользовался ими до обновления.
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        <Select value={filterSphere} onValueChange={setFilterSphere}>
          <SelectTrigger>
            <SelectValue placeholder="Сфера" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все сферы</SelectItem>
            {spheres.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterGoal} onValueChange={setFilterGoal}>
          <SelectTrigger>
            <SelectValue placeholder="Цель" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все цели</SelectItem>
            {visibleGoals.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {chartGoals.map((g) => {
        const sphere = spheres.find((s) => s.id === g.sphereId);
        return (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle className="text-base">{g.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {g.type === "counter" ? (
                <CounterChart goal={g} color={sphere?.color} />
              ) : (
                <MetricChart goal={g} color={sphere?.color} />
              )}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
