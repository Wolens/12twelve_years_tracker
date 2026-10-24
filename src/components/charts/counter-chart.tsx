"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { aggregateIncrementsByDay } from "@/lib/goals";
import type { Goal } from "@/types";

export function CounterChart({ goal, color = "#34d399" }: { goal: Goal; color?: string }) {
  const data = aggregateIncrementsByDay(goal.increments ?? []);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Пока нет данных — добавьте прогресс
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#888", fontSize: 10 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fill: "#888", fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: "rgba(17,17,24,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
          }}
        />
        <Bar dataKey="amount" fill={color} radius={[4, 4, 0, 0]} name="За день" />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={false}
          name="Накопительно"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
