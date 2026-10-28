"use client";

import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; xp?: number; [key: string]: number | string | undefined };

export type XpChartSeries = { id: string; name: string; color: string };

function formatDay(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function hasChartData(data: Point[], series?: XpChartSeries[]): boolean {
  if (series?.length) {
    return data.some((d) => series.some((s) => Number(d[s.id] ?? 0) > 0));
  }
  return data.some((d) => Number(d.xp ?? 0) > 0);
}

export function StatsXpChart({
  data,
  series,
}: {
  data: Point[];
  series?: XpChartSeries[];
}) {
  const bySphere = Boolean(series?.length);

  if (!hasChartData(data, series)) {
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
    <ResponsiveContainer width="100%" height={bySphere ? 240 : 200}>
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
          formatter={(v: number, name: string) => {
            if (!v) return [null, null];
            const label = series?.find((s) => s.id === name)?.name ?? name;
            return [`+${v} XP`, label];
          }}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.date ? formatDay(payload[0].payload.date as string) : ""
          }
        />
        {bySphere ? (
          <>
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value: string) =>
                series?.find((s) => s.id === value)?.name ?? value
              }
            />
            {series!.map((s) => (
              <Bar
                key={s.id}
                dataKey={s.id}
                name={s.id}
                fill={s.color}
                radius={[3, 3, 0, 0]}
                maxBarSize={bySphere && series!.length > 4 ? 10 : 16}
              />
            ))}
          </>
        ) : (
          <Bar dataKey="xp" fill="#34d399" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
