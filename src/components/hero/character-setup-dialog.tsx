"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { normalizeCharacter } from "@/lib/rpg/normalize-game";
import type { CharacterGender } from "@/types/rpg";
import { cn } from "@/lib/utils";

export function CharacterSetupDialog() {
  const done = normalizeCharacter(useAppStore((s) => s.character)).identitySetupDone;
  const setupIdentity = useAppStore((s) => s.setupCharacterIdentity);
  const [gender, setGender] = useState<CharacterGender>("male");
  const [birthDate, setBirthDate] = useState("");

  if (done) return null;

  return (
    <Dialog open={true}>
      <DialogContent
        className="game-surface border-white/10 sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Твой герой</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["male", "Парень"],
                ["female", "Девушка"],
              ] as const
            ).map(([g, label]) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={cn(
                  "rounded-xl border py-5 text-sm font-semibold transition-all",
                  gender === g
                    ? "border-primary bg-primary/15 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                    : "border-white/10 hover:border-white/25"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div>
            <Label className="text-muted-foreground">Дата рождения</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1.5 border-white/10 bg-black/20"
            />
          </div>
          <Button
            className="h-11 w-full text-base"
            disabled={!birthDate}
            onClick={() => setupIdentity(gender, birthDate)}
          >
            В игру
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
