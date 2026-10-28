"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EXTRA_SPHERE_ICON_DEFS } from "@/lib/sphere-extra-icons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  color: string;
  onSelect: (key: string) => void;
};

export function SphereExtraIconPickerDialog({
  open,
  onOpenChange,
  value,
  color,
  onSelect,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Знак для направления</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {EXTRA_SPHERE_ICON_DEFS.map(({ key, label, Icon }) => {
            const selected = value === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onSelect(key);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] transition-all",
                  selected
                    ? "border-white/25 bg-white/10"
                    : "border-white/5 bg-transparent opacity-80 hover:border-white/15 hover:opacity-100"
                )}
                style={
                  selected
                    ? { boxShadow: `0 0 0 1px ${color}55`, color }
                    : undefined
                }
                title={label}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span className="truncate text-muted-foreground">{label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
