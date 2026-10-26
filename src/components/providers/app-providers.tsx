"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { LevelUpHandler } from "@/components/gamification/level-up-handler";
import { Toaster } from "@/components/ui/toaster";
import { achievementsNeedSync, syncProfileAchievements } from "@/lib/achievements";
import {
  hydrateAppStateFromCloud,
  saveCloudAppStateSafe,
} from "@/lib/cloud-sync";
import {
  markCloudHydrationDone,
  resetCloudHydrationGate,
} from "@/lib/cloud-hydration";
import { repairAppState, stateNeedsRepair } from "@/lib/app-state-health";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const authInitialized = useAuthStore((s) => s.initialized);
  const hydratedForUser = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme !== "light");
  }, [theme]);

  useEffect(() => {
    return useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    if (!authInitialized) return;

    const syncAchievements = () => {
      const state = useAppStore.getState();
      if (!achievementsNeedSync(state)) return;
      useAppStore.setState({
        profile: syncProfileAchievements(state),
      });
    };

    syncAchievements();
    const unsubAchievements = useAppStore.subscribe(syncAchievements);
    return () => unsubAchievements();
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
      return;
    }

    if (hydratedForUser.current === userId) {
      markCloudHydrationDone();
      return;
    }

    resetCloudHydrationGate();
    let cancelled = false;
    (async () => {
      await hydrateAppStateFromCloud(userId);
      const state = useAppStore.getState();
      if (stateNeedsRepair(state)) {
        useAppStore.setState(repairAppState(state));
      }
      if (!cancelled) {
        hydratedForUser.current = userId;
        markCloudHydrationDone();
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

  return (
    <>
      {children}
      <Toaster />
      <LevelUpHandler />
    </>
  );
}
