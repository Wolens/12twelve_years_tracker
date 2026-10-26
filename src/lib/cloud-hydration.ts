let hydrationDone = false;
let hydrationWaiters: Array<() => void> = [];

/** Сброс при выходе из аккаунта (новый пользователь должен ждать свою гидрацию). */
export function resetCloudHydrationGate(): void {
  hydrationDone = false;
}

export function markCloudHydrationDone(): void {
  hydrationDone = true;
  for (const resolve of hydrationWaiters) resolve();
  hydrationWaiters = [];
}

/** Для гостя сразу true; для входа — ждём hydrateAppStateFromCloud. */
export function waitForCloudHydration(loggedIn: boolean): Promise<void> {
  if (!loggedIn || hydrationDone) return Promise.resolve();
  return new Promise((resolve) => {
    hydrationWaiters.push(resolve);
  });
}

export function isCloudHydrationDone(): boolean {
  return hydrationDone;
}
