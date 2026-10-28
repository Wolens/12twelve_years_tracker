"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRESET_SPHERE_ICON_KEYS,
  SPHERE_ICONS,
  SPHERE_ICON_LABELS,
  isExtraSphereIcon,
  isPresetSphereIcon,
  isStoredSphereEmoji,
  resolveExtraSphereIconKey,
} from "@/lib/sphere-icons";
import { SphereIconVisual } from "./sphere-icon-visual";
import { SphereExtraIconPickerDialog } from "./sphere-extra-icon-picker-dialog";

type Props = {
  value: string;
  color: string;
  onChange: (icon: string) => void;
  /** Только доп. иконки (форма «своё направление» на онбординге). */
  emojiOnly?: boolean;
};

function PreviewIcon({ icon, color, size = "md" }: { icon: string; color: string; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-10 w-10 rounded-xl" : "h-11 w-11 rounded-xl";
  const px = size === "sm" ? 18 : 20;
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center", box)}
      style={{
        backgroundColor: `${color}1f`,
        color,
        boxShadow: `inset 0 0 0 1px ${color}33`,
      }}
    >
      <SphereIconVisual icon={icon} color={color} px={px} stroke={2} />
    </span>
  );
}

export function SphereIconPicker({ value, color, onChange, emojiOnly }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const displayIcon = resolveExtraSphereIconKey(value);
  const presetActive = isPresetSphereIcon(value);
  const customSignActive =
    emojiOnly ||
    isExtraSphereIcon(value) ||
    isStoredSphereEmoji(value) ||
    value === "custom";
  const dialogValue = isExtraSphereIcon(value) ? value : "";

  if (emojiOnly) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/10"
          style={{ boxShadow: `0 0 0 1px ${color}33` }}
        >
          <PreviewIcon icon={displayIcon} color={color} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Знак</span>
            <span className="text-xs text-muted-foreground">Открыть список иконок</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
        <SphereExtraIconPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          value={dialogValue}
          color={color}
          onSelect={onChange}
        />
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
        {PRESET_SPHERE_ICON_KEYS.map((key) => {
          const Icon = SPHERE_ICONS[key];
          const selected = presetActive && value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] transition-all",
                selected
                  ? "border-white/25 bg-white/10"
                  : "border-white/5 bg-transparent opacity-70 hover:opacity-100"
              )}
              style={
                selected
                  ? { boxShadow: `0 0 0 1px ${color}55`, color }
                  : undefined
              }
              title={SPHERE_ICON_LABELS[key]}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span className="truncate text-muted-foreground">{SPHERE_ICON_LABELS[key]}</span>
            </button>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Своё направление
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
            customSignActive && !presetActive
              ? "border-white/20 bg-white/10"
              : "border-white/5 bg-transparent opacity-80 hover:opacity-100"
          )}
          style={
            customSignActive && !presetActive
              ? { boxShadow: `0 0 0 1px ${color}55`, backgroundColor: `${color}0c` }
              : undefined
          }
        >
          <PreviewIcon icon={displayIcon} color={color} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Свой знак</span>
            <span className="text-xs text-muted-foreground">
              Иконки из списка — такие же, как в интерфейсе
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <SphereExtraIconPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={dialogValue}
        color={color}
        onSelect={onChange}
      />
    </div>
  );
}
