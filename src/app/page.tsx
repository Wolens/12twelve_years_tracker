"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { xpProgressInLevel, rankTitle } from "@/lib/gamification";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { WeekDetail } from "@/components/dashboard/week-detail";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Flame } from "lucide-react";

export default function DashboardPage() {
  const weeks = useAppStore((s) => s.weeks);
  const profile = useAppStore((s) => s.profile);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const [selectedWeek, setSelectedWeek] = useState(activeWeek);
  const xp = xpProgressInLevel(profile.xp);

  useEffect(() => {
    setSelectedWeek(activeWeek);
  }, [activeWeek]);

  return (
    <div className="space-y-4">
      <header className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                12 недель
              </h1>
              <p className="text-sm text-muted-foreground">
                Рабочая неделя {activeWeek} · {rankTitle(profile.level)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl">{profile.avatar}</p>
              <p className="flex items-center justify-end gap-1 text-xs text-orange-400">
                <Flame className="h-3 w-3" />
                {profile.streak} дн.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Ур. {xp.level}</span>
              <span>{Math.round(xp.percent)}% до {xp.level + 1}</span>
            </div>
            <Progress value={xp.percent} className="h-1.5" />
          </div>
          <Link
            href="/today"
            className="mt-3 block text-center text-sm text-primary hover:underline"
          >
            Что сделать сегодня →
          </Link>
        </motion.div>
      </header>

      <WeekStrip
        activeWeek={activeWeek}
        weeks={weeks}
        selectedWeek={selectedWeek}
        onSelect={setSelectedWeek}
      />

      <WeekDetail week={selectedWeek} />
    </div>
  );
}
