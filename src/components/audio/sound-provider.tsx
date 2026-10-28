"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { playUiClick } from "@/lib/sfx/play-ui-click";
import { isSoundEnabled } from "@/lib/sfx/audio-engine";

export const SOUND_CHANGE = "twelve-weeks-sound-change";

export function notifySoundPrefChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SOUND_CHANGE));
  }
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const sync = () => setSoundOn(isSoundEnabled());
    sync();
    window.addEventListener(SOUND_CHANGE, sync);
    return () => window.removeEventListener(SOUND_CHANGE, sync);
  }, []);

  useEffect(() => {
    if (!soundOn) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-silent]")) return;
      const interactive = target.closest(
        "button, a[href], input[type='button'], input[type='submit'], [role='button']"
      );
      if (!interactive) return;
      if (interactive instanceof HTMLButtonElement && interactive.disabled) return;
      if (interactive instanceof HTMLInputElement && interactive.disabled) return;
      if (interactive.getAttribute("aria-disabled") === "true") return;
      playUiClick(pathname === "/path");
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, [soundOn, pathname]);

  return children;
}
