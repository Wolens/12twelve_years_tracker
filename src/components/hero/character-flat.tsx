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

function fillOf(id: string | undefined, fallback: string) {
  if (!id) return fallback;
  return spriteColorForItem(id, fallback);
}

/** Scoop-neck top. Shoulders and sleeves follow the measured silhouette; hem overlaps the baked shorts. */
function Top({
  color,
  sleeve,
  hem,
  cuff,
}: {
  color: string;
  sleeve: number;
  hem: number;
  cuff?: number;
}) {
  return (
    <g fill={color}>
      <path
        d={`M292 304
            L348 262
            L396 262
            C396 332 418 356 432 356
            C446 356 468 332 468 262
            L516 262
            L572 304
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

/** Baseball cap: smooth dome over the hair, not clipped to the hair silhouette. */
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
      return null;
    case "beret":
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
    case "crown":
      return null;
    case "helm":
      return null;
    default:
      return null;
  }
}

/** Headwear with its own shape (not the hair/body mask). */
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
  if (glyph === "vest") {
    return (
      <path
        fill={color}
        d="M352 286 L392 266 L404 266 C404 330 418 348 432 348 C446 348 460 330 460 266 L472 266 L512 286 V572 H352 Z"
      />
    );
  }
  if (glyph === "cloak") {
    return (
      <path
        fill={color}
        d="M300 300 L352 266 L396 266 C396 332 418 354 432 354 C446 354 468 332 468 266 L512 266 L564 300 V500 H300 Z"
      />
    );
  }
  if (glyph === "dress" || glyph === "robe") {
    return (
      <path
        fill={color}
        d="M356 286 L396 266 L408 266 C408 328 420 346 432 346 C444 346 456 328 456 266 L468 266 L508 286 V530 H356 Z"
      />
    );
  }
  if (glyph === "jacket" || glyph === "armor") {
    return (
      <g>
        <Top color={color} sleeve={586} hem={548} cuff={574} />
        {glyph === "armor" && <rect x="392" y="300" width="80" height="188" fill="#000" opacity="0.16" />}
      </g>
    );
  }
  return <Top color={color} sleeve={468} hem={590} cuff={456} />;
}

/** Fills the gap between the legs so a skirt or dress is one piece, and stays clear of the hands. */
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

function HeldWeapon({ glyph, color }: { glyph: string; color: string }) {
  if (glyph === "bow") {
    return (
      <g transform="translate(560 430)">
        <path d="M20 20 Q-30 -40 20 -120" fill="none" stroke="#6b4a32" strokeWidth="6" />
        <path d="M20 20 L20 -120" stroke="#f5f5f4" strokeWidth="2" />
      </g>
    );
  }
  if (glyph === "staff" || glyph === "spear" || glyph === "wand") {
    return (
      <g transform="translate(568 520)">
        <path d="M0 40 V-280" stroke="#6b4a32" strokeWidth="7" strokeLinecap="round" />
        <circle cy="-292" r="14" fill={color} />
      </g>
    );
  }
  if (glyph === "axe" || glyph === "mace") {
    return (
      <g transform="translate(560 480)">
        <path d="M0 30 V-120" stroke="#6b4a32" strokeWidth="8" strokeLinecap="round" />
        <circle cy="-140" r="22" fill={color} />
      </g>
    );
  }
  return (
    <g transform="translate(548 500) rotate(16)">
      <path d="M-7 8 L-5 -130 L0 -150 L5 -130 L7 8 Z" fill={color} />
      <path d="M-22 6 H22" stroke="#e7e5e4" strokeWidth="8" strokeLinecap="round" />
      <path d="M-5 10 H5 V36 H-5 Z" fill="#44403c" />
    </g>
  );
}

/** Clothes are painted only where the character pixels are, so they follow the body and cover the baked shorts. */
function GearOverlay({
  src,
  maskId,
  head,
  shirt,
  pants,
  weapon,
  charm,
  headGlyph,
  torsoGlyph,
  legsGlyph,
  weaponGlyph,
}: {
  src: string;
  maskId: string;
  head?: string;
  shirt?: string;
  pants?: string;
  weapon?: string;
  charm?: string;
  headGlyph?: string;
  torsoGlyph?: string;
  legsGlyph?: string;
  weaponGlyph?: string;
}) {
  const whiteId = `${maskId}-white`;
  return (
    <svg viewBox="0 0 864 1152" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <filter id={whiteId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="864" height="1152">
          <image href={src} width="864" height="1152" filter={`url(#${whiteId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {pants && legsGlyph && <LegsOnBody glyph={legsGlyph} color={pants} />}
      </g>
      {pants && legsGlyph && <LegsExtra glyph={legsGlyph} color={pants} />}
      {shirt && torsoGlyph && <TorsoExtra glyph={torsoGlyph} color={shirt} />}
      <g mask={`url(#${maskId})`}>
        {shirt && torsoGlyph && <TorsoOnBody glyph={torsoGlyph} color={shirt} />}
        {head && headGlyph && <HeadOnBody glyph={headGlyph} color={head} />}
      </g>
      {head && headGlyph && <HeadExtra glyph={headGlyph} color={head} />}
      {charm && <circle cx="432" cy="400" r="13" fill={charm} stroke="#fff" strokeWidth="3" />}
      {weapon && weaponGlyph && <HeldWeapon glyph={weaponGlyph} color={weapon} />}
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
  const weaponItem = equipped.weapon ? itemById(equipped.weapon) : undefined;
  const onTower = scene === "tower";
  const maskId = `hero-body-${useId().replace(/:/g, "")}`;
  const portrait = female ? "/hero-2d-female.png" : "/hero-2d-male.png";

  return (
    <div className={cn("relative h-full w-full", tired && "opacity-80 saturate-75")} role="img" aria-label={RACES[character.race].name}>
      <img src={portrait} alt="" className="h-full w-full object-contain" />
      <GearOverlay
        src={portrait}
        maskId={maskId}
        head={headItem ? fillOf(equipped.head, "#0f766e") : undefined}
        shirt={torsoItem ? fillOf(equipped.torso, "#cbb89a") : undefined}
        pants={legsItem ? fillOf(equipped.legs, "#7c654c") : undefined}
        weapon={weaponItem ? spriteColorForItem(equipped.weapon, RARITY_FILL[weaponItem.rarity]) : undefined}
        charm={charmItem ? fillOf(equipped.charm, RARITY_FILL[charmItem.rarity]) : undefined}
        headGlyph={headItem?.glyph}
        torsoGlyph={torsoItem?.glyph}
        legsGlyph={legsItem?.glyph}
        weaponGlyph={weaponItem?.glyph}
      />
    </div>
  );
});
