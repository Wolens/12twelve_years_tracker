"use client";

import { useState, useEffect } from "react";
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
import type { Sphere } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { SphereIconPicker } from "./sphere-icon-picker";
import { preserveSphereIcon } from "@/lib/sphere-icons";

import { SPHERE_COLORS } from "@/lib/sphere-colors";

const COLORS = [...SPHERE_COLORS];

type Props = {
  sphere: Sphere;
  trigger?: React.ReactNode;
  allowDelete?: boolean;
};

export function SphereEditDialog({ sphere, trigger, allowDelete }: Props) {
  const updateSphere = useAppStore((s) => s.updateSphere);
  const deleteSphere = useAppStore((s) => s.deleteSphere);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(sphere.name);
  const [icon, setIcon] = useState(() => preserveSphereIcon(sphere.icon));
  const [color, setColor] = useState(sphere.color);

  useEffect(() => {
    if (!open) return;
    setName(sphere.name);
    setIcon(preserveSphereIcon(sphere.icon));
    setColor(sphere.color || SPHERE_COLORS[0]);
  }, [open, sphere.id, sphere.name, sphere.icon]);

  const save = () => {
    if (!name.trim()) return;
    updateSphere(sphere.id, {
      name: name.trim(),
      icon,
      color,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1">
            <Pencil className="h-3.5 w-3.5" />
            Изменить
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать направление</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
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
          <Button type="submit" className="w-full">Сохранить</Button>
          {allowDelete && (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (
                  !confirm(
                    `Удалить сферу «${sphere.name}»? Все цели и задачи в ней тоже удалятся.`
                  )
                ) {
                  return;
                }
                deleteSphere(sphere.id);
                setOpen(false);
              }}
            >
              Удалить сферу
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
