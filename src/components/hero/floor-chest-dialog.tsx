"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { itemById, RARITY_STYLES } from "@/lib/rpg/catalog";
import type { ItemRarity } from "@/types/rpg";
import { playLegendaryDrop } from "@/lib/sfx/play-legendary-drop";
import { CoinDisc } from "./coin-badge";
import { DungeonChestGraphic } from "./dungeon-chest-graphic";
import { ItemGlyph } from "./item-glyph";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FloorChestReveal = {
  itemId: string;
  itemName: string;
  rarity: ItemRarity;
  duplicate: boolean;
  coins: number;
};

export function FloorChestDialog({
  floorDay,
  reachDay,
  open,
  onOpenChange,
}: {
  floorDay: number | null;
  reachDay: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const openFloorChest = useAppStore((s) => s.openFloorChest);
  const [phase, setPhase] = useState<"idle" | "shake" | "burst" | "reveal">("idle");
  const [result, setResult] = useState<FloorChestReveal | null>(null);
  const grantedRef = useRef(false);

  useEffect(() => {
    if (!open || floorDay === null) {
      setPhase("idle");
      setResult(null);
      grantedRef.current = false;
      return;
    }
    if (grantedRef.current) return;
    grantedRef.current = true;
    setPhase("shake");
    setResult(null);
    const shakeEnd = window.setTimeout(() => setPhase("burst"), 1200);
    const grant = window.setTimeout(() => {
      const r = openFloorChest(floorDay, reachDay);
      if (!r) {
        onOpenChange(false);
        return;
      }
      setResult(r);
      setPhase("reveal");
    }, 1550);
    return () => {
      window.clearTimeout(shakeEnd);
      window.clearTimeout(grant);
    };
  }, [open, floorDay, reachDay, openFloorChest, onOpenChange]);

  useEffect(() => {
    if (phase === "reveal" && result?.rarity === "legendary") {
      playLegendaryDrop();
    }
  }, [phase, result]);

  const item = result ? itemById(result.itemId) : undefined;
  const style = result ? RARITY_STYLES[result.rarity] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-white/10 bg-zinc-950/95 text-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Сундук недели</DialogTitle>
        </DialogHeader>

        <div className="relative mx-auto flex h-40 w-full items-center justify-center">
          {(phase === "shake" || phase === "burst") && (
            <div
              className={cn(
                "relative",
                phase === "shake" && "chest-shake",
                phase === "burst" && "chest-burst"
              )}
            >
              <DungeonChestGraphic
                variant={phase === "burst" ? "open" : "ready"}
                className="h-20 w-[5.5rem]"
              />
              {phase === "burst" && (
                <div className="chest-flash pointer-events-none absolute inset-0 rounded-full bg-amber-200/40 blur-xl" />
              )}
            </div>
          )}
          {phase === "reveal" && result && item && (
            <div className="animate-in fade-in zoom-in-95 space-y-3 duration-500">
              <div
                className={cn(
                  "mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border-2 bg-black/40",
                  style?.border,
                  style?.glow
                )}
              >
                <ItemGlyph itemId={result.itemId} glyph={item.glyph} className="h-14 w-14 text-white" />
              </div>
              <p className={cn("text-xs font-semibold uppercase tracking-wider", style?.text)}>
                {style?.label}
              </p>
              <p className="font-display text-lg font-bold">{result.itemName}</p>
              {result.duplicate ? (
                <p className="text-sm text-muted-foreground">
                  Уже в сумке — обменяли на{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-200">
                    <CoinDisc className="h-4 w-4" />
                    {result.coins}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-emerald-200/90">Добавлено в сумку</p>
              )}
            </div>
          )}
        </div>

        {phase === "reveal" && (
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Забрать
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
