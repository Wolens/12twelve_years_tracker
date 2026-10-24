"use client";

import { useEffect } from "react";

const FRAME_IDS = ["nl-badge-frame", "nl-hud-frame"];
const STORAGE_KEYS = ["nl-hud:public:v1", "nl-hud:owner-private:v1"];

function stripNetlifyHud() {
  for (const id of FRAME_IDS) {
    document.getElementById(id)?.remove();
  }
}

/** Netlify injects a “Powered by Netlify” iframe on free public sites. */
export function HideNetlifyBadge() {
  useEffect(() => {
    try {
      for (const key of STORAGE_KEYS) {
        localStorage.setItem(key, "hidden");
      }
    } catch {
      // private mode
    }

    stripNetlifyHud();
    const observer = new MutationObserver(stripNetlifyHud);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
