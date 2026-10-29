import type { AppState } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { hasUserProgress, repairAppState } from "@/lib/app-state-health";
import { mergeAppStateForSync } from "@/lib/cloud-merge";
import { syncNow } from "@/lib/sync-timestamp";

export function isAppStateEmpty(state: AppState | null | undefined): boolean {
  if (!state) return true;
  return !hasUserProgress(state);
}

export function localAppStateHasData(state: AppState): boolean {
  return !isAppStateEmpty(state);
}

export async function fetchCloudAppState(
  userId: string
): Promise<AppState | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("app_state")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[cloud-sync] fetch", error.message);
    return null;
  }

  const raw = data?.app_state;
  if (!raw || typeof raw !== "object") return null;
  return repairAppState(raw as AppState);
}

export async function saveCloudAppState(
  userId: string,
  state: AppState
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  const payload = { ...state, cloudTouchAt: syncNow() };
  const { error } = await supabase.from("user_profiles").upsert(
    {
      id: userId,
      app_state: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

function mergeAndApply(local: AppState, remote: AppState): AppState {
  return repairAppState(mergeAppStateForSync(local, remote));
}

/** Подтянуть облако и слить с локальным (без записи). */
export async function pullCloudStateIntoApp(userId: string): Promise<boolean> {
  const remote = await fetchCloudAppState(userId);
  if (!remote || isAppStateEmpty(remote)) return false;
  const local = repairAppState(useAppStore.getState().exportState());
  const merged = mergeAndApply(local, remote);
  useAppStore.getState().importState(merged);
  return true;
}

/** После входа: сливаем локальное и облако, сохраняем общий результат. */
export async function hydrateAppStateFromCloud(userId: string): Promise<void> {
  const remote = await fetchCloudAppState(userId);
  const local = repairAppState(useAppStore.getState().exportState());

  const hasRemote = remote && !isAppStateEmpty(remote);
  const hasLocal = localAppStateHasData(local);

  if (hasRemote && hasLocal) {
    const merged = mergeAndApply(local, remote);
    useAppStore.getState().importState(merged);
    await saveCloudAppState(userId, merged);
    return;
  }

  if (hasRemote) {
    useAppStore.getState().importState(mergeAndApply(local, remote));
    return;
  }

  if (hasLocal) {
    await saveCloudAppState(userId, local);
  }
}

/** Сохранение: всегда merge с облаком, затем upsert — чтобы не затирать правки с других устройств. */
export async function saveCloudAppStateSafe(
  userId: string,
  state: AppState
): Promise<void> {
  const local = repairAppState({ ...state, cloudTouchAt: syncNow() });
  const remote = await fetchCloudAppState(userId);

  if (!remote || isAppStateEmpty(remote)) {
    await saveCloudAppState(userId, local);
    return;
  }

  const merged = mergeAndApply(local, remote);
  const result = await saveCloudAppState(userId, merged);
  if (result.ok) {
    useAppStore.getState().importState(merged);
  }
}
