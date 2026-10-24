"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider-simple";
import { useState } from "react";
import type { Goal, Sphere } from "@/types";
import {
  counterProgress,
  counterRemaining,
  counterPercent,
  metricProgressPercent,
  metricDeltaFromStart,
  metricDeltaSinceLast,
  metricCurrentValue,
  isOnetimeComplete,
} from "@/lib/goals";
import { CounterChart } from "@/components/charts/counter-chart";
import { MetricChart } from "@/components/charts/metric-chart";
import { MetricMeasurementsDialog } from "@/components/goals/metric-measurements-dialog";
import { useAppStore } from "@/store/useAppStore";

export function GoalCard({
  goal,
  sphere,
  compact,
}: {
  goal: Goal;
  sphere?: Sphere;
  compact?: boolean;
}) {
  const addCounterIncrement = useAppStore((s) => s.addCounterIncrement);
  const setCounterProgress = useAppStore((s) => s.setCounterProgress);
  const addMetricMeasurement = useAppStore((s) => s.addMetricMeasurement);
  const toggleGoalDone = useAppStore((s) => s.toggleGoalDone);
  const [amount, setAmount] = useState("1");
  const [metricVal, setMetricVal] = useState("");
  const color = sphere?.color ?? "#34d399";

  const formatDelta = (n: number, unit?: string) =>
    `${n > 0 ? "+" : ""}${n.toFixed(1)} ${unit ?? ""}`.trim();

  const submitCounter = () => {
    addCounterIncrement(goal.id, Math.max(1, parseInt(amount, 10) || 1));
  };

  const submitMetric = () => {
    const v = parseFloat(metricVal);
    if (!Number.isNaN(v)) {
      addMetricMeasurement(goal.id, v);
      setMetricVal("");
    }
  };

  const inner = (
    <>
      {goal.type === "onetime" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isOnetimeComplete(goal) ? "Выполнено" : "В работе"}
          </p>
          <Button size="sm" variant="outline" onClick={() => toggleGoalDone(goal.id)}>
            {isOnetimeComplete(goal) ? "Отменить" : "Готово"}
          </Button>
        </div>
      )}
      {goal.type === "counter" && (
        <>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>
                {counterProgress(goal)} / {goal.targetCount} {goal.unit ?? ""}
              </span>
              <span className="text-muted-foreground">
                осталось {counterRemaining(goal)}
              </span>
            </div>
            <Progress value={counterPercent(goal)} indicatorClassName="bg-emerald-400" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Откат / коррекция прогресса
            </Label>
            <Slider
              min={0}
              max={goal.targetCount ?? 1}
              step={1}
              value={[counterProgress(goal)]}
              onValueChange={([v]) => setCounterProgress(goal.id, v)}
            />
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitCounter();
            }}
          >
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24"
            />
            <Button type="submit" size="sm">+ Прогресс</Button>
          </form>
          {!compact && <CounterChart goal={goal} color={color} />}
        </>
      )}
      {goal.type === "metric" && (
        <>
          <div>
            <div className="mb-1 flex flex-wrap justify-between gap-1 text-sm">
              <span>
                {goal.startValue ?? "—"} → {goal.targetValue} {goal.unit ?? ""}
              </span>
              <span className="text-muted-foreground">
                сейчас {metricCurrentValue(goal)} {goal.unit ?? ""}
              </span>
            </div>
            <Progress value={metricProgressPercent(goal)} indicatorClassName="bg-sky-400" />
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {metricDeltaFromStart(goal) !== null && (
                <span>от старта: {formatDelta(metricDeltaFromStart(goal)!, goal.unit)}</span>
              )}
              {metricDeltaSinceLast(goal) !== null && (
                <span>
                  с прошлого замера: {formatDelta(metricDeltaSinceLast(goal)!, goal.unit)}
                </span>
              )}
            </div>
          </div>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitMetric();
            }}
          >
            <Input
              type="number"
              placeholder="Новый замер"
              value={metricVal}
              onChange={(e) => setMetricVal(e.target.value)}
              className="min-w-[8rem] flex-1"
            />
            <Button type="submit" size="sm">Записать</Button>
            <MetricMeasurementsDialog goal={goal} />
          </form>
          {!compact && <MetricChart goal={goal} color={color} />}
        </>
      )}
    </>
  );

  if (compact) {
    return <div className="space-y-3">{inner}</div>;
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="overflow-hidden" style={{ boxShadow: `0 0 40px ${color}15` }}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-lg">{sphere?.icon}</span>
              <CardTitle className="mt-1 text-lg">{goal.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{sphere?.name}</p>
            </div>
            {goal.completed && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                ✓ Готово
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">{inner}</CardContent>
      </Card>
    </motion.div>
  );
}
