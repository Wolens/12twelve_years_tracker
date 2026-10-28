"use client";

import { Button } from "@/components/ui/button";
import { UI_CLICK_LABEL } from "@/lib/sfx/sound-presets";
import { playUiClickPreset } from "@/lib/sfx/play-ui-click";
import { SoundVolumeSlider } from "@/components/settings/sound-volume-slider";

export function SoundPresetPicker() {
  return (
    <div className="space-y-3 pt-1">
      <SoundVolumeSlider />
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2.5 dark:border-white/10">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Щелчок кнопок
          </p>
          <p className="text-sm font-medium">{UI_CLICK_LABEL.title}</p>
          <p className="text-[11px] text-muted-foreground">{UI_CLICK_LABEL.hint}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 text-xs"
          data-silent
          onClick={() => playUiClickPreset("prism", 0.55, true)}
        >
          ▶
        </Button>
      </div>
    </div>
  );
}
