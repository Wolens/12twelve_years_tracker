"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Бывший раздел «Цели» — теперь вкладка на странице героя. */
export default function GoalsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/hero?tab=goals", { scroll: false });
  }, [router]);

  return null;
}
