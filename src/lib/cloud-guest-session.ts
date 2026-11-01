/** Локальные правки в этой вкладке до входа (не путать с кэшем профиля после выхода). */
export const GUEST_SESSION_DIRTY_KEY = "cloud:guest-session-dirty";

export function markGuestSessionDirty(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(GUEST_SESSION_DIRTY_KEY, "1");
}

export function isGuestSessionDirty(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(GUEST_SESSION_DIRTY_KEY) === "1";
}

export function clearGuestSessionDirty(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(GUEST_SESSION_DIRTY_KEY);
}
