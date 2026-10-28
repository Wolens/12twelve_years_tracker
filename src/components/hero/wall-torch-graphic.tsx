/** Wall torch silhouette adapted from IconPark «torch» (Apache-2.0), recolored for the tower. */

export function WallTorchGraphic({
  power,
  x = 234,
  y = 4,
  scale = 0.88,
}: {
  power: number;
  x?: number;
  y?: number;
  scale?: number;
}) {
  const warm = power >= 0.55;
  const dim = power < 0.35;
  const flame = dim ? "#94a3b8" : warm ? "#f97316" : "#d97706";
  const flameHi = dim ? "#cbd5e1" : warm ? "#fde047" : "#fbbf24";
  const handle = "#5c4228";
  const cup = "#2a2218";
  const mount = "#2a241c";
  const opacity = 0.4 + power * 0.6;

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      aria-hidden
      style={{ pointerEvents: "none" }}
      opacity={opacity}
    >
      <rect x="0" y="36" width="11" height="16" rx="1.2" fill={mount} stroke="#6b5d4a" strokeWidth="0.9" />
      <path d="M11 42 H17" stroke="#5c5146" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M27 34H21V44H27V34Z"
        fill={handle}
        stroke="#1a120a"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M31 34H17L14 26H34L31 34Z"
        fill={cup}
        stroke="#8a8174"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M21 14C23 9.39 27 4 27 4C27 4 33.36 15.49 33.36 19.23C33.36 22.97 30.74 26 27 26H19C16.36 26 14.64 23.86 14.64 21.22C14.64 18.58 19 10 19 10C19 10 19.96 12.01 21 14Z"
        fill={flame}
        stroke={dim ? "#475569" : "#9a3412"}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M22.2 12.5C23.4 9.8 26.2 7 26.2 7C26.2 7 30.6 15.2 30.6 18.4C30.6 21.2 29.1 23.6 27 23.6H21.4C19.5 23.6 18.2 21.5 18.2 19.2C18.2 16.8 21.2 10.8 21.2 10.8C21.2 10.8 21.6 11.8 22.2 12.5Z"
        fill={flameHi}
      />
    </g>
  );
}
