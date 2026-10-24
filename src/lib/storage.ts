import type { AppState } from "@/types";
import { STORAGE_KEY, DATA_VERSION } from "@/types";

/** Локальный снимок (гость); при входе — синхронизация через cloud-sync + Supabase */
export interface PersistenceAdapter {
  load(): AppState | null;
  save(state: AppState): void;
}

export const localStorageAdapter: PersistenceAdapter = {
  load() {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: AppState };
      const state = parsed.state ?? (parsed as AppState);
      if (state.version !== DATA_VERSION) return null;
      return state;
    } catch {
      return null;
    }
  },
  save(state: AppState) {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { ...state, version: DATA_VERSION } })
    );
  },
};
