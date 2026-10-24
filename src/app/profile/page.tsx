"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { xpProgressInLevel, rankTitle } from "@/lib/gamification";
import { ACHIEVEMENTS_META } from "@/lib/constants";
import type { AchievementId } from "@/types";
import { AuthPanel } from "@/components/profile/auth-panel";
import { SphereFilterBar } from "@/components/spheres/sphere-filter-bar";
import { AvatarPicker } from "@/components/profile/avatar-picker";
import { XpHistoryTrigger } from "@/components/profile/xp-history-trigger";

export default function ProfilePage() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const xp = xpProgressInLevel(profile.xp);

  const allAchievements = Object.keys(ACHIEVEMENTS_META) as AchievementId[];

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      <h1 className="font-display text-2xl font-bold">Профиль</h1>
      <SphereFilterBar />

      <Card>
        <CardContent className="pt-6 text-center">
          <AvatarPicker />
          <p className="mt-2 text-sm text-muted-foreground">Нажмите, чтобы выбрать аватар</p>
          <div className="mt-4 space-y-2 text-left">
            <Label>Имя</Label>
            <Input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </div>
          <p className="mt-4 font-display text-xl font-semibold">
            Уровень {xp.level} · {rankTitle(xp.level)}
          </p>
          <Progress value={xp.percent} className="mt-2 h-2" />
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>
              {profile.xp} XP всего · streak {profile.streak} дн.
            </span>
            <XpHistoryTrigger />
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Достижения</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {allAchievements.map((id) => {
            const meta = ACHIEVEMENTS_META[id];
            const unlocked = profile.achievements.includes(id);
            return (
              <div
                key={id}
                className={`rounded-xl border p-3 text-center ${
                  unlocked
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/5 opacity-40 grayscale"
                }`}
              >
                <span className="text-2xl">{meta.emoji}</span>
                <p className="mt-1 text-xs font-medium">{meta.title}</p>
                <p className="text-[10px] text-muted-foreground">{meta.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AuthPanel className="border-white/10 bg-card/60" />
    </div>
  );
}
