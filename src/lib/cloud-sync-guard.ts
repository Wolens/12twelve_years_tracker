let savesInFlight = 0;

export function beginCloudSave(): void {
  savesInFlight += 1;
}

export function endCloudSave(): void {
  savesInFlight = Math.max(0, savesInFlight - 1);
}

export function isCloudSaveInFlight(): boolean {
  return savesInFlight > 0;
}
