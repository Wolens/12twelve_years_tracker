import { cn } from "@/lib/utils";

export type ChestVisual = "closed" | "ready" | "open" | "missed";

/** Сундук недели у этажа — дерево, металл, замок. */
export function DungeonChestGraphic({
  variant = "closed",
  className,
}: {
  variant?: ChestVisual;
  className?: string;
}) {
  const missed = variant === "missed";
  const open = variant === "open";
  const ready = variant === "ready";

  const wood = missed ? "#6a5c4c" : open ? "#5c4838" : "#6b3a22";
  const woodDark = missed ? "#3f3428" : open ? "#2a2218" : "#4a2818";
  const band = missed ? "#8a8178" : open ? "#64748b" : ready ? "#cbd5e1" : "#94a3b8";
  const gold = missed ? "#6b645c" : open ? "#78716c" : ready ? "#fbbf24" : "#eab308";

  return (
    <svg
      viewBox="0 0 64 48"
      className={cn("drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]", className)}
      aria-hidden
    >
      <ellipse cx="32" cy="44" rx="22" ry="3" fill="#000" opacity={open ? 0.28 : 0.42} />

      <path d="M8 22 H56 V40 H8 Z" fill={woodDark} stroke="#1c140e" strokeWidth="0.6" />
      <path d="M8 22 H56 V28 H8 Z" fill={wood} />
      {open ? (
        <path d="M12 25 H52 V38 H12 Z" fill="#120e0c" />
      ) : (
        <path d="M10 28 H54 V38 H10 Z" fill={wood} opacity="0.92" />
      )}
      <path d="M8 26 H56" stroke={band} strokeWidth="2.2" />
      <path d="M8 34 H56" stroke={band} strokeWidth="1.4" opacity="0.85" />
      <path d="M18 22 V40 M46 22 V40" stroke={band} strokeWidth="2" />

      {open ? (
        <path d="M8 18 Q8 6 32 6 Q56 6 56 18 L52 23 H12 Z" fill={wood} stroke={woodDark} strokeWidth="0.7" />
      ) : (
        <>
          <path d="M8 22 Q8 8 32 8 Q56 8 56 22 Z" fill={wood} stroke={woodDark} strokeWidth="0.7" />
          <path d="M12 18 Q32 10 52 18" fill="none" stroke={woodDark} strokeWidth="0.6" opacity="0.55" />
          <path d="M8 20 H56" stroke={band} strokeWidth="1.6" />
          <path d="M32 8 V22" stroke={band} strokeWidth="1.3" opacity="0.8" />
        </>
      )}

      {!open && <rect x="28" y="27" width="8" height="7" rx="1" fill="#1c140e" stroke={gold} strokeWidth="0.8" />}
      {ready && <path d="M30 30 H34 M32 31.5 V34" stroke={gold} strokeWidth="0.8" strokeLinecap="round" />}

      {missed && (
        <g stroke="#2a241c" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M16 14 L22 18 L18 22" />
          <path d="M40 12 L46 17" />
          <path d="M14 32 L20 30 L18 36" />
          <path d="M44 31 L50 35" />
        </g>
      )}
      {missed && (
        <g fill="#d9d0c2" opacity="0.45">
          <circle cx="14" cy="16" r="0.7" />
          <circle cx="24" cy="13" r="0.55" />
          <circle cx="44" cy="15" r="0.65" />
          <circle cx="20" cy="33" r="0.6" />
          <circle cx="48" cy="30" r="0.55" />
          <circle cx="36" cy="36" r="0.5" />
        </g>
      )}

      <path d="M14 30 H18 M46 30 H50" stroke="#1c140e" strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}
