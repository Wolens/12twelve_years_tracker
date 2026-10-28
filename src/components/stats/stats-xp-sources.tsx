"use client";

import type { XpSourceBucket } from "@/lib/stats/xp-activity";

type Row = { bucket: XpSourceBucket; xp: number; label: string };

export function StatsXpSources({ rows, total }: { rows: Row[]; total: number }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Нет начислений за выбранный период.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.bucket} className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">{r.label}</span>
          <span className="font-medium text-primary">
            +{r.xp}
            {total > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({Math.round((r.xp / total) * 100)}%)
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
