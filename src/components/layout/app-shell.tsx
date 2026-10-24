"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { BottomNav } from "./bottom-nav";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setReady(true));
    if (useAppStore.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  return ready;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const ready = useHydrated();

  useEffect(() => {
    if (!ready) return;
    if (!onboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [ready, onboardingComplete, pathname, router]);

  return (
    <div className="mx-auto min-h-dvh max-w-lg pb-24 md:max-w-4xl md:pb-8 md:pt-4">
      {children}
      <BottomNav />
      {onboardingComplete && <OnboardingTour />}
    </div>
  );
}
