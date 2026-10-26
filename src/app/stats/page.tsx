"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CounterChart } from "@/components/charts/counter-chart";
import { MetricChart } from "@/components/charts/metric-chart";
import { CycleRadial } from "@/components/stats/cycle-radial";
import {
  counterPercent,
  metricProgressPercent,
  isGoalComplete,
  onetimeStats,
} from "@/lib/goals";
import { Flame } from "lucide-react";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";
import { filterGoalsByVisibleSpheres } from "@/lib/sphere-filters";

export default function StatsPage() {
  const goals = useAppStore((s) => s.goals);
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const weeks = useAppStore((s) => s.weeks);
  const profile = useAppStore((s) => s.profile);
  const [filterSphere, setFilterSphere] = useState("all");
  const [filterGoal, setFilterGoal] = useState("all");

  const visibleGoals = filterGoalsByVisibleSpheres(goals, hiddenSphereIds);

  const filteredGoals = useMemo(() => {
    let list = visibleGoals;
    if (filterSphere !== "all") list = list.filter((g) => g.sphereId === filterSphere);
    if (filterGoal !== "all") list = list.filter((g) => g.id === filterGoal);
    return list;
  }, [visibleGoals, filterSphere, filterGoal]);

  const trackable = visibleGoals.filter(
    (g) => g.type === "counter" || g.type === "metric"
  );

  const cyclePercent = useMemo(() => {
    if (trackable.length === 0) return 0;
    const sum = trackable.reduce((acc, g) => {
      if (g.type === "counter") return acc + counterPercent(g);
      return acc + metricProgressPercent(g);
    }, 0);
    return sum / trackable.length;
  }, [trackable]);

  const onetime = onetimeStats(visibleGoals);

  const sphereStats = spheres
    .filter((s) => !hiddenSphereIds.includes(s.id))
    .map((s) => {
      const sg = visibleGoals.filter((g) => g.sphereId === s.id);
      const done = sg.filter(isGoalComplete).length;
      const track = sg.filter((g) => g.type !== "onetime");
      const avg =
        track.length === 0
          ? 0
          : track.reduce(
              (a, g) =>
                a +
                (g.type === "counter"
                  ? counterPercent(g)
                  : metricProgressPercent(g)),
              0
            ) / track.length;
      const ot = onetimeStats(sg);
      return { sphere: s, total: sg.length, done, avg, onetime: ot };
    });

  const closedWeeks = weeks.filter((w) => w.closed).length;
  const chartGoals = filteredGoals.filter((g) => g.type !== "onetime");

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      <h1 className="font-display text-2xl font-bold">Статистика</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Прогресс цикла</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <CycleRadial percent={cyclePercent} />
          <p className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
            {Math.round(cyclePercent)}%
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Недель закрыто: {closedWeeks}/12 ·{" "}
            <span className="inline-flex items-center gap-1 text-orange-400">
              <Flame className="h-4 w-4" /> Streak {profile.streak}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Разовые цели</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">
            {onetime.completed} / {onetime.total}
          </p>
          <p className="text-sm text-muted-foreground">выполнено за цикл</p>
        </CardContent>
      </Card>

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
              <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">По сферам</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sphereStats.map(({ sphere, total, done, avg, onetime: ot }) => (
            <div
              key={sphere.id}
              className="flex flex-col gap-1 rounded-lg border border-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderLeftColor: sphere.color, borderLeftWidth: 3 }}
            >
              <span className="flex items-center gap-2">
                <SphereGlyph icon={sphere.icon} color={sphere.color} size="xs" />
                {sphere.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {done}/{total} целей · {Math.round(avg)}% · разовые {ot.completed}/{ot.total}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

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
    </div>
  );
}
