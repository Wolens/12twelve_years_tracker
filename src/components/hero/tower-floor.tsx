import type { FloorType, TowerDay } from "@/lib/rpg/tower";
import { WallTorchGraphic } from "./wall-torch-graphic";

const W = 320;
const H = 112;

function wallFill(day: TowerDay) {
  if (day.state === "future") return "url(#tw-wall-future)";
  if (day.state === "missed") return "url(#tw-wall-missed)";
  if (day.lit || day.state === "done") return "url(#tw-wall-lit)";
  return "url(#tw-wall)";
}

function Window({ type, lit, open }: { type: FloorType; lit: boolean; open: boolean }) {
  const door = lit ? "#7a5234" : "#5c4030";
  const doorHi = lit ? "#8f6238" : "#6b4428";
  const glow = open && lit ? <ellipse cx="160" cy="48" rx="26" ry="20" fill="url(#tw-beacon)" opacity="0.16" /> : null;
  const inside = "#120e0c";

  if (type === "cellar") {
    return (
      <g>
        {glow}
        <path d="M128 76 V36 Q160 14 192 36 V76 Z" fill="#6d7868" stroke="#c5d0b8" strokeWidth="1.1" />
        {open ? (
          <>
            <path d="M134 74 V42 Q147 24 160 28 Q173 24 186 42 V74 Z" fill={inside} />
            <path d="M134 74 V42 Q144 30 152 36 L150 74 Z" fill={door} stroke="#3d2818" strokeWidth="0.5" />
            <path d="M186 74 V42 Q176 30 168 36 L170 74 Z" fill={doorHi} stroke="#3d2818" strokeWidth="0.5" />
            <path d="M138 52 H148 M138 62 H148" stroke="#3d2818" strokeWidth="0.45" opacity="0.45" />
            <path d="M182 52 H172 M182 62 H172" stroke="#3d2818" strokeWidth="0.45" opacity="0.45" />
            <circle cx="149" cy="56" r="1.3" fill="#c4a574" />
            <circle cx="171" cy="56" r="1.3" fill="#c4a574" />
          </>
        ) : (
          <>
            <path d="M134 74 V42 Q147 24 160 28 L160 74 Z" fill={door} stroke="#3d2818" strokeWidth="0.55" />
            <path d="M160 74 L160 28 Q173 24 186 42 L186 74 Z" fill={doorHi} stroke="#3d2818" strokeWidth="0.55" />
            <path d="M160 28 V74" stroke="#2a180e" strokeWidth="0.8" />
            <path d="M138 48 H182 M138 60 H182" stroke="#3d2818" strokeWidth="0.5" opacity="0.45" />
            <circle cx="160" cy="56" r="2.1" fill="#c4a574" />
          </>
        )}
      </g>
    );
  }
  if (type === "hall") {
    return (
      <g>
        {glow}
        <path d="M138 76 V44 L160 16 L182 44 V76 Z" fill="#6a5c40" stroke="#d9c48a" strokeWidth="1.15" />
        {open ? (
          <>
            <path d="M144 74 V48 L160 26 L176 48 V74 Z" fill={inside} />
            <path d="M144 74 V50 L154 38 L152 74 Z" fill={door} stroke="#3d2818" strokeWidth="0.5" />
            <path d="M176 74 V50 L166 38 L168 74 Z" fill={doorHi} stroke="#3d2818" strokeWidth="0.5" />
            <circle cx="151" cy="58" r="1.2" fill="#d9c48a" />
            <circle cx="169" cy="58" r="1.2" fill="#d9c48a" />
          </>
        ) : (
          <>
            <path d="M144 74 V48 L160 26 L160 74 Z" fill={door} stroke="#3d2818" strokeWidth="0.55" />
            <path d="M160 74 L160 26 L176 48 L176 74 Z" fill={doorHi} stroke="#3d2818" strokeWidth="0.55" />
            <path d="M160 26 V74" stroke="#2a180e" strokeWidth="0.8" />
            <path d="M148 52 H172 M148 64 H172" stroke="#3d2818" strokeWidth="0.5" opacity="0.5" />
            <circle cx="160" cy="58" r="2" fill="#d9c48a" />
          </>
        )}
      </g>
    );
  }
  if (type === "spire") {
    return (
      <g>
        {glow}
        <path d="M146 76 V30 L160 12 L174 30 V76 Z" fill="#3d4a58" stroke="#d5e2ee" strokeWidth="1" />
        {open ? (
          <>
            <path d="M150 74 V36 L160 22 L170 36 V74 Z" fill={inside} />
            <path d="M150 74 V36 L157 28 L155 74 Z" fill={door} stroke="#3d2818" strokeWidth="0.45" />
            <path d="M170 74 V36 L163 28 L165 74 Z" fill={doorHi} stroke="#3d2818" strokeWidth="0.45" />
            <circle cx="155" cy="54" r="1.1" fill="#d5e2ee" />
            <circle cx="165" cy="54" r="1.1" fill="#d5e2ee" />
          </>
        ) : (
          <>
            <path d="M150 74 V36 L160 22 L160 74 Z" fill={door} stroke="#3d2818" strokeWidth="0.5" />
            <path d="M160 74 L160 22 L170 36 L170 74 Z" fill={doorHi} stroke="#3d2818" strokeWidth="0.5" />
            <path d="M160 22 V74" stroke="#2a180e" strokeWidth="0.7" />
            <path d="M152 48 H168 M152 60 H168" stroke="#3d2818" strokeWidth="0.45" opacity="0.5" />
            <circle cx="160" cy="56" r="1.6" fill="#d5e2ee" />
          </>
        )}
      </g>
    );
  }
  return (
    <g>
      {glow}
      <rect x="132" y="30" width="56" height="46" fill="#5c6568" stroke="#c5d0b8" strokeWidth="1.1" />
      {open ? (
        <>
          <rect x="136" y="34" width="48" height="42" fill={inside} />
          <path d="M136 76 V34 L154 36 L152 76 Z" fill={door} stroke="#3d2818" strokeWidth="0.5" />
          <path d="M184 76 V34 L166 36 L168 76 Z" fill={doorHi} stroke="#3d2818" strokeWidth="0.5" />
          <circle cx="151" cy="54" r="1.3" fill="#c4a574" />
          <circle cx="169" cy="54" r="1.3" fill="#c4a574" />
        </>
      ) : (
        <>
          <rect x="136" y="34" width="24" height="42" fill={door} stroke="#3d2818" strokeWidth="0.5" />
          <rect x="160" y="34" width="24" height="42" fill={doorHi} stroke="#3d2818" strokeWidth="0.5" />
          <path d="M160 34 V76" stroke="#2a180e" strokeWidth="0.85" />
          <path d="M140 46 H180 M140 58 H180" stroke="#3d2818" strokeWidth="0.5" opacity="0.5" />
          <circle cx="160" cy="54" r="2" fill="#c4a574" />
        </>
      )}
    </g>
  );
}

function Banner() {
  return (
    <g filter="url(#tw-soft-shadow)">
      <path d="M188 28 h1.2 v24" stroke="#5c5146" strokeWidth="1.2" />
      <path d="M189.2 30 h18 l-4.5 6 4.5 6 h-18 z" fill="#ea580c" stroke="#7c2d12" strokeWidth="0.6" />
      <path d="M191 34 h12 l-2.5 3.5 2.5 3.5 h-12 z" fill="#fb923c" opacity="0.85" />
    </g>
  );
}

function Tracks({ count }: { count: number }) {
  const n = Math.min(5, Math.max(1, count));
  return (
    <g stroke="rgba(0,0,0,0.45)" strokeWidth="1.4" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const x = 118 + i * 18;
        return <path key={i} d={`M${x} 92 h7 M${x + 2} 97 h6`} />;
      })}
    </g>
  );
}

function torchPowerFor(day: TowerDay): number {
  if (day.state === "done" || day.lit) return 1;
  if (day.state === "visited") return 0.62;
  if (day.state === "missed") return 0.28;
  return 0.5;
}

/** Факел на стене — декор, без отдельного тапа. */
function WallTorch({ power }: { power: number }) {
  return <WallTorchGraphic power={power} x={232} y={2} scale={0.92} />;
}

function SidePillars({ tone }: { tone: "normal" | "missed" | "future" }) {
  const op = tone === "future" ? 0.72 : tone === "missed" ? 0.65 : 1;
  return (
    <g opacity={op}>
      <path d="M8 8 L28 8 L32 78 L12 78 Z" fill="url(#tw-pillar)" />
      <path d="M292 8 L312 8 L308 78 L288 78 Z" fill="url(#tw-pillar)" />
      <path d="M12 78 L308 78" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    </g>
  );
}

function DayMark({ day }: { day: TowerDay }) {
  const future = day.state === "future";
  const today = day.state === "today";
  const missed = day.state === "missed";
  const warm = day.lit || day.state === "done" || today;
  const plate = missed ? "#152028" : today ? "#3f2c16" : future ? "#3a4450" : "#241e18";
  const edge = today ? "#f6b14a" : warm ? "#d6b07a" : missed ? "#7ea4b8" : future ? "#8a9aa8" : "#a39888";
  const ink = today ? "#fde68a" : warm ? "#f6e7c1" : missed ? "#d5eaf3" : future ? "#c5ced6" : "#f5f0e6";

  return (
    <g opacity={future ? 0.85 : 1}>
      <rect x="42" y="28" width="42" height="34" rx="3" fill="#07080b" opacity="0.45" />
      <rect
        x="44"
        y="26"
        width="40"
        height="32"
        rx="2"
        fill={plate}
        stroke={edge}
        strokeWidth={today ? 1.6 : 0.9}
      />
      <path d="M46 28 H82" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <path d="M46 56 H82" stroke="rgba(0,0,0,0.45)" strokeWidth="0.8" />
      <text
        x="64"
        y="43"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={ink}
        fontSize={day.day >= 10 ? 14 : 16}
        fontFamily="var(--font-space), sans-serif"
        fontWeight="700"
      >
        {day.day}
      </text>
      {missed && (
        <path
          d="M48 32 L80 52 M80 32 L48 52"
          stroke="#7ea4b8"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
    </g>
  );
}

const svgClass = "block h-[112px] w-full max-w-[21rem] mx-auto";

export function TowerFloorView({
  day,
  todayDay,
  passageLocked,
}: {
  day: TowerDay;
  todayDay: number | null;
  passageLocked?: boolean;
}) {
  const future = day.state === "future";
  const missed = day.state === "missed";
  const today = day.state === "today";
  const showBanner = day.state === "done" || (today && day.lit);
  const showTracks = day.state === "done";
  const fill = wallFill(day);
  const showWallTorch = todayDay !== null && day.day < todayDay;
  const torchPower = showWallTorch ? torchPowerFor(day) : 0;
  const doorOpen = day.state === "done" || day.state === "visited" || day.state === "today";

  return (
    <div className="relative -mt-px mx-auto w-full max-w-[21rem]">
      <svg viewBox={`0 0 ${W} ${H}`} className={svgClass} preserveAspectRatio="xMidYMax meet" aria-hidden>
        {missed ? (
          <g filter="url(#tw-soft-shadow)">
            <SidePillars tone="missed" />
            <path
              d="M32 10 H118 L108 42 L124 58 L96 76 H28 L32 106 H136 L118 84 L148 62 L118 28 L132 10 H200 L198 36 L176 58 L204 80 L188 106 H308 L302 36 L280 58 L298 82 L288 106 H108 L140 94 L168 78 L210 98 L188 106 H96 Z"
              fill={fill}
            />
            <ellipse cx="168" cy="56" rx="38" ry="18" fill="#7eb0c8" opacity="0.18" />
            <path d="M8 78 H312 V108 H8 Z" fill="url(#tw-slab)" />
            <path d="M8 78 H312" stroke="#7ea4b8" strokeWidth="2" opacity="0.7" />
            <Window type={day.floorType} lit={false} open={false} />
            {showWallTorch && <WallTorch power={torchPower} />}
          </g>
        ) : (
          <g filter="url(#tw-soft-shadow)">
            <SidePillars tone={future ? "future" : "normal"} />
            <path d="M28 8 L292 8 L288 76 L32 76 Z" fill={fill} />
            <path d="M40 26 H280 M40 48 H280" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <path d="M32 8 L28 76" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
            <path d="M288 8 L292 76" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            {[8, 28, 48].map((y) => (
              <g key={y}>
                <rect x="28" y={y} width="6" height="10" fill="#c3ccd4" opacity="0.55" />
                <rect x="286" y={y} width="6" height="10" fill="#c3ccd4" opacity="0.45" />
              </g>
            ))}
            <Window type={day.floorType} lit={day.lit} open={doorOpen} />
            {showBanner && <Banner />}
            <path d="M8 76 H312 V108 H8 Z" fill="url(#tw-slab)" />
            <path d="M8 76 H312" stroke="#c3ccd4" strokeWidth="2.2" opacity="0.85" />
            <path d="M16 82 H304" stroke="rgba(0,0,0,0.32)" strokeWidth="2.5" />
            {showTracks && <Tracks count={1 + Math.floor(day.trail / 6)} />}
            {day.state === "visited" && (
              <g fill="#9aa3ab" opacity="0.4">
                <circle cx="120" cy="96" r="1.2" />
                <circle cx="148" cy="99" r="0.9" />
                <circle cx="210" cy="95" r="1.1" />
              </g>
            )}
            {showWallTorch && <WallTorch power={torchPower} />}
            {today && (
              <rect
                x="6"
                y="74"
                width="308"
                height="34"
                fill="none"
                stroke="#f6b14a"
                strokeWidth="2"
                rx="2"
                className="tower-glow"
              />
            )}
          </g>
        )}
        <DayMark day={day} />
      </svg>
      {(day.state === "done" || (today && day.lit)) && (
        <span className="tower-dust pointer-events-none absolute left-1/2 top-5 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-200" />
      )}
      {missed && (
        <span className="tower-wisp pointer-events-none absolute left-[38%] top-8 h-6 w-16 rounded-full bg-sky-200/30 blur-sm" />
      )}
    </div>
  );
}

export function TowerBarrier({ week, built }: { week: number; built: boolean }) {
  return (
    <div className="relative -mt-px mx-auto w-full max-w-[21rem]">
      <svg viewBox="0 0 320 78" className="block h-[78px] w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {built ? (
          <g filter="url(#tw-soft-shadow)">
            <path d="M24 22 H296 V70 H24 Z" fill="url(#tw-wall-lit)" />
            <path d="M24 22 H296" stroke="#d5dbe3" strokeWidth="2.2" />
            <path
              d="M68 22 V46 M108 22 V54 M150 22 V46 M192 22 V54 M234 22 V46"
              stroke="#1a1e24"
              strokeWidth="2.5"
              opacity="0.85"
            />
            <path d="M140 8 H180 V24 H140 Z" fill="#2a3038" stroke="#d5dbe3" strokeWidth="1" />
            <path d="M152 24 V70 M168 24 V70" stroke="#151820" strokeWidth="2" />
            <ellipse cx="160" cy="38" rx="6" ry="8" fill="#140e08" stroke="#e8c56b" strokeWidth="0.8" />
            <circle cx="160" cy="36" r="3" fill="#f6c453" className="castle-beacon" />
            <path d="M44 70 H276" stroke="rgba(0,0,0,0.35)" strokeWidth="3" />
          </g>
        ) : (
          <g opacity="0.85">
            <path d="M40 10 V70 M280 10 V70" stroke="#c4b49a" strokeWidth="2" />
            <path d="M40 24 H280 M40 48 H280" stroke="#c4b49a" strokeWidth="1.3" strokeDasharray="6 4" />
            <path d="M40 10 L64 28 M280 10 L256 28" stroke="#c4b49a" strokeWidth="1.2" />
            <path d="M120 62 H200" stroke="#8a8174" strokeWidth="3" strokeDasharray="3 3" />
            <text x="160" y="42" textAnchor="middle" fill="#a8a29e" fontSize="11" fontWeight="600">
              ?
            </text>
          </g>
        )}
      </svg>
      <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-stone-200/90 backdrop-blur-sm">
        Нед. {week}
      </span>
    </div>
  );
}

export function TowerSpire() {
  return (
    <div className="relative mx-auto w-full max-w-[21rem]">
      <svg viewBox="0 0 320 248" className="block h-[248px] w-full" preserveAspectRatio="xMidYMax meet" aria-hidden>
        <ellipse cx="160" cy="238" rx="108" ry="10" fill="#000" opacity="0.4" />
        <path d="M28 118 H292 V148 H28 Z" fill="url(#tw-wall-lit)" stroke="#d5decc" strokeWidth="2" />
        <path d="M36 100 h14 v18 h-14 z M92 104 h14 v14 h-14 z M214 104 h14 v14 h-14 z M270 100 h14 v18 h-14 z" fill="#d5e0ea" opacity="0.92" />
        <path d="M44 148 q14 14 0 18 M92 148 q14 14 0 18 M228 148 q14 14 0 18 M276 148 q14 14 0 18" fill="#c5d4e2" />
        <path d="M48 166 H272 V228 H48 Z" fill="#2c3644" stroke="#d5decc" strokeWidth="1.2" />
        <path d="M56 174 H264 V220 H56 Z" fill="#1a222c" opacity="0.85" />
        <path d="M160 24 L96 118 H224 Z" fill="#334155" stroke="#64748b" strokeWidth="1" />
        <path d="M160 24 L224 118 H160 Z" fill="#475569" />
        <path d="M160 24 V112" stroke="#f1f5f9" strokeWidth="1.4" opacity="0.7" />
        <path d="M148 118 H172 V132 H148 Z" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="160" cy="18" r="16" fill="url(#tw-beacon)" className="castle-beacon" opacity="0.55" />
        <path d="M160 28 l-7 14 h6 l4 -7 5 9 h7 l-6 -12 5 -7 z" fill="#fde68a" stroke="#b45309" strokeWidth="0.6" />
        <path d="M168 132 h1 v28" stroke="#5c5146" strokeWidth="1.1" />
        <path d="M169 134 q16 3 14 12 q-10 3 -14 -1 z" fill="#ea580c" opacity="0.9" />
        <circle cx="160" cy="198" r="16" fill="#140e08" stroke="#e8c56b" strokeWidth="1.6" />
        <circle cx="160" cy="196" r="7" fill="#f6c453" className="castle-beacon" />
        <g fill="#f8fafc" opacity="0.8">
          <circle cx="38" cy="36" r="1.1" className="tower-star" />
          <circle cx="286" cy="28" r="1" className="tower-star" />
        </g>
      </svg>
    </div>
  );
}

export function TowerFoundation() {
  const wallTop = 28;
  const wallBottom = 124;
  const deckTop = 124;
  const deckBottom = 142;
  const plinthTop = 142;
  const plinthBottom = 158;
  const gateL = 108;
  const gateR = 212;
  const gateMid = 160;

  return (
    <div className="relative -mt-px mx-auto w-full max-w-[21rem]">
      <svg viewBox="0 0 320 188" className="block h-[188px] w-full" preserveAspectRatio="xMidYMax meet" aria-hidden>
        <defs>
          <linearGradient id="tw-oak-left" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d2818" />
            <stop offset="45%" stopColor="#6b4428" />
            <stop offset="100%" stopColor="#4a3020" />
          </linearGradient>
          <linearGradient id="tw-oak-right" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a3020" />
            <stop offset="55%" stopColor="#6b4428" />
            <stop offset="100%" stopColor="#3d2818" />
          </linearGradient>
        </defs>

        <ellipse cx="160" cy="178" rx="148" ry="8" fill="#000" opacity="0.5" />
        <path d="M0 168 H320 V188 H0 Z" fill="#101410" />
        <path d={`M12 ${plinthTop} H308 V${plinthBottom} H12 Z`} fill="#1a2018" />
        <path d={`M12 ${plinthTop} H308`} stroke="#8d9a80" strokeWidth="1.3" />

        <path d={`M28 ${deckTop} H292 V${deckBottom} H28 Z`} fill="#242b22" />
        <path d={`M28 ${deckTop} H292`} stroke="#c5d0b8" strokeWidth="1.6" />

        <path d={`M20 ${wallTop} H56 V${wallBottom} H20 Z`} fill="#1c221c" />
        <path d={`M264 ${wallTop} H300 V${wallBottom} H264 Z`} fill="#1c221c" />
        <path d={`M48 ${wallTop} H272 V${wallBottom} H48 Z`} fill="url(#tw-wall)" />
        <path d={`M48 ${wallTop} H272`} stroke="#d5decc" strokeWidth="2" />
        <path d="M60 48 H260 M60 68 H260 M60 98 H260" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" />

        <rect x={gateL - 10} y={58} width={gateR - gateL + 20} height={12} fill="#8d9a80" stroke="#d5decc" strokeWidth="1" />
        <rect x={gateL - 10} y={70} width={10} height={wallBottom - 70} fill="#7a8478" />
        <rect x={gateR} y={70} width={10} height={wallBottom - 70} fill="#7a8478" />

        <path
          d={`M${gateL + 2} 72 H${gateMid - 1} V${wallBottom - 2} H${gateL + 2} Z`}
          fill="url(#tw-oak-left)"
          stroke="#3d2818"
          strokeWidth="0.8"
        />
        <path
          d={`M${gateMid + 1} 72 H${gateR - 2} V${wallBottom - 2} H${gateMid + 1} Z`}
          fill="url(#tw-oak-right)"
          stroke="#3d2818"
          strokeWidth="0.8"
        />
        {[84, 98, 112].map((y) => (
          <g key={y}>
            <path d={`M${gateL + 6} ${y} H${gateMid - 4}`} stroke="#5c4a38" strokeWidth="2.2" />
            <path d={`M${gateMid + 4} ${y} H${gateR - 6}`} stroke="#5c4a38" strokeWidth="2.2" />
          </g>
        ))}
        <path d={`M${gateMid} 72 V${wallBottom - 2}`} stroke="#2a180e" strokeWidth="1.4" />
        <circle cx={gateMid} cy="100" r="5" fill="#5c4030" stroke="#c4a574" strokeWidth="1" />
        <circle cx={gateMid} cy="100" r="1.6" fill="#e8c56b" />

        <path d={`M48 ${wallBottom} H272 V${deckTop + 2} H48 Z`} fill="#2c3428" opacity="0.95" />

        <g>
          <path d="M88 44 V64" stroke="#5c5146" strokeWidth="1.2" />
          <rect x="80" y="64" width="16" height="18" rx="1.5" fill="#2a2014" stroke="#e8c56b" strokeWidth="0.8" />
          <rect x="83" y="68" width="10" height="10" fill="#f6b14a" className="tower-glow" />
        </g>
        <g>
          <path d="M232 44 V64" stroke="#5c5146" strokeWidth="1.2" />
          <rect x="224" y="64" width="16" height="18" rx="1.5" fill="#2a2014" stroke="#e8c56b" strokeWidth="0.8" />
          <rect x="227" y="68" width="10" height="10" fill="#f6b14a" className="tower-glow" />
        </g>
      </svg>
    </div>
  );
}
