import { Suspense } from "react";
import { HeroScreen } from "@/components/hero/hero-screen";

export default function HeroPage() {
  return (
    <Suspense fallback={<div className="min-h-[40dvh]" aria-hidden />}>
      <HeroScreen />
    </Suspense>
  );
}
