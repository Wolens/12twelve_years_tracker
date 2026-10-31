"use client";

import { memo, useEffect, useState } from "react";
import type { Sphere } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMetricNumber, parseOptionalMetricNumber } from "@/lib/sphere-metrics";
import { SphereEditDialog } from "@/components/spheres/sphere-edit-dialog";

export const SphereGoalEditor = memo(function SphereGoalEditor({ sphere }: { sphere: Sphere }) {
  const updateSphere = useAppStore((s) => s.updateSphere);

  const [description, setDescription] = useState("");
  const [startRaw, setStartRaw] = useState("");
  const [targetRaw, setTargetRaw] = useState("");
  const [currentRaw, setCurrentRaw] = useState("");
  const [startErr, setStartErr] = useState(false);
  const [targetErr, setTargetErr] = useState(false);
  const [currentErr, setCurrentErr] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDescription(sphere.description ?? "");
    setStartRaw(formatMetricNumber(sphere.startValue));
    setTargetRaw(formatMetricNumber(sphere.targetValue));
    setCurrentRaw(formatMetricNumber(sphere.currentValue));
    setStartErr(false);
    setTargetErr(false);
    setCurrentErr(false);
    setSaved(false);
  }, [
    sphere.id,
    sphere.description,
    sphere.startValue,
    sphere.targetValue,
    sphere.currentValue,
  ]);

  const save = () => {
    const start = parseOptionalMetricNumber(startRaw);
    const target = parseOptionalMetricNumber(targetRaw);
    const current = parseOptionalMetricNumber(currentRaw);
    setStartErr(!start.ok);
    setTargetErr(!target.ok);
    setCurrentErr(!current.ok);
    if (!start.ok || !target.ok || !current.ok) return;

    updateSphere(sphere.id, {
      description: description.trim() || undefined,
      startValue: start.value,
      targetValue: target.value,
      currentValue: current.value,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="space-y-4 rounded-xl border border-white/10 bg-card/25 p-4"
      style={{ borderTopColor: sphere.color, borderTopWidth: 3 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <SphereGlyph icon={sphere.icon} color={sphere.color} size="sm" />
          <p className="truncate font-medium">{sphere.name}</p>
        </div>
        <SphereEditDialog
          sphere={sphere}
          allowDelete
          trigger={
            <Button type="button" size="sm" variant="ghost" className="h-8 shrink-0 text-xs">
              Изм.
            </Button>
          }
        />
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`goal-desc-${sphere.id}`}>Описание</Label>
          <Textarea
            id={`goal-desc-${sphere.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="О чём данная цель"
            rows={3}
            className="mt-1.5 resize-none text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor={`goal-start-${sphere.id}`}>Начальное</Label>
            <Input
              id={`goal-start-${sphere.id}`}
              inputMode="decimal"
              value={startRaw}
              onChange={(e) => {
                setStartRaw(e.target.value);
                setStartErr(false);
              }}
              placeholder="Необязательно"
              className="mt-1.5"
              aria-invalid={startErr}
            />
          </div>
          <div>
            <Label htmlFor={`goal-target-${sphere.id}`}>Целевое</Label>
            <Input
              id={`goal-target-${sphere.id}`}
              inputMode="decimal"
              value={targetRaw}
              onChange={(e) => {
                setTargetRaw(e.target.value);
                setTargetErr(false);
              }}
              placeholder="Необязательно"
              className="mt-1.5"
              aria-invalid={targetErr}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor={`goal-current-${sphere.id}`}>Текущее</Label>
            <Input
              id={`goal-current-${sphere.id}`}
              inputMode="decimal"
              value={currentRaw}
              onChange={(e) => {
                setCurrentRaw(e.target.value);
                setCurrentErr(false);
              }}
              placeholder="Необязательно"
              className="mt-1.5"
              aria-invalid={currentErr}
            />
          </div>
        </div>
        <Button type="button" className="w-full" onClick={save}>
          {saved ? "Сохранено" : "Сохранить"}
        </Button>
      </div>
    </div>
  );
});
