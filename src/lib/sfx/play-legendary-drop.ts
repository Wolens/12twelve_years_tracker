import { getAudioContext, getSoundVolume } from "./audio-engine";

/** Короткий «легендарный» перезвон (Web Audio, без файлов). */
export function playLegendaryDrop() {
  const ctx = getAudioContext();
  const master = getSoundVolume();
  if (!ctx || master <= 0) return;

  const t0 = ctx.currentTime + 0.05;
  const notes = [
    { f: 523.25, at: 0, dur: 0.55, vol: 0.11 },
    { f: 659.25, at: 0.1, dur: 0.5, vol: 0.1 },
    { f: 783.99, at: 0.2, dur: 0.45, vol: 0.09 },
    { f: 1046.5, at: 0.32, dur: 0.85, vol: 0.12 },
  ];

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(n.f, t0 + n.at);
    gain.gain.setValueAtTime(0.0001, t0 + n.at);
    gain.gain.exponentialRampToValueAtTime(n.vol * master, t0 + n.at + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0 + n.at);
    osc.stop(t0 + n.at + n.dur + 0.05);
  }
}
