import { getAudioContext, getAudioContextForPreview, getSoundVolume } from "./audio-engine";
import type { ClickPresetId } from "./sound-presets";
import { getClickPreset } from "./sound-presets";

const PRISM = {
  tones: [
    { type: "sine" as const, f0: 1046, dur: 0.04, peak: 0.07, attack: 0.003 },
    { type: "sine" as const, f0: 1568, dur: 0.035, peak: 0.028, attack: 0.004, delay: 0.018 },
  ],
};

type ToneSpec = (typeof PRISM.tones)[number];

function playTone(ctx: AudioContext, out: GainNode, t0: number, spec: ToneSpec) {
  const t = t0 + (spec.delay ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = spec.type;
  osc.frequency.setValueAtTime(spec.f0, t);
  const attack = spec.attack ?? 0.004;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(spec.peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + spec.dur);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + spec.dur + 0.02);
}

export function playUiClickPreset(_id: ClickPresetId = "prism", volume = 0.55, ignoreMute = false) {
  const master = ignoreMute ? 1 : getSoundVolume();
  if (master <= 0 && !ignoreMute) return;
  const ctx = getAudioContextForPreview() ?? getAudioContext();
  if (!ctx) return;
  const out = ctx.createGain();
  out.gain.value = volume * master;
  out.connect(ctx.destination);
  const t = ctx.currentTime;
  for (const tone of PRISM.tones) playTone(ctx, out, t, tone);
}

export function playUiClick(soft = false) {
  if (getSoundVolume() <= 0) return;
  playUiClickPreset(getClickPreset(), soft ? 0.4 : 0.55);
}
