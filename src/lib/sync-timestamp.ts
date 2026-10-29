export function syncNow(): string {
  return new Date().toISOString();
}

export function syncTs(iso?: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export type SyncedEntity = { id: string; updatedAt?: string };

/** Объединить списки сущностей: при том же id побеждает более свежий updatedAt. */
export function mergeRecordsByUpdatedAt<T extends SyncedEntity>(
  local: T[],
  remote: T[]
): T[] {
  const remoteById = new Map(remote.map((r) => [r.id, r]));
  const seen = new Set<string>();
  const merged: T[] = [];

  for (const ls of local) {
    seen.add(ls.id);
    const rs = remoteById.get(ls.id);
    merged.push(rs ? pickNewerRecord(ls, rs) : ls);
  }
  for (const rs of remote) {
    if (!seen.has(rs.id)) merged.push(rs);
  }
  return merged;
}

export function pickNewerRecord<T extends SyncedEntity>(local: T, remote: T): T {
  const lt = syncTs(local.updatedAt);
  const rt = syncTs(remote.updatedAt);
  if (lt === 0 && rt === 0) return { ...local, ...remote };
  if (lt >= rt) return { ...remote, ...local };
  return { ...local, ...remote };
}
