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

const COLORS = [
  "#34d399",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#60a5fa",
  "#fb7185",
  "#4ade80",
  "#38bdf8",
];

export function SphereAddDialog() {
  const addSphere = useAppStore((s) => s.addSphere);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    addSphere({
      name: name.trim(),
      icon: icon || "⭐",
      color,
    });
    setName("");
    setIcon("⭐");
    setColor(COLORS[0]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Новая сфера
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить сферу</DialogTitle>
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
            <Label>Иконка (эмодзи)</Label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={4}
            />
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
