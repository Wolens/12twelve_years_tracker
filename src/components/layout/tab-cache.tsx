"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { subscribeNavPending } from "./nav-pending";
import DashboardPage from "@/app/page";
import TodayPage from "@/app/today/page";
import PathPage from "@/app/path/page";
import StatsPage from "@/app/stats/page";
import { HeroScreen } from "@/components/hero/hero-screen";

const TABS = ["/", "/today", "/hero", "/path", "/stats"] as const;
type TabKey = (typeof TABS)[number];

const PAGES: Record<TabKey, ComponentType> = {
  "/": DashboardPage,
  "/today": TodayPage,
  "/hero": HeroTab,
  "/path": PathPage,
  "/stats": StatsPage,
};

function HeroTab() {
  return (
    <Suspense fallback={<div className="min-h-[40dvh]" aria-hidden />}>
      <HeroScreen />
    </Suspense>
  );
}

function tabKey(pathname: string | null): TabKey | null {
  if (!pathname) return null;
  const path = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return (TABS as readonly string[]).includes(path) ? (path as TabKey) : null;
}

function remember(list: TabKey[], key: TabKey | null) {
  if (!key || list.includes(key)) return list;
  return [...list, key];
}

/**
 * Main tabs stay mounted after the first visit. The next switch only
 * shows the tree that is already on the page and restores its scroll.
 */
export function TabCache({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeKey = tabKey(pathname);
  const [pending, setPending] = useState<string | null>(null);
  const [visited, setVisited] = useState<TabKey[]>(() => (activeKey ? [activeKey] : []));
  const scrolls = useRef(new Map<string, number>());
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useLayoutEffect(() => subscribeNavPending(setPending), []);

  const pendingKey = tabKey(pending);
  const shownKey =
    pendingKey && pendingKey !== activeKey && visited.includes(pendingKey) ? pendingKey : activeKey;
  const mounted = remember(remember(visited, activeKey), shownKey);

  useEffect(() => {
    setVisited((prev) => {
      const next = remember(remember(prev, activeKey), shownKey);
      return next === prev ? prev : next;
    });
  }, [activeKey, shownKey]);

  useLayoutEffect(() => {
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const key = tabKey(pathRef.current);
      if (key) scrolls.current.set(key, window.scrollY);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  useLayoutEffect(() => {
    applyScroll(shownKey, scrolls.current);
  }, [shownKey]);

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      applyScroll(shownKey, scrolls.current);
      second = requestAnimationFrame(() => applyScroll(shownKey, scrolls.current));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [shownKey, pathname]);

  return (
    <div className="relative z-0">
      {mounted.map((key) => {
        const Page = PAGES[key];
        const visible = key === shownKey;
        return (
          <div key={key} className={visible ? undefined : "hidden"} inert={visible ? undefined : true}>
            <Page />
          </div>
        );
      })}
      {shownKey == null && children}
    </div>
  );
}

function applyScroll(key: string | null, scrolls: Map<string, number>) {
  if (!key) return;
  const saved = scrolls.get(key);
  if (saved != null) {
    window.scrollTo(0, saved);
    return;
  }
  if (key !== "/path") window.scrollTo(0, 0);
}
