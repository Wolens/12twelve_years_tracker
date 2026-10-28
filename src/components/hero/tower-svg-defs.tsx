/** Shared SVG gradients — mounted once on the tower board. */
export function TowerSvgDefs() {
  return (
    <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
      <defs>
        <linearGradient id="tw-wall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a5564" />
          <stop offset="45%" stopColor="#343d48" />
          <stop offset="100%" stopColor="#252b33" />
        </linearGradient>
        <linearGradient id="tw-wall-lit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a6575" />
          <stop offset="50%" stopColor="#3d4654" />
          <stop offset="100%" stopColor="#2a313a" />
        </linearGradient>
        <linearGradient id="tw-wall-future" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#556070" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3a424c" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="tw-wall-missed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2a36" />
          <stop offset="100%" stopColor="#121a22" />
        </linearGradient>
        <linearGradient id="tw-slab" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6b7580" />
          <stop offset="100%" stopColor="#2e343c" />
        </linearGradient>
        <linearGradient id="tw-pillar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a1f26" />
          <stop offset="50%" stopColor="#2a3038" />
          <stop offset="100%" stopColor="#15191f" />
        </linearGradient>
        <linearGradient id="tw-window-glow" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#f6b14a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="tw-spire-sky" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1a2230" />
          <stop offset="100%" stopColor="#0c1016" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="tw-beacon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#f6b14a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f6b14a" stopOpacity="0" />
        </radialGradient>
        <filter id="tw-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
    </svg>
  );
}
