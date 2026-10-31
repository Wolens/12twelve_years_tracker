const SOUND_PREF_KEY = "twelve-weeks-sound-enabled";
const SOUND_VOLUME_KEY = "twelve-weeks-sound-volume";

let sharedCtx: AudioContext | null = null;
let storedVolume: number | null = null;

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readStoredVolume(): number {
  if (storedVolume !== null) return storedVolume;
  const storedVol = localStorage.getItem(SOUND_VOLUME_KEY);
  if (storedVol !== null) {
    const n = Number(storedVol);
    if (!Number.isNaN(n)) {
      storedVolume = Math.max(0, Math.min(100, Math.round(n)));
      return storedVolume;
    }
  }
  const legacy = localStorage.getItem(SOUND_PREF_KEY);
  storedVolume = legacy === "0" ? 0 : 100;
  return storedVolume;
}

export function getSoundVolumePercent(): number {
  if (typeof window === "undefined") return 100;
  if (reducedMotion()) return 0;
  return readStoredVolume();
}

/** 0…1 для Web Audio gain. */
export function getSoundVolume(): number {
  return getSoundVolumePercent() / 100;
}

export function setSoundVolumePercent(percent: number) {
  if (typeof window === "undefined") return;
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  storedVolume = p;
  localStorage.setItem(SOUND_VOLUME_KEY, String(p));
  localStorage.setItem(SOUND_PREF_KEY, p > 0 ? "1" : "0");
}

export function isSoundEnabled(): boolean {
  return getSoundVolumePercent() > 0;
}

/** @deprecated Используй setSoundVolumePercent */
export function setSoundEnabled(enabled: boolean) {
  if (enabled) {
    const cur = getSoundVolumePercent();
    setSoundVolumePercent(cur > 0 ? cur : 100);
  } else {
    setSoundVolumePercent(0);
  }
}

function createContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new Ctx();
  }
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

/** Для игры и UI, когда звук включён. */
export function getAudioContext(): AudioContext | null {
  if (!isSoundEnabled()) return null;
  return createContext();
}

/** Прослушивание в настройках (даже если громкость 0). */
export function getAudioContextForPreview(): AudioContext | null {
  if (reducedMotion()) return null;
  return createContext();
}

export function masterGain(ctx: AudioContext, level = 0.85): GainNode {
  const g = ctx.createGain();
  g.gain.value = level;
  g.connect(ctx.destination);
  return g;
}
