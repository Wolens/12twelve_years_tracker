"use client";

import { memo } from "react";
import { itemById } from "@/lib/rpg/catalog";
import { ItemIconById } from "./item-icons";
import { GlyphShape } from "./item-glyph-shapes";

const RARITY_RIM: Record<string, string> = {
  common: "#64748b",
  uncommon: "#059669",
  rare: "#0284c7",
  epic: "#7c3aed",
  legendary: "#d97706",
};

type Props = {
  glyph: string;
  className?: string;
  itemId?: string;
};

export const ItemGlyph = memo(function ItemGlyph({ glyph, className, itemId }: Props) {
  const item = itemId ? itemById(itemId) : undefined;
  const rim = item ? RARITY_RIM[item.rarity] : "#475569";

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="6"
        fill="#0f172a"
        stroke={rim}
        strokeWidth="1.2"
        opacity="0.95"
      />
      {itemId ? (
        <ItemIconById itemId={itemId} />
      ) : (
        <g transform="translate(4 4) scale(1.333)" fill="currentColor" stroke="currentColor">
          <GlyphShape glyph={glyph} accent="currentColor" />
        </g>
      )}
    </svg>
  );
});
