"use client";

import { memo, useId, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { RACES, itemById } from "@/lib/rpg/catalog";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import { spriteColorForItem } from "@/lib/rpg/item-sprite-colors";
import type { ItemRarity } from "@/types/rpg";
import { cn } from "@/lib/utils";

const RARITY_FILL: Record<ItemRarity, string> = {
  common: "#e2e8f0",
  uncommon: "#34d399",
  rare: "#7dd3fc",
  epic: "#c4b5fd",
  legendary: "#fcd34d",
};

/** Ниже этой линии — торс (одежда не рисуется на волосах/лице). */
const TORSO_TOP_Y = 278;
/** Ниже — ноги. */
const LEGS_TOP_Y = 518;
/** Зона лица для head-слота. */
const HEAD_ZONE_Y = 292;

function fillOf(id: string | undefined, fallback: string) {
  if (!id) return fallback;
  return spriteColorForItem(id, fallback);
}

function headHidesFace(glyph?: string): boolean {
  return glyph === "hood" || glyph === "helm" || glyph === "veil";
}

/** Scoop-neck top — плечи не выше TORSO_TOP_Y. */
function Top({
  color,
  sleeve,
  hem,
  cuff,
  shoulderY = TORSO_TOP_Y,
}: {
  color: string;
  sleeve: number;
  hem: number;
  cuff?: number;
  shoulderY?: number;
}) {
  return (
    <g fill={color}>
      <path
        d={`M292 ${shoulderY + 26}
            L348 ${shoulderY}
            L396 ${shoulderY}
            C396 ${shoulderY + 70} 418 ${shoulderY + 94} 432 ${shoulderY + 94}
            C446 ${shoulderY + 94} 468 ${shoulderY + 70} 468 ${shoulderY}
            L516 ${shoulderY}
            L572 ${shoulderY + 26}
            L572 ${sleeve}
            L520 ${sleeve}
            L520 ${hem}
            L344 ${hem}
            L344 ${sleeve}
            L292 ${sleeve}
            Z`}
      />
      {cuff != null && (
        <g fill="#000" opacity="0.16">
          <rect x="292" y={cuff} width="52" height="8" />
          <rect x="520" y={cuff} width="52" height="8" />
          <rect x="344" y={hem - 8} width="176" height="8" />
        </g>
      )}
    </g>
  );
}

function CapWear({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M352 124 Q352 48 432 48 Q512 48 512 124 L498 132 Q432 118 366 132 Z"
        fill={color}
      />
      <path d="M362 118 Q432 104 502 118 L498 128 Q432 116 366 128 Z" fill="#000" opacity="0.12" />
      <ellipse cx="432" cy="132" rx="112" ry="12" fill={color} />
      <ellipse cx="432" cy="138" rx="112" ry="7" fill="#000" opacity="0.22" />
    </g>
  );
}

function HeadOnBody({ glyph, color }: { glyph: string; color: string }) {
  switch (glyph) {
    case "cap":
    case "beret":
    case "crown":
    case "helm":
      return null;
    case "band":
      return <rect x="378" y="148" width="108" height="20" rx="8" fill={color} />;
    case "veil":
      return (
        <g fill={color} opacity="0.92">
          <rect x="350" y="40" width="164" height="112" />
          <rect x="300" y="270" width="72" height="200" />
          <rect x="492" y="270" width="72" height="200" />
        </g>
      );
    case "hood":
      return (
        <path
          fill={color}
          fillRule="evenodd"
          d="M338 52 H526 V188 H508 V430 H356 V188 H338 Z M372 156 H492 V224 H372 Z"
        />
      );
    case "circlet":
      return <rect x="380" y="124" width="104" height="11" rx="5" fill={color} />;
    default:
      return null;
  }
}

function HeadExtra({ glyph, color }: { glyph: string; color: string }) {
  if (glyph === "cap") return <CapWear color={color} />;
  if (glyph === "crown") {
    return <path d="M370 142 L394 70 L418 126 L432 46 L446 126 L470 70 L494 142 Z" fill={color} />;
  }
  if (glyph === "beret") {
    return <ellipse cx="446" cy="92" rx="74" ry="28" fill={color} transform="rotate(-18 446 92)" />;
  }
  if (glyph === "helm") {
    return (
      <path
        fill={color}
        fillRule="evenodd"
        d="M356 112 Q356 56 432 56 Q508 56 508 112 V190 Q508 216 432 216 Q356 216 356 190 Z M382 162 H482 V178 H382 Z"
      />
    );
  }
  return null;
}

function TorsoOnBody({ glyph, color }: { glyph: string; color: string }) {
  const sy = TORSO_TOP_Y;
  if (glyph === "vest") {
    return (
      <path
        fill={color}
        d={`M352 ${sy + 8} L392 ${sy - 12} L404 ${sy - 12} C404 ${sy + 52} 418 ${sy + 70} 432 ${sy + 70} C446 ${sy + 70} 460 ${sy + 52} 460 ${sy - 12} L472 ${sy - 12} L512 ${sy + 8} V572 H352 Z`}
      />
    );
  }
  if (glyph === "cloak") {
    return (
      <path
        fill={color}
        d={`M300 ${sy + 22} L352 ${sy - 12} L396 ${sy - 12} C396 ${sy + 54} 418 ${sy + 76} 432 ${sy + 76} C446 ${sy + 76} 468 ${sy + 54} 468 ${sy - 12} L512 ${sy - 12} L564 ${sy + 22} V500 H300 Z`}
      />
    );
  }
  if (glyph === "dress" || glyph === "robe") {
    return (
      <path
        fill={color}
        d={`M356 ${sy + 8} L396 ${sy - 12} L408 ${sy - 12} C408 ${sy + 50} 420 ${sy + 68} 432 ${sy + 68} C444 ${sy + 68} 456 ${sy + 50} 456 ${sy - 12} L468 ${sy - 12} L508 ${sy + 8} V530 H356 Z`}
      />
    );
  }
  if (glyph === "jacket" || glyph === "armor") {
    return (
      <g>
        <Top color={color} sleeve={586} hem={548} cuff={574} shoulderY={sy} />
        {glyph === "armor" && <rect x="392" y={sy + 22} width="80" height="188" fill="#000" opacity="0.16" />}
      </g>
    );
  }
  return <Top color={color} sleeve={468} hem={590} cuff={456} shoulderY={sy} />;
}

function ALine({ color, top, hemY }: { color: string; top: number; hemY: number }) {
  return <path fill={color} d={`M342 ${top} H522 L548 ${hemY} H316 Z`} />;
}

function TorsoExtra({ glyph, color }: { glyph: string; color: string }) {
  if (glyph === "dress" || glyph === "robe") return <ALine color={color} top={500} hemY={1016} />;
  if (glyph === "cloak") return <ALine color={color} top={470} hemY={900} />;
  return null;
}

function LegsOnBody({ glyph, color }: { glyph: string; color: string }) {
  if (glyph === "skirt") return null;
  if (glyph === "sandals") {
    return (
      <g fill={color}>
        <rect x="312" y="1038" width="96" height="14" rx="4" />
        <rect x="456" y="1038" width="96" height="14" rx="4" />
        <rect x="314" y="1052" width="100" height="36" rx="10" />
        <rect x="454" y="1052" width="100" height="36" rx="10" />
      </g>
    );
  }
  if (glyph === "boots" || glyph === "greaves") {
    const top = glyph === "boots" ? 900 : 748;
    return (
      <g fill={color}>
        <rect x="318" y={top} width="108" height={1100 - top} rx="12" />
        <rect x="440" y={top} width="108" height={1100 - top} rx="12" />
      </g>
    );
  }
  return (
    <g fill={color}>
      <rect x="334" y="498" width="196" height="206" />
      {glyph !== "shorts" && (
        <>
          <rect x="334" y="660" width="100" height="362" />
          <rect x="432" y="660" width="98" height="362" />
        </>
      )}
    </g>
  );
}

function LegsExtra({ glyph, color }: { glyph: string; color: string }) {
  if (glyph !== "skirt") return null;
  return <ALine color={color} top={498} hemY={860} />;
}

/** Лицо поверх пустой зоны female PNG (убирает «усы», добавляет глаза как у male). */
function FemaleFaceDetail() {
  const skin = "#fdd5b0";
  const skinShadow = "#e8b892";
  return (
    <svg
      viewBox="0 0 864 1152"
      className="pointer-events-none absolute inset-0 z-[25] h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <ellipse cx="432" cy="198" rx="72" ry="88" fill={skin} opacity="0.97" />
      <ellipse cx="432" cy="228" rx="38" ry="22" fill={skinShadow} opacity="0.35" />
      <path
        d="M388 158 Q404 148 420 154 Q432 158 444 154 Q460 148 476 158"
        stroke="#8b5a45"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="396" cy="178" rx="20" ry="24" fill="#fff" />
      <ellipse cx="468" cy="178" rx="20" ry="24" fill="#fff" />
      <ellipse cx="396" cy="180" rx="11" ry="14" fill="#5c4033" />
      <ellipse cx="468" cy="180" rx="11" ry="14" fill="#5c4033" />
      <ellipse cx="398" cy="182" rx="5" ry="6" fill="#1a120c" />
      <ellipse cx="470" cy="182" rx="5" ry="6" fill="#1a120c" />
      <ellipse cx="400" cy="176" rx="3" ry="3" fill="#fff" opacity="0.85" />
      <ellipse cx="472" cy="176" rx="3" ry="3" fill="#fff" opacity="0.85" />
      <path
        d="M418 200 Q432 208 446 200"
        stroke="#c9957a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M416 232 Q432 242 448 232"
        stroke="#d47878"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GearOverlay({
  src,
  maskId,
  head,
  shirt,
  pants,
  charm,
  headGlyph,
  torsoGlyph,
  legsGlyph,
}: {
  src: string;
  maskId: string;
  head?: string;
  shirt?: string;
  pants?: string;
  charm?: string;
  headGlyph?: string;
  torsoGlyph?: string;
  legsGlyph?: string;
}) {
  const whiteId = `${maskId}-white`;
  const torsoMaskId = `${maskId}-torso`;
  const legsMaskId = `${maskId}-legs`;
  const headMaskId = `${maskId}-head`;

  return (
    <svg
      viewBox="0 0 864 1152"
      className="absolute inset-0 z-10 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <filter id={whiteId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="864" height="1152">
          <image href={src} width="864" height="1152" filter={`url(#${whiteId})`} />
        </mask>
        <mask id={torsoMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="864" height="1152">
          <image href={src} width="864" height="1152" filter={`url(#${whiteId})`} />
          <rect x="0" y="0" width="864" height={TORSO_TOP_Y} fill="black" />
        </mask>
        <mask id={legsMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="864" height="1152">
          <image href={src} width="864" height="1152" filter={`url(#${whiteId})`} />
          <rect x="0" y="0" width="864" height={LEGS_TOP_Y} fill="black" />
        </mask>
        <mask id={headMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="864" height="1152">
          <rect x="0" y="0" width="864" height="1152" fill="black" />
          <image href={src} width="864" height="1152" filter={`url(#${whiteId})`} />
          <rect x="0" y={HEAD_ZONE_Y} width="864" height={1152 - HEAD_ZONE_Y} fill="black" />
        </mask>
        <clipPath id={`${maskId}-torso-clip`}>
          <rect x="240" y={TORSO_TOP_Y} width="384" height={1152 - TORSO_TOP_Y} />
        </clipPath>
        <clipPath id={`${maskId}-legs-clip`}>
          <rect x="240" y={LEGS_TOP_Y} width="384" height={1152 - LEGS_TOP_Y} />
        </clipPath>
      </defs>

      <g mask={`url(#${legsMaskId})`} clipPath={`url(#${maskId}-legs-clip)`}>
        {pants && legsGlyph && <LegsOnBody glyph={legsGlyph} color={pants} />}
      </g>
      {pants && legsGlyph && <LegsExtra glyph={legsGlyph} color={pants} />}

      {shirt && torsoGlyph && <TorsoExtra glyph={torsoGlyph} color={shirt} />}
      <g mask={`url(#${torsoMaskId})`} clipPath={`url(#${maskId}-torso-clip)`}>
        {shirt && torsoGlyph && <TorsoOnBody glyph={torsoGlyph} color={shirt} />}
      </g>

      <g mask={`url(#${headMaskId})`}>
        {head && headGlyph && <HeadOnBody glyph={headGlyph} color={head} />}
      </g>

      {charm && <circle cx="432" cy="400" r="13" fill={charm} stroke="#fff" strokeWidth="3" />}
    </svg>
  );
}

function HeadExtraLayer({
  head,
  headGlyph,
}: {
  head?: string;
  headGlyph?: string;
}) {
  if (!head || !headGlyph) return null;
  const extra = HeadExtra({ glyph: headGlyph, color: head });
  if (!extra) return null;
  return (
    <svg
      viewBox="0 0 864 1152"
      className="pointer-events-none absolute inset-0 z-[30] h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {extra}
    </svg>
  );
}

export const CharacterFlat = memo(function CharacterFlat({
  scene,
}: {
  scene?: "masthead" | "tower";
}) {
  const rawCharacter = useAppStore(useShallow((s) => s.character));
  const character = useMemo(() => normalizeCharacter(rawCharacter), [rawCharacter]);
  const pulse = useAppStore((s) => s.seasonFlame?.value ?? 100);
  const tired = pulse < 30;
  const female = (character.gender ?? "male") === "female";
  const equipped = character.equipped;
  const headItem = equipped.head ? itemById(equipped.head) : undefined;
  const torsoItem = equipped.torso ? itemById(equipped.torso) : undefined;
  const legsItem = equipped.legs ? itemById(equipped.legs) : undefined;
  const charmItem = equipped.charm ? itemById(equipped.charm) : undefined;
  const maskId = `hero-body-${useId().replace(/:/g, "")}`;
  const portrait = female ? "/hero-2d-female.png" : "/hero-2d-male.png";
  const headGlyph = headItem?.glyph;
  const showFemaleFace = female && !headHidesFace(headGlyph);

  return (
    <div
      className={cn("relative h-full w-full", tired && "opacity-80 saturate-75")}
      role="img"
      aria-label={RACES[character.race].name}
    >
      <img src={portrait} alt="" className="relative z-0 h-full w-full object-contain" />
      <GearOverlay
        src={portrait}
        maskId={maskId}
        head={headItem ? fillOf(equipped.head, "#0f766e") : undefined}
        shirt={torsoItem ? fillOf(equipped.torso, "#cbb89a") : undefined}
        pants={legsItem ? fillOf(equipped.legs, "#7c654c") : undefined}
        charm={charmItem ? fillOf(equipped.charm, RARITY_FILL[charmItem.rarity]) : undefined}
        headGlyph={headGlyph}
        torsoGlyph={torsoItem?.glyph}
        legsGlyph={legsItem?.glyph}
      />
      {showFemaleFace && <FemaleFaceDetail />}
      <HeadExtraLayer
        head={headItem ? fillOf(equipped.head, "#0f766e") : undefined}
        headGlyph={headGlyph}
      />
    </div>
  );
});
