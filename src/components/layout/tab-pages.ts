"use client";

import type { ComponentType } from "react";

export const TAB_HREFS = ["/", "/today", "/hero", "/path", "/stats"] as const;
export type TabKey = (typeof TAB_HREFS)[number];

const loaders: Record<TabKey, () => Promise<{ default: ComponentType }>> = {
  "/": () => import("@/app/page"),
  "/today": () => import("@/app/today/page"),
  "/hero": () => import("@/components/hero/hero-screen").then((m) => ({ default: m.HeroScreen })),
  "/path": () => import("@/app/path/page"),
  "/stats": () => import("@/app/stats/page"),
};

const pages = new Map<TabKey, ComponentType>();
const inflight = new Map<TabKey, Promise<void>>();

export function tabKeyFromPath(pathname: string | null): TabKey | null {
  if (!pathname) return null;
  const path = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return (TAB_HREFS as readonly string[]).includes(path) ? (path as TabKey) : null;
}

export function getTabPage(key: TabKey): ComponentType | undefined {
  return pages.get(key);
}

export function loadTab(key: TabKey): Promise<void> {
  if (pages.has(key)) return Promise.resolve();
  const pending = inflight.get(key);
  if (pending) return pending;
  const next = loaders[key]()
    .then((mod) => {
      pages.set(key, mod.default);
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, next);
  return next;
}

function preloadHeavy(key: TabKey) {
  if (key === "/path") void import("@/components/hero/tower-board");
  if (key === "/stats") void import("@/components/stats/stats-xp-chart");
}

export function preloadTab(href: string) {
  const key = tabKeyFromPath(href);
  if (!key) return;
  void loadTab(key);
  preloadHeavy(key);
}

export function preloadAllTabs() {
  for (const key of TAB_HREFS) {
    void loadTab(key);
    preloadHeavy(key);
  }
}

if (typeof window !== "undefined") {
  const current = tabKeyFromPath(window.location.pathname);
  if (current) {
    void loadTab(current);
    preloadHeavy(current);
  }
  const rest = () => preloadAllTabs();
  window.requestIdleCallback?.(rest, { timeout: 1200 });
  if (!window.requestIdleCallback) window.setTimeout(rest, 400);
}
