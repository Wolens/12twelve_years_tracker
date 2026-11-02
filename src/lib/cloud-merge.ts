import type { AppState, DayAssignments, HabitCompletions, Profile, WeekData, XpLedgerEntry } from "@/types";
import { resolveSphereFilterId } from "@/lib/sphere-filter-default";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import { reconcileProfileDailyEngagement, dedupeXpLedger } from "@/lib/daily-engagement";
import { syncProfileFromLedger } from "@/lib/xp-ledger";
import { mergeRecordsByUpdatedAt, syncTs } from "@/lib/sync-timestamp";

function mergeCharacterIdentity(
  local: AppState,
  remote: AppState,
  preferLocalTouch: boolean
): AppState["character"] {
  const localChar = normalizeCharacter(local.character);
  const remoteChar = normalizeCharacter(remote.character);
  let base: AppState["character"];
  if (localChar.identitySetupDone && !remoteChar.identitySetupDone) {
    base = {
      ...remoteChar,
      gender: localChar.gender ?? remoteChar.gender,
      birthDate: localChar.birthDate ?? remoteChar.birthDate,
      identitySetupDone: true,
    };
  } else {
    base = remoteChar.identitySetupDone ? remoteChar : localChar;
  }

  const claimedFloorChests = Array.from(
    new Set([...(localChar.claimedFloorChests ?? []), ...(remoteChar.claimedFloorChests ?? [])])
  ).sort((a, b) => a - b);
  const inventory = preferLocalTouch
    ? Array.from(new Set(localChar.inventory ?? []))
    : Array.from(new Set([...(localChar.inventory ?? []), ...(remoteChar.inventory ?? [])]));
  const equipped = preferLocalTouch
    ? { ...(localChar.equipped ?? {}) }
    : { ...(remoteChar.equipped ?? {}), ...(localChar.equipped ?? {}) };
  const claimedLevelRewards = Array.from(
    new Set([
      ...(localChar.claimedLevelRewards ?? []),
      ...(remoteChar.claimedLevelRewards ?? []),
    ])
  );

  return {
    ...base,
    claimedFloorChests,
    inventory,
    equipped,
    claimedLevelRewards,
    coins: Math.max(localChar.coins ?? 0, remoteChar.coins ?? 0),
  };
}

/** После входа: данные аккаунта, без гостевых нажатий на этом устройстве. */
export function applyRemoteOverGuest(_local: AppState, remote: AppState): AppState {
  return {
    ...remote,
    theme: _local.theme,
  };
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

export function mergeProfiles(local: Profile, remote: Profile): Profile {
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

export function mergeWeeksData(local: WeekData[], remote: WeekData[]): WeekData[] {
  const byNum = new Map<number, WeekData>();
  for (const w of [...remote, ...local]) {
    const prev = byNum.get(w.number);
    if (!prev) {
      byNum.set(w.number, { ...w });
      continue;
    }
    const reflection =
      (w.reflection?.note?.trim() ? w.reflection : null) ??
      (prev.reflection?.note?.trim() ? prev.reflection : null) ??
      w.reflection ??
      prev.reflection;
    byNum.set(w.number, {
      number: w.number,
      closed: prev.closed || w.closed,
      bonusAwarded: prev.bonusAwarded || w.bonusAwarded,
      reflection,
    });
  }
  return Array.from(byNum.values()).sort((a, b) => a.number - b.number);
}

export function mergeDayAssignments(
  local: DayAssignments,
  remote: DayAssignments,
  preferLocal: boolean
): DayAssignments {
  const source = preferLocal ? local : remote;
  const out: DayAssignments = {};
  for (const key of Object.keys(source ?? {})) {
    out[key] = [...(source[key] ?? [])];
  }
  return out;
}

export function mergeHabitCompletions(
  local: HabitCompletions,
  remote: HabitCompletions,
  preferLocal: boolean
): HabitCompletions {
  if (preferLocal) {
    const out: HabitCompletions = {};
    for (const [date, day] of Object.entries(local ?? {})) {
      if (day && typeof day === "object") out[date] = { ...day };
    }
    return out;
  }

  const out: HabitCompletions = {};
  const dates = Array.from(
    new Set([...Object.keys(local ?? {}), ...Object.keys(remote ?? {})])
  );
  for (const date of dates) {
    const lDay = local?.[date] ?? {};
    const rDay = remote?.[date] ?? {};
    const habitIds = Array.from(
      new Set([...Object.keys(lDay), ...Object.keys(rDay)])
    );
    const merged: Record<string, number> = {};
    for (const habitId of habitIds) {
      const l = lDay[habitId] ?? 0;
      const r = rDay[habitId] ?? 0;
      const n = Math.max(
        typeof l === "number" ? l : 0,
        typeof r === "number" ? r : 0
      );
      if (n > 0) merged[habitId] = n;
    }
    if (Object.keys(merged).length > 0) out[date] = merged;
  }
  return out;
}

function unionStrings(a: string[] | undefined, b: string[] | undefined): string[] {
  return Array.from(new Set([...(a ?? []), ...(b ?? [])]));
}

/** Слияние локального и облачного снимков; при конфликте — более свежий updatedAt. */
export function mergeAppStateForSync(
  local: AppState,
  remote: AppState,
  opts?: { preferLocalUi?: boolean }
): AppState {
  const habits = mergeRecordsByUpdatedAt(local.habits ?? [], remote.habits ?? []);

  const localTouch = syncTs(local.cloudTouchAt);
  const remoteTouch = syncTs(remote.cloudTouchAt);
  const preferLocalTouch = localTouch >= remoteTouch;
  const base = remoteTouch > localTouch ? remote : local;
  const other = base === local ? remote : local;

  let spheres = mergeRecordsByUpdatedAt(local.spheres ?? [], remote.spheres ?? []);
  let goals = mergeRecordsByUpdatedAt(local.goals ?? [], remote.goals ?? []);
  let cycleTasks = mergeRecordsByUpdatedAt(
    local.cycleTasks ?? [],
    remote.cycleTasks ?? []
  );

  if (preferLocalTouch) {
    const localSphereIds = new Set((local.spheres ?? []).map((s) => s.id));
    const localTaskIds = new Set((local.cycleTasks ?? []).map((t) => t.id));
    const localGoalIds = new Set((local.goals ?? []).map((g) => g.id));
    spheres = spheres.filter((s) => localSphereIds.has(s.id));
    goals = goals.filter((g) => localGoalIds.has(g.id));
    cycleTasks = cycleTasks.filter((t) => localTaskIds.has(t.id));
  }

  const merged: AppState = {
    ...base,
    version: Math.max(local.version ?? 0, remote.version ?? 0),
    spheres,
    goals,
    cycleTasks,
    habits,
    weeks: mergeWeeksData(base.weeks ?? [], other.weeks ?? []),
    profile: mergeProfiles(local.profile, remote.profile),
    character: mergeCharacterIdentity(local, remote, preferLocalTouch),
    dayAssignments: mergeDayAssignments(
      local.dayAssignments ?? {},
      remote.dayAssignments ?? {},
      preferLocalTouch
    ),
    habitCompletions: mergeHabitCompletions(
      local.habitCompletions ?? {},
      remote.habitCompletions ?? {},
      preferLocalTouch
    ),
    hiddenSphereIds: unionStrings(local.hiddenSphereIds, remote.hiddenSphereIds),
    weekHiddenSphereIds: unionStrings(
      local.weekHiddenSphereIds,
      remote.weekHiddenSphereIds
    ),
    weekFilterSphereId: resolveSphereFilterId(
      spheres,
      local.weekFilterSphereId || remote.weekFilterSphereId
    ),
    goalsFilterSphereId: resolveSphereFilterId(
      spheres,
      local.goalsFilterSphereId || remote.goalsFilterSphereId
    ),
    cloudTouchAt:
      [local.cloudTouchAt, remote.cloudTouchAt]
        .filter((d): d is string => Boolean(d))
        .sort()
        .at(-1) ?? base.cloudTouchAt,
  };

  if (!opts?.preferLocalUi) return merged;

  return {
    ...merged,
    weekFilterSphereId: resolveSphereFilterId(
      spheres,
      local.weekFilterSphereId || merged.weekFilterSphereId
    ),
    goalsFilterSphereId: resolveSphereFilterId(
      spheres,
      local.goalsFilterSphereId || merged.goalsFilterSphereId
    ),
    theme: local.theme,
    activeWeek: local.activeWeek,
    activeDay: local.activeDay,
  };
}
