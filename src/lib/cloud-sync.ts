import type { AppState } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { hasUserProgress, repairAppState, appStateRichness } from "@/lib/app-state-health";
import { applyRemoteOverGuest, mergeAppStateForSync } from "@/lib/cloud-merge";
import {
  clearGuestSessionDirty,
  isGuestSessionDirty,
} from "@/lib/cloud-guest-session";
import { beginCloudSave, endCloudSave, isCloudSaveInFlight } from "@/lib/cloud-sync-guard";
import { syncNow, syncTs } from "@/lib/sync-timestamp";

export function isAppStateEmpty(state: AppState | null | undefined): boolean {
  if (!state) return true;
  return !hasUserProgress(state);
}

export function localAppStateHasData(state: AppState): boolean {
  return !isAppStateEmpty(state);
}

export const LOGIN_PREFER_REMOTE_KEY = "cloud:login-prefer-remote";

export function localHasGuestScratch(state: AppState): boolean {
  if (isGuestSessionDirty()) return true;
  if (localAppStateHasData(state)) return true;
  const character = state.character;
  if ((state.spheres?.length ?? 0) > 0) return true;
  if (state.onboardingComplete) return true;
  if ((character?.inventory?.length ?? 0) > 0) return true;
  if ((character?.claimedFloorChests?.length ?? 0) > 0) return true;
  if ((character?.coins ?? 0) > 0) return true;
  return false;
}

export function shouldConfirmLoginWipe(local: AppState, remote: AppState | null): boolean {
  if (!remote || isAppStateEmpty(remote)) return false;
  return localHasGuestScratch(local);
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

export async function fetchCloudAppStateBackup(
  userId: string
): Promise<AppState | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("app_state_backup")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[cloud-sync] fetch backup", error.message);
    return null;
  }

  const raw = data?.app_state_backup;
  if (!raw || typeof raw !== "object") return null;
  return repairAppState(raw as AppState);
}

/** Восстановить профиль из app_state_backup (если колонка есть и бэкап не пуст). */
export async function restoreCloudProfileFromBackup(userId: string): Promise<boolean> {
  const backup = await fetchCloudAppStateBackup(userId);
  if (!backup || isAppStateEmpty(backup)) return false;
  const applied = repairAppState(backup);
  useAppStore.getState().importState(applied);
  const result = await saveCloudAppState(userId, applied, { skipBackup: true });
  return result.ok;
}

export async function saveCloudAppState(
  userId: string,
  state: AppState,
  opts?: { skipBackup?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  const payload = { ...state, cloudTouchAt: syncNow() };

  let row: {
    id: string;
    app_state: AppState;
    updated_at: string;
    app_state_backup?: AppState;
  } = {
    id: userId,
    app_state: payload,
    updated_at: new Date().toISOString(),
  };

  if (!opts?.skipBackup) {
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("app_state")
      .eq("id", userId)
      .maybeSingle();
    const prev = existing?.app_state;
    if (prev && typeof prev === "object") {
      row = { ...row, app_state_backup: prev as AppState };
    }
  }

  const { error } = await supabase.from("user_profiles").upsert(row, { onConflict: "id" });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

function mergeAndApply(local: AppState, remote: AppState): AppState {
  return repairAppState(mergeAppStateForSync(local, remote));
}

/** Подтянуть облако только если там явно более свежий снимок (другое устройство). */
export async function pullCloudStateIntoApp(userId: string): Promise<boolean> {
  if (isCloudSaveInFlight()) return false;
  const remote = await fetchCloudAppState(userId);
  if (!remote || isAppStateEmpty(remote)) return false;
  const local = repairAppState(useAppStore.getState().exportState());
  const localTouch = syncTs(local.cloudTouchAt);
  const remoteTouch = syncTs(remote.cloudTouchAt);
  if (remoteTouch <= localTouch) return false;
  const merged = repairAppState(
    mergeAppStateForSync(local, remote, { preferLocalUi: true })
  );
  useAppStore.getState().importState(merged);
  return true;
}

/** После входа: облако — источник правды; гостевую сессию не сливаем и не заливаем в Supabase. */
export async function hydrateAppStateFromCloud(userId: string): Promise<void> {
  const remote = await fetchCloudAppState(userId);
  const local = repairAppState(useAppStore.getState().exportState());

  const hasRemote = remote && !isAppStateEmpty(remote);
  const hasLocal = localAppStateHasData(local);
  const guestScratch = localHasGuestScratch(local);

  sessionStorage.removeItem(LOGIN_PREFER_REMOTE_KEY);

  if (hasRemote && guestScratch) {
    const applied = repairAppState(applyRemoteOverGuest(local, remote));
    useAppStore.getState().importState(applied);
    clearGuestSessionDirty();
    return;
  }

  if (hasRemote && hasLocal) {
    const merged = mergeAndApply(local, remote);
    useAppStore.getState().importState(merged);
    clearGuestSessionDirty();
    return;
  }

  if (hasRemote) {
    useAppStore.getState().importState(repairAppState(remote));
    clearGuestSessionDirty();
    return;
  }

  if (hasLocal) {
    await saveCloudAppState(userId, local);
    clearGuestSessionDirty();
  }
}

/** Сохранение: merge с облаком только если там явно более свежий снимок; иначе локальный (удаления не откатываем). */
export async function saveCloudAppStateSafe(
  userId: string,
  state: AppState
): Promise<void> {
  beginCloudSave();
  try {
    const savedAt = syncNow();
    const remote = await fetchCloudAppState(userId);
    const exported = repairAppState(useAppStore.getState().exportState());

    if (!remote || isAppStateEmpty(remote)) {
      const toSave = { ...exported, cloudTouchAt: savedAt };
      await saveCloudAppState(userId, toSave);
      useAppStore.setState({ cloudTouchAt: savedAt });
      return;
    }

    const localTouch = syncTs(exported.cloudTouchAt);
    const remoteTouch = syncTs(remote.cloudTouchAt);

    if (localTouch >= remoteTouch) {
      const toSave = { ...exported, cloudTouchAt: savedAt };
      await saveCloudAppState(userId, toSave);
      useAppStore.setState({ cloudTouchAt: savedAt });
      return;
    }

    const merged = mergeAndApply(exported, remote);

    if (
      (localHasGuestScratch(exported) || isGuestSessionDirty()) &&
      appStateRichness(merged) < appStateRichness(remote) - 2
    ) {
      useAppStore.getState().importState(repairAppState(remote));
      useAppStore.setState({
        cloudTouchAt: remote.cloudTouchAt ?? savedAt,
      });
      return;
    }

    const toSave = { ...merged, cloudTouchAt: savedAt };
    const result = await saveCloudAppState(userId, toSave);
    if (result.ok) {
      useAppStore.setState({ cloudTouchAt: savedAt });
    }
  } finally {
    endCloudSave();
  }
}
