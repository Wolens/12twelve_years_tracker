import type { AppState, Profile, Sphere, XpLedgerEntry } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { appStateRichness, hasUserProgress, repairAppState } from "@/lib/app-state-health";
import { resolveSphereFilterId } from "@/lib/sphere-filter-default";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import { reconcileProfileDailyEngagement, dedupeXpLedger } from "@/lib/daily-engagement";
import { syncProfileFromLedger } from "@/lib/xp-ledger";

function mergeCharacterIdentity(local: AppState, remote: AppState): AppState["character"] {
  const localChar = normalizeCharacter(local.character);
  const remoteChar = normalizeCharacter(remote.character);
  if (localChar.identitySetupDone && !remoteChar.identitySetupDone) {
    return {
      ...remoteChar,
      gender: localChar.gender ?? remoteChar.gender,
      birthDate: localChar.birthDate ?? remoteChar.birthDate,
      identitySetupDone: true,
    };
  }
  return remoteChar.identitySetupDone ? remoteChar : localChar;
}

function mergeLedger(local: XpLedgerEntry[], remote: XpLedgerEntry[]): XpLedgerEntry[] {
  const byKey = new Map<string, XpLedgerEntry>();
  for (const entry of remote) byKey.set(entry.sourceId || entry.id, entry);
  for (const entry of local) {
    const key = entry.sourceId || entry.id;
    if (!byKey.has(key)) byKey.set(key, entry);
  }
  return dedupeXpLedger(Array.from(byKey.values()));
}

function mergeProfiles(local: Profile, remote: Profile): Profile {
  const lastRitualDate = [local.lastRitualDate, remote.lastRitualDate]
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1) ?? null;
  const lastActivityDate = [local.lastActivityDate, remote.lastActivityDate]
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1) ?? null;
  return reconcileProfileDailyEngagement(
    syncProfileFromLedger({
      ...remote,
      streak: Math.max(local.streak ?? 0, remote.streak ?? 0),
      lastActivityDate,
      lastRitualDate,
      dailyQuestClaimDate: [local.dailyQuestClaimDate, remote.dailyQuestClaimDate]
        .filter((d): d is string => Boolean(d))
        .sort()
        .at(-1) ?? null,
      xpLedger: mergeLedger(local.xpLedger ?? [], remote.xpLedger ?? []),
    })
  );
}

function mergeSpheres(local: Sphere[], remote: Sphere[]): Sphere[] {
  const remoteById = new Map(remote.map((s) => [s.id, s]));
  const seen = new Set<string>();
  const merged: Sphere[] = [];

  for (const ls of local) {
    seen.add(ls.id);
    const rs = remoteById.get(ls.id);
    merged.push(rs ? { ...rs, ...ls } : ls);
  }
  for (const rs of remote) {
    if (!seen.has(rs.id)) merged.push(rs);
  }
  if (merged.length > 0) return merged;
  return local.length > 0 ? local : remote;
}

function mergePreferringIdentity(
  local: AppState,
  remote: AppState,
  opts?: { preferLocalUi?: boolean }
): AppState {
  const spheres = mergeSpheres(local.spheres ?? [], remote.spheres ?? []);
  const merged: AppState = {
    ...remote,
    spheres,
    character: mergeCharacterIdentity(local, remote),
    profile: mergeProfiles(local.profile, remote.profile),
    weekFilterSphereId: resolveSphereFilterId(
      spheres,
      local.weekFilterSphereId || remote.weekFilterSphereId
    ),
    goalsFilterSphereId: resolveSphereFilterId(
      spheres,
      local.goalsFilterSphereId || remote.goalsFilterSphereId
    ),
  };
  if (!opts?.preferLocalUi) return merged;
  return {
    ...merged,
    weekFilterSphereId: resolveSphereFilterId(spheres, local.weekFilterSphereId || merged.weekFilterSphereId),
    goalsFilterSphereId: resolveSphereFilterId(
      spheres,
      local.goalsFilterSphereId || merged.goalsFilterSphereId
    ),
    theme: local.theme,
    activeWeek: local.activeWeek,
    activeDay: local.activeDay,
    weeks: local.weeks,
  };
}

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

  const hasRemote = remote && !isAppStateEmpty(remote);
  const hasLocal = localAppStateHasData(local);

  if (hasRemote && hasLocal) {
    const merged = repairAppState(mergePreferringIdentity(local, remote));
    useAppStore.getState().importState(merged);
    await saveCloudAppState(userId, merged);
    return;
  }

  if (hasRemote) {
    useAppStore.getState().importState(
      repairAppState(mergePreferringIdentity(local, remote))
    );
    return;
  }

  if (hasLocal) {
    await saveCloudAppState(userId, local);
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
    useAppStore.getState().importState(
      mergePreferringIdentity(repaired, remote, { preferLocalUi: true })
    );
    return;
  }
  const profile = remote
    ? mergeProfiles(repaired.profile, remote.profile)
    : reconcileProfileDailyEngagement(repaired.profile);
  const toSave = repairAppState({ ...repaired, profile });
  const result = await saveCloudAppState(userId, toSave);
  if (result.ok && remote) {
    const mergedProfile = toSave.profile;
    const current = useAppStore.getState().profile;
    if (
      current.xp !== mergedProfile.xp ||
      current.lastRitualDate !== mergedProfile.lastRitualDate
    ) {
      useAppStore.setState({ profile: mergedProfile });
    }
  }
}
