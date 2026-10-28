import { getAudioContext, getAudioContextForPreview, isSoundEnabled } from "./audio-engine";
import type { PathPresetId } from "./sound-presets";
import { getPathPreset } from "./sound-presets";

type PathConfig = {
  intervalMs: number;
  masterPeak: number;
  droneHz: number[];
  droneVol: number[];
  motif: number[][];
  noteGap: number;
  noteVol: number;
  oscType: OscillatorType;
};

const CONFIGS: Record<Exclude<PathPresetId, "off">, PathConfig> = {
  road: {
    intervalMs: 4600,
    masterPeak: 0.15,
    droneHz: [130.81, 196],
    droneVol: [0.038, 0.022],
    motif: [
      [261.63, 293.66, 329.63, 392],
      [293.66, 329.63, 392, 440],
    ],
    noteGap: 0.62,
    noteVol: 0.052,
    oscType: "triangle",
  },
  forest: {
    intervalMs: 5000,
    masterPeak: 0.14,
    droneHz: [110, 164.81],
    droneVol: [0.035, 0.02],
    motif: [
      [329.63, 392, 440, 392],
      [293.66, 349.23, 392, 349.23],
      [440, 493.88, 440, 392],
    ],
    noteGap: 0.55,
    noteVol: 0.048,
    oscType: "triangle",
  },
  mountain: {
    intervalMs: 5800,
    masterPeak: 0.15,
    droneHz: [98, 146.83, 196],
    droneVol: [0.04, 0.024, 0.014],
    motif: [
      [196, 0, 246.94, 293.66],
      [174.61, 220, 261.63, 329.63],
    ],
    noteGap: 0.95,
    noteVol: 0.05,
    oscType: "sine",
  },
  camp: {
    intervalMs: 6400,
    masterPeak: 0.13,
    droneHz: [130.81, 164.81],
    droneVol: [0.042, 0.026],
    motif: [
      [261.63, 329.63, 392, 329.63],
      [246.94, 293.66, 349.23, 293.66],
    ],
    noteGap: 1.05,
    noteVol: 0.044,
    oscType: "triangle",
  },
  market: {
    intervalMs: 3600,
    masterPeak: 0.16,
    droneHz: [146.83, 220],
    droneVol: [0.032, 0.018],
    motif: [
      [392, 440, 392, 349.23],
      [440, 493.88, 440, 392],
      [349.23, 392, 440, 493.88],
    ],
    noteGap: 0.38,
    noteVol: 0.055,
    oscType: "triangle",
  },
  sea: {
    intervalMs: 5200,
    masterPeak: 0.14,
    droneHz: [123.47, 185],
    droneVol: [0.036, 0.02],
    motif: [
      [329.63, 392, 329.63, 293.66],
      [293.66, 349.23, 392, 349.23],
    ],
    noteGap: 0.72,
    noteVol: 0.05,
    oscType: "sine",
  },
  caravan: {
    intervalMs: 4000,
    masterPeak: 0.15,
    droneHz: [110, 165, 220],
    droneVol: [0.038, 0.022, 0.012],
    motif: [
      [220, 246.94, 277.18, 246.94],
      [196, 220, 246.94, 277.18],
      [246.94, 277.18, 311.13, 277.18],
    ],
    noteGap: 0.48,
    noteVol: 0.051,
    oscType: "triangle",
  },
  treasure: {
    intervalMs: 3800,
    masterPeak: 0.16,
    droneHz: [164.81, 246.94],
    droneVol: [0.034, 0.019],
    motif: [
      [392, 493.88, 587.33, 493.88],
      [349.23, 440, 554.37, 440],
      [440, 554.37, 659.25, 554.37],
    ],
    noteGap: 0.42,
    noteVol: 0.052,
    oscType: "triangle",
  },
  sprint: {
    intervalMs: 3200,
    masterPeak: 0.15,
    droneHz: [146.83, 293.66],
    droneVol: [0.03, 0.016],
    motif: [
      [440, 493.88, 554.37, 659.25],
      [392, 440, 493.88, 554.37],
    ],
    noteGap: 0.32,
    noteVol: 0.054,
    oscType: "triangle",
  },
  horizon: {
    intervalMs: 6000,
    masterPeak: 0.14,
    droneHz: [98, 196, 293.66],
    droneVol: [0.036, 0.022, 0.012],
    motif: [
      [261.63, 329.63, 392, 523.25],
      [246.94, 311.13, 369.99, 493.88],
    ],
    noteGap: 0.88,
    noteVol: 0.048,
    oscType: "sine",
  },
};

class PathAmbientLoop {
  private nodes: OscillatorNode[] = [];
  private master: GainNode | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private previewTimer: ReturnType<typeof setTimeout> | null = null;
  private step = 0;
  private running = false;
  private activePreset: PathPresetId | null = null;

  start(preset?: PathPresetId) {
    const id = preset ?? getPathPreset();
    if (id === "off") {
      this.stop();
      return;
    }
    if (this.running && this.activePreset === id) return;
    this.stop();
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const cfg = CONFIGS[id];
    this.running = true;
    this.activePreset = id;

    this.master = ctx.createGain();
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(cfg.masterPeak, ctx.currentTime + 1.4);
    this.master.connect(ctx.destination);

    cfg.droneHz.forEach((hz, i) => {
      const drone = ctx.createOscillator();
      const g = ctx.createGain();
      drone.type = "sine";
      drone.frequency.value = hz;
      g.gain.value = cfg.droneVol[i] ?? 0.03;
      drone.connect(g).connect(this.master!);
      drone.start();
      this.nodes.push(drone);
    });

    this.playPhrase(ctx, cfg);
    this.interval = setInterval(() => this.playPhrase(ctx, cfg), cfg.intervalMs);
  }

  preview(preset: PathPresetId) {
    this.stop();
    if (preset === "off") return;
    const ctx = getAudioContextForPreview();
    if (!ctx) return;
    this.startPreviewOnCtx(ctx, preset);
  }

  private startPreviewOnCtx(ctx: AudioContext, preset: PathPresetId) {
    if (preset === "off") return;
    const cfg = CONFIGS[preset];
    this.running = true;
    this.activePreset = preset;
    this.master = ctx.createGain();
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(cfg.masterPeak, ctx.currentTime + 0.8);
    this.master.connect(ctx.destination);
    cfg.droneHz.forEach((hz, i) => {
      const drone = ctx.createOscillator();
      const g = ctx.createGain();
      drone.type = "sine";
      drone.frequency.value = hz;
      g.gain.value = cfg.droneVol[i] ?? 0.03;
      drone.connect(g).connect(this.master!);
      drone.start();
      this.nodes.push(drone);
    });
    this.playPhrase(ctx, cfg);
    this.previewTimer = setTimeout(() => this.stop(), 6500);
  }

  private playPhrase(ctx: AudioContext, cfg: PathConfig) {
    if (!this.master) return;
    const row = cfg.motif[this.step % cfg.motif.length];
    this.step++;
    const t0 = ctx.currentTime + 0.05;
    row.forEach((freq, i) => {
      if (freq <= 0) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = cfg.oscType;
      osc.frequency.setValueAtTime(freq, t0 + i * cfg.noteGap);
      g.gain.setValueAtTime(0.0001, t0 + i * cfg.noteGap);
      g.gain.exponentialRampToValueAtTime(cfg.noteVol, t0 + i * cfg.noteGap + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * cfg.noteGap + 0.65);
      osc.connect(g).connect(this.master!);
      osc.start(t0 + i * cfg.noteGap);
      osc.stop(t0 + i * cfg.noteGap + 0.7);
    });
  }

  stop() {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (!this.running && !this.master) return;
    this.running = false;
    this.activePreset = null;
    this.step = 0;

    const ctx = this.master?.context;
    if (ctx && this.master) {
      const t = ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      window.setTimeout(() => {
        for (const n of this.nodes) {
          try {
            n.stop();
            n.disconnect();
          } catch {
            /* */
          }
        }
        this.nodes = [];
        try {
          this.master?.disconnect();
        } catch {
          /* */
        }
        this.master = null;
      }, 800);
    }
  }

  restartIfRunning() {
    if (!this.running) return;
    this.start(getPathPreset());
  }
}

export const pathAmbient = new PathAmbientLoop();
