import { cn } from "@/lib/utils";

const STARS = [
  [12, 8, 1.1, 0.7],
  [28, 14, 0.8, 0.5],
  [44, 6, 0.6, 0.45],
  [62, 18, 1, 0.65],
  [78, 10, 0.7, 0.4],
  [88, 22, 0.5, 0.35],
  [8, 28, 0.9, 0.55],
  [22, 38, 0.6, 0.4],
  [52, 32, 0.8, 0.5],
  [70, 42, 1.2, 0.6],
  [92, 34, 0.7, 0.45],
  [16, 52, 0.5, 0.3],
  [36, 48, 0.9, 0.5],
  [84, 52, 0.6, 0.38],
] as const;

export function TowerBackdrop({
  mist,
  scrollLift,
}: {
  mist: number;
  scrollLift: number;
}) {
  const far = scrollLift * 0.08;
  const mid = scrollLift * 0.18;
  const near = scrollLift * 0.32;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 55% at 50% -5%, rgba(88, 120, 180, 0.22), transparent 58%),
            radial-gradient(ellipse 70% 40% at 78% 12%, rgba(246, 177, 74, 0.08), transparent 50%),
            linear-gradient(180deg, #121820 0%, #0a0e14 38%, #06080c 100%)
          `,
        }}
      />

      <div
        className="absolute inset-x-0 top-14 h-[min(38vh,280px)] opacity-95 sm:top-16"
        style={{ transform: `translateY(${far}px)` }}
      >
        <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMin slice">
          <defs>
            <radialGradient id="tw-moon-fill" cx="32%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>
            <radialGradient id="tw-moon-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
            </radialGradient>
            <mask id="tw-crescent-mask">
              <rect x="62" y="28" width="56" height="52" fill="white" />
              <circle cx="94" cy="50" r="19" fill="black" />
            </mask>
          </defs>
          {STARS.map(([x, y, r, o], i) => (
            <circle
              key={i}
              cx={(x / 100) * 400}
              cy={40 + (y / 100) * 160}
              r={r}
              fill="#f8fafc"
              opacity={o}
              className={i % 4 === 0 ? "tower-star" : undefined}
            />
          ))}
          <g opacity="0.9">
            <ellipse cx="84" cy="52" rx="26" ry="22" fill="url(#tw-moon-halo)" />
            <circle cx="80" cy="50" r="19" fill="url(#tw-moon-fill)" mask="url(#tw-crescent-mask)" />
            <circle cx="72" cy="44" r="1.6" fill="#64748b" opacity="0.22" />
            <circle cx="68" cy="52" r="1.1" fill="#64748b" opacity="0.17" />
            <circle cx="74" cy="56" r="1.3" fill="#64748b" opacity="0.15" />
          </g>
        </svg>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[55%] opacity-70"
        style={{ transform: `translateY(${mid}px)` }}
      >
        <svg viewBox="0 0 400 240" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M0 120 Q80 90 160 110 T320 95 L400 105 V240 H0 Z"
            fill="#0d1218"
            opacity="0.85"
          />
          <path
            d="M0 150 Q120 125 220 140 T400 130 V240 H0 Z"
            fill="#080b10"
            opacity="0.9"
          />
        </svg>
      </div>

      <div
        className="absolute inset-y-0 left-0 w-[22%] max-w-[7rem]"
        style={{
          transform: `translateY(${near}px)`,
          background: "linear-gradient(90deg, rgba(0,0,0,0.55), transparent)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[22%] max-w-[7rem]"
        style={{
          transform: `translateY(${near}px)`,
          background: "linear-gradient(-90deg, rgba(0,0,0,0.55), transparent)",
        }}
      />

      <div
        className="absolute inset-x-[18%] top-0 bottom-0 rounded-[999px] opacity-40"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(246,177,74,0.06) 48%, rgba(255,255,255,0.04) 50%, rgba(246,177,74,0.06) 52%, transparent)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.35)",
        }}
      />

      <div
        className={cn("absolute inset-0 transition-opacity duration-500")}
        style={{
          opacity: mist,
          background:
            "linear-gradient(180deg, rgba(12,16,22,0.92) 0%, rgba(12,16,22,0.4) 35%, transparent 65%)",
        }}
      />
    </div>
  );
}

/** Thin progress rail — full route at a glance (Crazy Climber–style minimap). */
export function TowerProgressRail({ progress }: { progress: number }) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  return (
    <div
      className="pointer-events-none absolute right-2 top-24 z-10 hidden w-2 rounded-full bg-white/[0.06] sm:block"
      style={{ bottom: "5.5rem" }}
      aria-hidden
    >
      <div
        className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-amber-600/80 via-amber-400/70 to-amber-200/90 shadow-[0_0_12px_rgba(246,177,74,0.45)]"
        style={{ height: `${pct}%` }}
      />
      <div
        className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-amber-100/80 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
        style={{ bottom: `calc(${pct}% - 4px)` }}
      />
    </div>
  );
}
