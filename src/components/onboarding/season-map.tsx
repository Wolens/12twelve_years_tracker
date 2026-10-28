"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Decorative 12-week grid — the same language as the real dashboard map. */
export function SeasonMap({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-sm", className)} aria-hidden>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 + n * 0.045, type: "spring", stiffness: 380, damping: 22 }}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-xl border text-sm font-semibold",
              n === 1
                ? "border-primary bg-primary/20 text-primary shadow-[0_0_22px_rgba(52,211,153,0.35)]"
                : "border-white/10 bg-card/50 text-muted-foreground"
            )}
          >
            {n === 1 && (
              <motion.span
                className="absolute inset-0 rounded-xl bg-primary/15"
                animate={{ opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <span className="relative">{n}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        12 недель · один круг
      </p>
    </div>
  );
}
