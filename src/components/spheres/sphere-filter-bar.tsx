"use client";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { SphereGlyph } from "./sphere-glyph";

type Props = {
  className?: string;
  /** Внутри карточки — без лишней подписи сверху */
  variant?: "default" | "inline";
};

export function SphereFilterBar({ className, variant = "default" }: Props) {
  const spheres = useAppStore((s) => s.spheres);
  const hiddenSphereIds = useAppStore((s) => s.hiddenSphereIds);
  const toggleSphereVisibility = useAppStore((s) => s.toggleSphereVisibility);

  if (spheres.length === 0) return null;

  const allVisible = hiddenSphereIds.length === 0;

  return (
    <div className={cn("no-print", className)}>
      {variant === "default" && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Фокус сезона
          </p>
          {!allVisible && (
            <button
              type="button"
              className="text-[10px] text-primary hover:underline"
              onClick={() => useAppStore.setState({ hiddenSphereIds: [] })}
            >
              Показать все
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {spheres.map((sphere) => {
          const visible = !hiddenSphereIds.includes(sphere.id);
          return (
            <button
              key={sphere.id}
              type="button"
              onClick={() => toggleSphereVisibility(sphere.id)}
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-all",
                visible
                  ? "bg-card/80 font-medium shadow-sm"
                  : "opacity-40 hover:opacity-65"
              )}
              style={
                visible
                  ? {
                      boxShadow: `inset 0 0 0 1px ${sphere.color}44`,
                    }
                  : undefined
              }
              title={visible ? `Скрыть: ${sphere.name}` : `Показать: ${sphere.name}`}
            >
              <SphereGlyph icon={sphere.icon} color={sphere.color} size="xs" />
              <span className="truncate">{sphere.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
