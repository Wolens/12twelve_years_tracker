"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function CoinDisc({ className }: { className?: string }) {
  return (
    <span className={cn("coin-disc", className)} aria-hidden>
      <span className="coin-disc-mark" />
    </span>
  );
}

export function CoinBadge({
  amount,
  className,
  onClick,
}: {
  amount: number;
  className?: string;
  onClick?: () => void;
}) {
  const label = `Монеты: ${amount}. Открыть магазин`;
  const body = (
    <>
      <CoinDisc />
      <span>{amount}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn("coin-badge", className)} aria-label={label}>
        {body}
      </button>
    );
  }

  return (
    <Link href="/hero" scroll={false} className={cn("coin-badge", className)} aria-label={label}>
      {body}
    </Link>
  );
}
