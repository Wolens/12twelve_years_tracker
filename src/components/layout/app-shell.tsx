"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { waitForCloudHydration } from "@/lib/cloud-hydration";
import { hasUserProgress } from "@/lib/app-state-health";
import { BottomNav } from "./bottom-nav";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { subscribeNavPending } from "./nav-pending";
import { cn } from "@/lib/utils";

function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setReady(true));
    if (useAppStore.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  return ready;
}

function BootSplash() {
  return (
    <div
      className="min-h-dvh bg-background"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(52,211,153,0.16), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(167,139,250,0.12), transparent 55%)",
      }}
      aria-hidden
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const ready = useHydrated();
  const authInitialized = useAuthStore((s) => s.initialized);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [cloudReady, setCloudReady] = useState(false);
  const isOnboarding = pathname === "/onboarding";
  const [navPending, setNavPendingHref] = useState<string | null>(null);

  useEffect(() => subscribeNavPending(setNavPendingHref), []);

  useEffect(() => {
    if (!authInitialized) return;
    if (!userId) {
      setCloudReady(true);
      return;
    }
    setCloudReady(false);
    void waitForCloudHydration(true).then(() => setCloudReady(true));
  }, [authInitialized, userId]);

  useEffect(() => {
    if (!ready || !cloudReady) return;
    const state = useAppStore.getState();
    if (!state.onboardingComplete && hasUserProgress(state)) {
      useAppStore.getState().repairStateFromLedger();
      return;
    }
    if (!onboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [ready, cloudReady, onboardingComplete, pathname, router]);

  if (!ready || !cloudReady || (!onboardingComplete && !isOnboarding)) {
    return <BootSplash />;
  }

  return (
    <div
      className={cn(
        "mx-auto min-h-dvh",
        isOnboarding
          ? "max-w-none"
          : "max-w-lg pb-24 md:max-w-4xl md:pb-8 md:pt-4"
      )}
    >
      {navPending && navPending !== pathname && (
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/20">
          <div className="h-full w-1/2 animate-pulse bg-primary" />
        </div>
      )}
      {children}
      <BottomNav />
      {onboardingComplete && <OnboardingTour />}
    </div>
  );
}
