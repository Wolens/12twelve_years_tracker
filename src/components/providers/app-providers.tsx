"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { LevelUpHandler } from "@/components/gamification/level-up-handler";
import { SoundProvider } from "@/components/audio/sound-provider";
import { Toaster } from "@/components/ui/toaster";
import { syncProfileAchievements } from "@/lib/achievements";
import {
  hydrateAppStateFromCloud,
  pullCloudStateIntoApp,
  saveCloudAppStateSafe,
} from "@/lib/cloud-sync";
import {
  markCloudHydrationDone,
  resetCloudHydrationGate,
} from "@/lib/cloud-hydration";
import { repairAppState, stateNeedsRepair } from "@/lib/app-state-health";
import { toast } from "@/components/ui/use-toast";
import type { AppState } from "@/types";

/** Дешёвый отпечаток прогресса. Ачивки не входят, чтобы sync не зацикливался. */
function achievementProgressSnapshot(state: AppState): string {
  let done = 0;
  for (const task of state.cycleTasks) if (task.done) done++;
  let bonus = 0;
  for (const week of state.weeks) if (week.bonusAwarded) bonus++;
  let marks = 0;
  const completions = state.habitCompletions ?? {};
  for (const date in completions) marks += completions[date]?.length ?? 0;
  const activeHabits = (state.habits ?? []).reduce((n, habit) => n + (habit.archived ? 0 : 1), 0);
  const profile = state.profile;
  const character = state.character;
  return [
    done,
    state.cycleTasks.length,
    bonus,
    activeHabits,
    marks,
    profile.streak,
    profile.level,
    profile.xp,
    profile.xpLedger?.length ?? 0,
    character.inventory.length,
    character.claimedFloorChests?.length ?? 0,
    character.claimedLevelRewards?.length ?? 0,
    character.race,
  ].join(":");
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const authInitialized = useAuthStore((s) => s.initialized);
  const hydratedForUser = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme !== "light");
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "light" ? "#f4f6f9" : "#0a0a0f");
  }, [theme]);

  useEffect(() => {
    return useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    if (!authInitialized) return;

    let progressSnap = achievementProgressSnapshot(useAppStore.getState());

    const syncAchievements = () => {
      const state = useAppStore.getState();
      const nextProfile = syncProfileAchievements(state);
      if (nextProfile === state.profile) return;
      useAppStore.setState({ profile: nextProfile });
    };

    let timer: number | undefined;
    const onStoreChange = () => {
      if (timer !== undefined) return;
      timer = window.setTimeout(() => {
        timer = undefined;
        const state = useAppStore.getState();
        const snap = achievementProgressSnapshot(state);
        if (snap === progressSnap) return;
        progressSnap = snap;
        syncAchievements();
      }, 0);
    };

    syncAchievements();
    progressSnap = achievementProgressSnapshot(useAppStore.getState());
    const unsubAchievements = useAppStore.subscribe(onStoreChange);
    return () => {
      unsubAchievements();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [authInitialized]);

  useEffect(() => {
    if (!authInitialized) return;

    if (!userId) {
      hydratedForUser.current = null;
      resetCloudHydrationGate();
      markCloudHydrationDone();
      const state = useAppStore.getState();
      if (stateNeedsRepair(state)) {
        useAppStore.getState().repairStateFromLedger();
      }
      useAppStore.getState().processSeasonFlameOnBoot();
      useAppStore.getState().syncLevelRewards();
      useAppStore.getState().syncCycleFromCalendar();
      return;
    }

    if (hydratedForUser.current === userId) {
      markCloudHydrationDone();
      return;
    }

    resetCloudHydrationGate();
    let cancelled = false;
    (async () => {
      try {
        await hydrateAppStateFromCloud(userId);
        const state = useAppStore.getState();
        if (stateNeedsRepair(state)) {
          useAppStore.setState(repairAppState(state));
        }
        const decay = useAppStore.getState().processSeasonFlameOnBoot();
        useAppStore.getState().syncLevelRewards();
        useAppStore.getState().syncCycleFromCalendar();
        if (decay.missedDays > 0 && !cancelled) {
          toast({
            title: "Здоровье снизилось",
            description: `Пропущено дней: ${decay.missedDays}. Открой день, чтобы восстановить.`,
          });
        }
      } catch (err) {
        console.error("[cloud-sync] hydrate failed", err);
      } finally {
        markCloudHydrationDone();
        if (!cancelled) {
          hydratedForUser.current = userId;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authInitialized, userId]);

  useEffect(() => {
    if (!userId) return;

    let syncTimer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useAppStore.subscribe(() => {
      if (hydratedForUser.current !== userId) return;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        const state = useAppStore.getState().exportState();
        void saveCloudAppStateSafe(userId, state);
      }, 600);
    });

    const flush = () => {
      if (hydratedForUser.current !== userId) return;
      const state = useAppStore.getState().exportState();
      void saveCloudAppStateSafe(userId, state);
    };
    window.addEventListener("beforeunload", flush);

    return () => {
      unsub();
      clearTimeout(syncTimer);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (hydratedForUser.current !== userId) return;

    let pullTimer: ReturnType<typeof setTimeout> | undefined;
    const schedulePull = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(pullTimer);
      pullTimer = setTimeout(() => {
        void pullCloudStateIntoApp(userId);
      }, 400);
    };

    document.addEventListener("visibilitychange", schedulePull);
    window.addEventListener("focus", schedulePull);

    return () => {
      clearTimeout(pullTimer);
      document.removeEventListener("visibilitychange", schedulePull);
      window.removeEventListener("focus", schedulePull);
    };
  }, [userId]);

  return (
    <SoundProvider>
      {children}
      <Toaster />
      <LevelUpHandler />
    </SoundProvider>
  );
}
