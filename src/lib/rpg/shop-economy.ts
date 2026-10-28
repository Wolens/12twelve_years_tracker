import type { GameItem } from "@/types/rpg";
import { STARTER_ITEM_IDS, itemById } from "./catalog";

/** Цена продажи в магазин: всегда меньше цены покупки. 0 — продать нельзя. */
export function itemShopSellPrice(item: GameItem): number {
  if (item.price <= 0) return 0;
  if (item.price === 1) return 0;
  const sell = Math.floor(item.price * 0.55);
  if (sell <= 0 || sell >= item.price) return Math.max(0, item.price - 1);
  return sell;
}

export function canSellShopItem(itemId: string): boolean {
  const item = itemById(itemId);
  if (!item) return false;
  if (STARTER_ITEM_IDS.includes(item.id as (typeof STARTER_ITEM_IDS)[number])) return false;
  const sell = itemShopSellPrice(item);
  return sell > 0 && sell < item.price;
}
