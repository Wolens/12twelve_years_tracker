"use client";

import { memo, useState } from "react";
import { HandCoins } from "lucide-react";
import type { GameItem } from "@/types/rpg";
import { RARITY_STYLES } from "@/lib/rpg/catalog";
import { canSellShopItem, itemShopSellPrice } from "@/lib/rpg/shop-economy";
import { CoinDisc } from "@/components/hero/coin-badge";
import { ItemBonuses } from "@/components/hero/item-bonuses";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ItemGlyph } from "@/components/hero/item-glyph";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  item: GameItem;
  owned?: boolean;
  equipped?: boolean;
  canAfford?: boolean;
  playerLevel?: number;
  onBuy?: () => void;
  onEquip?: () => void;
  onUnequip?: () => void;
  onSell?: () => void;
};

const STRIPE: Record<GameItem["rarity"], string> = {
  common: "rarity-stripe-common",
  uncommon: "rarity-stripe-uncommon",
  rare: "rarity-stripe-rare",
  epic: "rarity-stripe-epic",
  legendary: "rarity-stripe-legendary",
};

export const ItemCard = memo(function ItemCard({
  item,
  owned,
  equipped,
  canAfford,
  playerLevel,
  onBuy,
  onEquip,
  onUnequip,
  onSell,
}: Props) {
  const style = RARITY_STYLES[item.rarity];
  const locked = playerLevel !== undefined && playerLevel < item.requiredLevel;
  const sellPrice = itemShopSellPrice(item);
  const sellable = owned && onSell && canSellShopItem(item.id);
  const [sellOpen, setSellOpen] = useState(false);

  const handleOwnedClick = () => {
    if (equipped) onUnequip?.();
    else onEquip?.();
  };

  const confirmSell = () => {
    onSell?.();
    setSellOpen(false);
  };

  return (
    <>
      <div className={cn("game-surface overflow-hidden p-0", style.glow)}>
        <div className={cn("h-1 w-full bg-gradient-to-r", STRIPE[item.rarity])} />
        <div className="p-2.5">
          <div className="flex items-start gap-2">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/80 dark:bg-black/40",
                style.text
              )}
            >
              <ItemGlyph itemId={item.id} glyph={item.glyph} className="h-8 w-8" />
            </span>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-1 pt-0.5">
              <p className={cn("text-[10px] font-semibold uppercase leading-tight tracking-wide", style.text)}>
                {style.label}
              </p>
              <ItemBonuses
                health={item.healthBonus}
                strength={item.strengthBonus}
                compact
                className="shrink-0"
              />
            </div>
          </div>
          <p className="mt-2 text-sm font-medium leading-snug">{item.name}</p>
          <div className="mt-3">
            {owned ? (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="min-w-0 flex-1"
                  variant={equipped ? "secondary" : "outline"}
                  onClick={handleOwnedClick}
                >
                  {equipped ? "Снять" : item.slot === "weapon" ? "Взять" : "Надеть"}
                </Button>
                {sellable && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 shrink-0 px-0 text-amber-700 dark:text-amber-200"
                    aria-label={`Продать за ${sellPrice} монет`}
                    onClick={() => setSellOpen(true)}
                  >
                    <HandCoins className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : locked ? (
              <Button size="sm" className="w-full" disabled>
                Нужен {item.requiredLevel} ур.
              </Button>
            ) : (
              <Button size="sm" className="w-full" disabled={!canAfford} onClick={onBuy}>
                <CoinDisc className="coin-disc-sm" />
                {item.price}
              </Button>
            )}
          </div>
        </div>
      </div>

      {sellable && (
        <Dialog open={sellOpen} onOpenChange={setSellOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Продать предмет?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {item.name} вернётся в магазин. Ты получишь{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <CoinDisc className="coin-disc-sm" />
                {sellPrice}
              </span>{" "}
              (куплено за {item.price}).
            </p>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setSellOpen(false)}>
                Отмена
              </Button>
              <Button className="flex-1" onClick={confirmSell}>
                <HandCoins className="mr-1.5 h-4 w-4" />
                Продать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});
