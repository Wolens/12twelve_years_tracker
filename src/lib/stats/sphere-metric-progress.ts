import type { Sphere } from "@/types";
import { formatMetricNumber } from "@/lib/sphere-metrics";

export type SphereMetricProgress = {
  hasMetric: true;
  start: number;
  target: number;
  current: number;
  percent: number;
  label: string;
  missingCurrent: boolean;
};

export function sphereHasNumericGoal(sphere: Sphere): boolean {
  return (
    typeof sphere.startValue === "number" &&
    typeof sphere.targetValue === "number" &&
    Number.isFinite(sphere.startValue) &&
    Number.isFinite(sphere.targetValue)
  );
}

export function sphereMetricProgress(sphere: Sphere): SphereMetricProgress | null {
  if (!sphereHasNumericGoal(sphere)) return null;
  const start = sphere.startValue!;
  const target = sphere.targetValue!;
  const span = target - start;
  if (span === 0) {
    return {
      hasMetric: true,
      start,
      target,
      current: sphere.currentValue ?? start,
      percent: sphere.currentValue === target ? 100 : 0,
      label: `${formatMetricNumber(start)} → ${formatMetricNumber(target)} · цель без диапазона`,
      missingCurrent: sphere.currentValue === undefined,
    };
  }

  if (sphere.currentValue === undefined) {
    return {
      hasMetric: true,
      start,
      target,
      current: start,
      percent: 0,
      label: `${formatMetricNumber(start)} → ${formatMetricNumber(target)} · укажи текущее в «Герой → Цели»`,
      missingCurrent: true,
    };
  }

  const current = sphere.currentValue;
  const raw = ((current - start) / span) * 100;
  const percent = Math.round(Math.min(100, Math.max(0, raw)));

  return {
    hasMetric: true,
    start,
    target,
    current,
    percent,
    label: `${formatMetricNumber(start)} → ${formatMetricNumber(target)} · сейчас ${formatMetricNumber(current)} (${percent}%)`,
    missingCurrent: false,
  };
}
