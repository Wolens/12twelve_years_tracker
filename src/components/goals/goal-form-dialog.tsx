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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import type { Goal, GoalType } from "@/types";
import { Plus } from "lucide-react";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";

type Props = {
  editGoal?: Goal;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  defaultSphereId?: string;
  hideTrigger?: boolean;
};

export function GoalFormDialog({
  editGoal,
  open,
  onOpenChange,
  defaultSphereId,
  hideTrigger,
}: Props) {
  const spheres = useAppStore((s) => s.spheres);
  const addGoal = useAppStore((s) => s.addGoal);
  const updateGoal = useAppStore((s) => s.updateGoal);

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [sphereId, setSphereId] = useState(
    editGoal?.sphereId ?? defaultSphereId ?? ""
  );
  const [title, setTitle] = useState(editGoal?.title ?? "");
  const [type, setType] = useState<GoalType>(editGoal?.type ?? "onetime");
  const [targetCount, setTargetCount] = useState(String(editGoal?.targetCount ?? 12));
  const [unit, setUnit] = useState(editGoal?.unit ?? "");
  const [startValue, setStartValue] = useState(String(editGoal?.startValue ?? 0));
  const [targetValue, setTargetValue] = useState(String(editGoal?.targetValue ?? 100));
  const [direction, setDirection] = useState<"up" | "down">(
    editGoal?.direction ?? "up"
  );

  useEffect(() => {
    if (!dialogOpen) return;
    if (editGoal) {
      setSphereId(editGoal.sphereId);
      setTitle(editGoal.title);
      setType(editGoal.type);
      return;
    }
    if (defaultSphereId) setSphereId(defaultSphereId);
  }, [dialogOpen, defaultSphereId, editGoal]);

  const effectiveSphereId = defaultSphereId ?? sphereId;

  const submit = () => {
    const sid = effectiveSphereId;
    if (!title.trim() || !sid) return;
    const base = {
      sphereId: sid,
      title: title.trim(),
      type,
      unit: unit || undefined,
    };
    if (type === "onetime") {
      const payload = {
        ...base,
        done: editGoal?.done ?? false,
        completed: editGoal?.completed ?? false,
      };
      if (editGoal) updateGoal(editGoal.id, payload);
      else addGoal(payload);
    } else if (type === "counter") {
      const payload = {
        ...base,
        targetCount: parseInt(targetCount, 10) || 1,
        increments: editGoal?.increments ?? [],
      };
      if (editGoal) updateGoal(editGoal.id, payload);
      else addGoal(payload);
    } else {
      const start = parseFloat(startValue) || 0;
      const target = parseFloat(targetValue) || 0;
      const payload = {
        ...base,
        startValue: start,
        targetValue: target,
        currentValue:
          editGoal?.currentValue !== undefined
            ? editGoal.currentValue
            : editGoal?.measurements?.length
              ? editGoal.measurements[editGoal.measurements.length - 1].value
              : start,
        direction,
        measurements: editGoal?.measurements ?? [],
      };
      if (editGoal) updateGoal(editGoal.id, payload);
      else addGoal(payload);
    }
    setDialogOpen(false);
    if (!editGoal) {
      setTitle("");
      setType("onetime");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!hideTrigger && !editGoal && (
        <DialogTrigger asChild>
          <Button className="gap-2" size="sm">
            <Plus className="h-4 w-4" /> Цель
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editGoal ? "Редактировать цель" : "Цель на 12 недель"}</DialogTitle>
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          {!defaultSphereId && (
            <div>
              <Label>Сфера</Label>
              <Select value={sphereId} onValueChange={setSphereId}>
                <SelectTrigger>
                  <SelectValue placeholder="Сфера" />
                </SelectTrigger>
                <SelectContent>
                  {spheres.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <SphereGlyph icon={s.icon} color={s.color} size="xs" plain />
                        {s.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Тип</Label>
            <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onetime">Разовая</SelectItem>
                <SelectItem value="counter">Количественная (счётчик)</SelectItem>
                <SelectItem value="metric">Числовая (метрика)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Единица (опционально)</Label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="кг, ₽, рилс"
            />
          </div>
          {type === "counter" && (
            <div>
              <Label>Цель (количество за цикл)</Label>
              <Input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
              />
            </div>
          )}
          {type === "metric" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Старт</Label>
                  <Input value={startValue} onChange={(e) => setStartValue(e.target.value)} />
                </div>
                <div>
                  <Label>Цель</Label>
                  <Input value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Направление</Label>
                <Select value={direction} onValueChange={(v) => setDirection(v as "up" | "down")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Рост (накопления)</SelectItem>
                    <SelectItem value="down">Снижение (вес)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <Button type="submit" className="w-full">Сохранить</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
