"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AVATAR_EMOJIS } from "@/lib/avatars";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function AvatarPicker() {
  const avatar = useAppStore((s) => s.profile.avatar);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-6xl transition-transform hover:scale-105">
          {avatar}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выберите аватар</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={cn(
                "rounded-lg p-2 text-2xl transition-colors hover:bg-white/10",
                avatar === emoji && "bg-primary/20 ring-2 ring-primary"
              )}
              onClick={() => {
                updateProfile({ avatar: emoji });
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
