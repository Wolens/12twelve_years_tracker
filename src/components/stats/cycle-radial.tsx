"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function CycleRadial({ percent }: { percent: number }) {
  const data = [
    { name: "done", value: percent },
    { name: "rest", value: 100 - percent },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
        >
          <Cell fill="#34d399" />
          <Cell fill="rgba(255,255,255,0.08)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
