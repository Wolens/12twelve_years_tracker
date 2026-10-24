import type { AppState } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";

export function isAppStateEmpty(state: AppState | null | undefined): boolean {
  if (!state) return true;
  return (
    !state.onboardingComplete &&
    state.goals.length === 0 &&
    state.spheres.length === 0
  );
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
  return raw as AppState;
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

/** После входа: сервер — источник правды, если там уже есть данные; иначе заливаем локальный снимок. */
export async function hydrateAppStateFromCloud(userId: string): Promise<void> {
  const remote = await fetchCloudAppState(userId);
  const local = useAppStore.getState().exportState();

  if (remote && !isAppStateEmpty(remote)) {
    useAppStore.getState().importState(remote);
    return;
  }

  if (localAppStateHasData(local)) {
    await saveCloudAppState(userId, local);
    return;
  }

  if (remote) {
    useAppStore.getState().importState(remote);
  }
}
