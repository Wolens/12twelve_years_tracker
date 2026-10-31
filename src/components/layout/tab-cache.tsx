"use client";

import { memo, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TabLiveContext } from "@/store/tab-live";
import { subscribeNavPending } from "./nav-pending";
import {
  getTabPage,
  loadTab,
  preloadAllTabs,
  tabKeyFromPath,
  type TabKey,
} from "./tab-pages";

function remember(list: TabKey[], key: TabKey | null) {
  if (!key || list.includes(key)) return list;
  return [...list, key];
}

const TabSlot = memo(function TabSlot({ tab, active }: { tab: TabKey; active: boolean }) {
  const [, setTick] = useState(0);
  const Page = getTabPage(tab);

  useEffect(() => {
    if (Page) return;
    let cancel = false;
    void loadTab(tab).then(() => {
      if (!cancel) setTick((n) => n + 1);
    });
    return () => {
      cancel = true;
    };
  }, [Page, tab]);

  if (!Page) {
    return active ? <div className="min-h-[40dvh]" aria-hidden /> : null;
  }

  return (
    <TabLiveContext.Provider value={active}>
      <div className={active ? undefined : "hidden"} inert={active ? undefined : true}>
        <Suspense fallback={active ? <div className="min-h-[40dvh]" aria-hidden /> : null}>
          <Page />
        </Suspense>
      </div>
    </TabLiveContext.Provider>
  );
});

/**
 * Вкладки остаются смонтированными после первого открытия.
 * Скрытые не перерисовываются, пока их снова не выберут.
 */
export function TabCache({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeKey = tabKeyFromPath(pathname);
  const [pending, setPending] = useState<string | null>(null);
  const [visited, setVisited] = useState<TabKey[]>(() => (activeKey ? [activeKey] : []));
  const scrolls = useRef(new Map<string, number>());
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useLayoutEffect(() => subscribeNavPending(setPending), []);

  const pendingKey = tabKeyFromPath(pending);
  const shownKey =
    pendingKey && pendingKey !== activeKey && visited.includes(pendingKey) ? pendingKey : activeKey;
  const mounted = remember(remember(visited, activeKey), shownKey);

  useEffect(() => {
    setVisited((prev) => {
      const next = remember(remember(prev, activeKey), shownKey);
      return next === prev ? prev : next;
    });
  }, [activeKey, shownKey]);

  useEffect(() => {
    const id = window.setTimeout(preloadAllTabs, 200);
    return () => window.clearTimeout(id);
  }, []);

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
      const key = tabKeyFromPath(pathRef.current);
      if (key && key !== "/path") scrolls.current.set(key, window.scrollY);
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
      {mounted.map((key) => (
        <TabSlot key={key} tab={key} active={key === shownKey} />
      ))}
      {shownKey == null && children}
    </div>
  );
}

function applyScroll(key: string | null, scrolls: Map<string, number>) {
  if (!key || key === "/path") return;
  const saved = scrolls.get(key);
  window.scrollTo(0, saved ?? 0);
}
