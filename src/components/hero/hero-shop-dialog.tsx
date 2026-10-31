"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShopPanel } from "@/components/hero/hero-tab-panels";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HeroShopDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Магазин</DialogTitle>
        </DialogHeader>
        <ShopPanel embedded />
      </DialogContent>
    </Dialog>
  );
}
