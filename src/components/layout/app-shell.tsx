"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { hasUserProgress } from "@/lib/app-state-health";
import { ritualClaimedToday } from "@/lib/daily-engagement";
import { hasDailyEntryRouted, markDailyEntryRouted } from "@/lib/daily-entry";
import { BottomNav } from "./bottom-nav";
import { TabCache } from "./tab-cache";
import { subscribeNavPending } from "./nav-pending";
import { cn } from "@/lib/utils";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";

const OnboardingTour = dynamic(
  () => import("@/components/onboarding/onboarding-tour").then((m) => m.OnboardingTour),
  { ssr: false }
);

const CharacterSetupDialog = dynamic(
  () =>
    import("@/components/hero/character-setup-dialog").then(
      (m) => m.CharacterSetupDialog
    ),
  { ssr: false }
);

const HYDRATE_FALLBACK_MS = 800;
const BOOT_FORCE_SHOW_MS = 2000;

function useHydrated() {
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && useAppStore.persist.hasHydrated()
  );
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

function BootSplash({ stalled }: { stalled?: boolean }) {
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
      {stalled && (
        <p className="max-w-xs px-4 text-center text-xs text-zinc-500">
          Дольше обычного? После правок в dev нажми{" "}
          <strong className="text-zinc-400">Ctrl+Shift+R</strong> или перезапусти{" "}
          <code className="text-violet-300/90">npm run dev:clean</code>
        </p>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const tourComplete = useAppStore((s) => s.tourComplete);
  const identitySetupDone = useAppStore(
    (s) => normalizeCharacter(s.character).identitySetupDone
  );
  const ready = useHydrated();
  const authInitialized = useAuthStore((s) => s.initialized);
  const isOnboarding = pathname === "/onboarding";
  const [navPending, setNavPendingHref] = useState<string | null>(null);
  const [forceBoot, setForceBoot] = useState(false);
  const [splashStalled, setSplashStalled] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setForceBoot(true), BOOT_FORCE_SHOW_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setSplashStalled(true), 5000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => subscribeNavPending(setNavPendingHref), []);

  useEffect(() => {
    if (!ready || !authInitialized) return;
    const state = useAppStore.getState();
    if (!state.onboardingComplete && hasUserProgress(state)) {
      useAppStore.getState().repairStateFromLedger();
    }
  }, [ready, authInitialized]);

  useLayoutEffect(() => {
    if (!ready || !authInitialized) return;

    const state = useAppStore.getState();
    if (state.onboardingComplete) return;
    if (hasUserProgress(state)) return;
    if (pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [ready, authInitialized, onboardingComplete, pathname, router]);

  useLayoutEffect(() => {
    if (!ready || !authInitialized) return;

    const state = useAppStore.getState();
    if (!state.onboardingComplete || !state.tourComplete) return;
    if (!normalizeCharacter(state.character).identitySetupDone) return;
    if (ritualClaimedToday(state.profile)) return;
    if (hasDailyEntryRouted()) return;
    if (pathname === "/onboarding" || pathname.startsWith("/auth")) return;

    markDailyEntryRouted();
    if (pathname !== "/path") {
      router.replace("/path");
    }
  }, [ready, authInitialized, onboardingComplete, tourComplete, pathname, router]);

  const booting = !forceBoot && (!ready || !authInitialized);

  if (booting) {
    return <BootSplash stalled={splashStalled} />;
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
      {onboardingComplete && !identitySetupDone && !isOnboarding && (
        <CharacterSetupDialog />
      )}
      {onboardingComplete && identitySetupDone && !tourComplete && (
        <OnboardingTour />
      )}
    </div>
  );
}
