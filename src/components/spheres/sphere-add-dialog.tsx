"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { DEFAULT_EXTRA_SPHERE_ICON } from "@/lib/sphere-extra-icons";
import { SphereIconPicker } from "./sphere-icon-picker";

import { SPHERE_COLORS } from "@/lib/sphere-colors";

const COLORS = [...SPHERE_COLORS];

export function SphereAddDialog() {
  const addSphere = useAppStore((s) => s.addSphere);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_EXTRA_SPHERE_ICON);
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    addSphere({
      name: name.trim(),
      icon,
      color,
    });
    setName("");
    setIcon(DEFAULT_EXTRA_SPHERE_ICON);
    setColor(COLORS[0]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Новая цель
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить цель</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <Label>Название</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Знак</Label>
            <SphereIconPicker value={icon} color={color} onChange={setIcon} />
          </div>
          <div>
            <Label>Цвет</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "h-9 w-9 rounded-full border-2",
                    color === c ? "border-white" : "border-transparent"
                  )}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">Добавить</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
