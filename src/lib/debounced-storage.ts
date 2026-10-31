import type { PersistStorage, StorageValue } from "zustand/middleware";

const FLUSH_MS = 400;

/**
 * Запись в localStorage откладывается: JSON.stringify всего прогресса
 * не блокирует клик. Перед закрытием вкладки снимок сбрасывается сразу.
 */
export function createDebouncedPersistStorage<S>(): PersistStorage<S> {
  let timer: number | undefined;
  let pending: { name: string; value: StorageValue<S> } | null = null;

  const flush = () => {
    if (typeof window === "undefined" || !pending) return;
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    const { name, value } = pending;
    pending = null;
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Приватный режим или переполненная квота — интерфейс остаётся рабочим.
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }

  return {
    getItem: (name) => {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StorageValue<S>;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      pending = { name, value };
      if (typeof window === "undefined") return;
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(flush, FLUSH_MS);
    },
    removeItem: (name) => {
      if (pending?.name === name) pending = null;
      if (typeof window === "undefined") return;
      localStorage.removeItem(name);
    },
  };
}
