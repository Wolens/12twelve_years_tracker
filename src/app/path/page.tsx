"use client";

import dynamic from "next/dynamic";

const TowerBoard = dynamic(
  () => import("@/components/hero/tower-board").then((m) => m.TowerBoard),
  {
    ssr: false,
    loading: () => <div className="min-h-[100dvh] bg-[#06080c]" aria-hidden />,
  }
);

export default function PathPage() {
  return (
    <div className="w-full overflow-x-hidden pb-8">
      <TowerBoard />
    </div>
  );
}
