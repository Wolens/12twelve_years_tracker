"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; xp: number };

function formatDay(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function StatsXpChart({ data }: { data: Point[] }) {
  const hasAny = data.some((d) => d.xp > 0);
  if (!hasAny) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        За последние 14 дней XP не начислялся — закрой задачу на «Сегодня».
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatDay(d.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#0c1016",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v: number) => [`+${v} XP`, ""]}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.date ? formatDay(payload[0].payload.date as string) : ""
          }
        />
        <Bar dataKey="xp" fill="#34d399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
