"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { waitForCloudHydration } from "@/lib/cloud-hydration";
import { hasUserProgress } from "@/lib/app-state-health";
import { BottomNav } from "./bottom-nav";
import { TabCache } from "./tab-cache";
import { subscribeNavPending } from "./nav-pending";
import { cn } from "@/lib/utils";

const OnboardingTour = dynamic(
  () => import("@/components/onboarding/onboarding-tour").then((m) => m.OnboardingTour),
  { ssr: false }
);

const HYDRATE_FALLBACK_MS = 4000;
const CLOUD_FALLBACK_MS = 8000;

function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const finish = () => setReady(true);
    const unsub = useAppStore.persist.onFinishHydration(finish);
    if (useAppStore.persist.hasHydrated()) finish();
    const fallback = window.setTimeout(finish, HYDRATE_FALLBACK_MS);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);
  return ready;
}

function BootSplash() {
  return (
    <div
      className="boot-splash flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#0a0a0f] text-zinc-400"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(52,211,153,0.16), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(167,139,250,0.12), transparent 55%)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Загрузка"
    >
      <div className="h-8 w-8 animate-pulse rounded-full border-2 border-emerald-500/40 border-t-emerald-400" />
      <p className="text-sm text-zinc-400">Загрузка…</p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const tourComplete = useAppStore((s) => s.tourComplete);
  const ready = useHydrated();
  const authInitialized = useAuthStore((s) => s.initialized);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [cloudReady, setCloudReady] = useState(() => !userId);
  const isOnboarding = pathname === "/onboarding";
  const [navPending, setNavPendingHref] = useState<string | null>(null);
  const [forceBoot, setForceBoot] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setForceBoot(true), 5000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => subscribeNavPending(setNavPendingHref), []);

  useEffect(() => {
    if (!authInitialized) return;

    if (!userId) {
      setCloudReady(true);
      return;
    }

    setCloudReady(false);
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setCloudReady(true);
    };
    const fallback = window.setTimeout(finish, CLOUD_FALLBACK_MS);
    void waitForCloudHydration(true).then(finish);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [authInitialized, userId]);

  useEffect(() => {
    if (!ready || !authInitialized) return;
    const state = useAppStore.getState();
    if (!state.onboardingComplete && hasUserProgress(state)) {
      useAppStore.getState().repairStateFromLedger();
    }
  }, [ready, authInitialized]);

  useLayoutEffect(() => {
    if (!ready || !authInitialized) return;
    if (userId && !cloudReady) return;

    const state = useAppStore.getState();
    if (state.onboardingComplete) return;
    if (hasUserProgress(state)) return;
    if (pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [ready, authInitialized, userId, cloudReady, onboardingComplete, pathname, router]);

  const waitingForCloud = Boolean(userId) && !cloudReady;
  const booting =
    !forceBoot && (!ready || !authInitialized || waitingForCloud);

  if (booting) {
    return <BootSplash />;
  }

  return (
    <div
      className={cn(
        "relative mx-auto min-h-dvh",
        isOnboarding
          ? "max-w-none"
          : "max-w-lg pb-24 pt-12 md:max-w-4xl md:pt-14"
      )}
    >
      {navPending && navPending !== pathname && (
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/20">
          <div className="h-full w-1/2 animate-pulse bg-primary" />
        </div>
      )}
      {!isOnboarding && (
        <div className="no-print pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pb-1 pt-[max(0.375rem,env(safe-area-inset-top))] md:pt-4">
          <div className="pointer-events-none flex w-full max-w-lg justify-end md:max-w-4xl">
            <Link
              href="/settings"
              prefetch
              aria-label="Настройки"
              className={cn(
                "pointer-events-auto relative touch-manipulation",
                "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md hover:text-foreground dark:border-white/10",
                (pathname === "/settings" || pathname === "/profile") && "text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      <TabCache>{children}</TabCache>
      <BottomNav />
      {onboardingComplete && !tourComplete && <OnboardingTour />}
    </div>
  );
}
