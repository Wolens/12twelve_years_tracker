import type { AppState } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { appStateRichness, hasUserProgress, repairAppState } from "@/lib/app-state-health";

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
  const { error } = await supabase.from("user_profiles").upsert(
    {
      id: userId,
      app_state: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** После входа: выбираем более полный снимок; никогда не заливаем «пустой» локальный поверх облака. */
export async function hydrateAppStateFromCloud(userId: string): Promise<void> {
  const remote = await fetchCloudAppState(userId);
  const local = repairAppState(useAppStore.getState().exportState());

  const remoteScore = appStateRichness(remote);
  const localScore = appStateRichness(local);

  if (remote && remoteScore >= localScore && !isAppStateEmpty(remote)) {
    useAppStore.getState().importState(remote);
    return;
  }

  if (localAppStateHasData(local)) {
    if (remote && remoteScore > localScore) {
      useAppStore.getState().importState(remote);
      return;
    }
    await saveCloudAppState(userId, local);
    return;
  }

  if (remote) {
    useAppStore.getState().importState(remote);
  }
}

/** Перед сохранением: не перезаписывать богатое облако бедным локальным снимком. */
export async function saveCloudAppStateSafe(
  userId: string,
  state: AppState
): Promise<void> {
  const repaired = repairAppState(state);
  const remote = await fetchCloudAppState(userId);
  if (remote && appStateRichness(remote) > appStateRichness(repaired) + 5) {
    useAppStore.getState().importState(remote);
    return;
  }
  await saveCloudAppState(userId, repaired);
}
