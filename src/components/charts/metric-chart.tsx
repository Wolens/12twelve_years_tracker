"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { Goal } from "@/types";

export function MetricChart({ goal, color = "#60a5fa" }: { goal: Goal; color?: string }) {
  const data = goal.measurements ?? [];
  const target = goal.targetValue;

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Добавьте первый замер
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#888", fontSize: 10 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fill: "#888", fontSize: 10 }} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{
            background: "rgba(17,17,24,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
          }}
        />
        {target !== undefined && (
          <ReferenceLine
            y={target}
            stroke="#f472b6"
            strokeDasharray="6 4"
            label={{ value: "Цель", fill: "#f472b6", fontSize: 10 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color }}
          name="Замер"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
