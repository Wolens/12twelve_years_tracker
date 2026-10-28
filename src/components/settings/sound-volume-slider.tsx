"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider-simple";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getSoundVolumePercent, setSoundVolumePercent } from "@/lib/sfx/audio-engine";
import { notifySoundPrefChange, SOUND_CHANGE } from "@/components/audio/sound-provider";

type Props = {
  compact?: boolean;
  className?: string;
};

export function SoundVolumeSlider({ compact, className }: Props) {
  const [vol, setVol] = useState(100);

  useEffect(() => {
    const sync = () => setVol(getSoundVolumePercent());
    sync();
    window.addEventListener(SOUND_CHANGE, sync);
    return () => window.removeEventListener(SOUND_CHANGE, sync);
  }, []);

  const onChange = (value: number[]) => {
    const next = value[0] ?? 0;
    setVol(next);
    setSoundVolumePercent(next);
    notifySoundPrefChange();
  };

  const muted = vol === 0;

  if (compact) {
    return (
      <div
        className={cn(
          "flex min-w-0 items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 px-2 py-1",
          className
        )}
        data-silent
      >
        {muted ? (
          <VolumeX className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <Slider
          min={0}
          max={100}
          step={1}
          value={[vol]}
          onValueChange={onChange}
          className="w-[5.5rem] py-2 [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5"
          aria-label="Громкость звука"
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 rounded-lg bg-white/5 px-3 py-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="sound-volume" className="text-foreground">
          Звуковое сопровождение
        </Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {muted ? "выкл." : `${vol}%`}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {muted ? (
          <VolumeX className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <Slider
          min={0}
          max={100}
          step={1}
          value={[vol]}
          onValueChange={onChange}
          className="flex-1"
          aria-label="Громкость звука"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        На нуле — без щелчков и звуков наград. Мелодии на «Пути» пока отключены.
      </p>
    </div>
  );
}
