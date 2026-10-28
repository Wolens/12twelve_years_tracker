"use client";

import { memo, useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SphereGoalsFilter } from "@/components/spheres/sphere-week-filter";
import { SphereAddDialog } from "@/components/spheres/sphere-add-dialog";
import { SphereGlyph } from "@/components/spheres/sphere-glyph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMetricNumber, parseOptionalMetricNumber } from "@/lib/sphere-metrics";

export const HeroGoalsPanel = memo(function HeroGoalsPanel() {
  const spheres = useAppStore((s) => s.spheres);
  const goalsFilterSphereId = useAppStore((s) => s.goalsFilterSphereId);
  const updateSphere = useAppStore((s) => s.updateSphere);

  const sphere = spheres.find((s) => s.id === goalsFilterSphereId);

  const [description, setDescription] = useState("");
  const [startRaw, setStartRaw] = useState("");
  const [targetRaw, setTargetRaw] = useState("");
  const [currentRaw, setCurrentRaw] = useState("");
  const [startErr, setStartErr] = useState(false);
  const [targetErr, setTargetErr] = useState(false);
  const [currentErr, setCurrentErr] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!sphere) return;
    setDescription(sphere.description ?? "");
    setStartRaw(formatMetricNumber(sphere.startValue));
    setTargetRaw(formatMetricNumber(sphere.targetValue));
    setCurrentRaw(formatMetricNumber(sphere.currentValue));
    setStartErr(false);
    setTargetErr(false);
    setCurrentErr(false);
    setSaved(false);
  }, [
    sphere?.id,
    sphere?.description,
    sphere?.startValue,
    sphere?.targetValue,
    sphere?.currentValue,
  ]);

  const save = () => {
    if (!sphere) return;
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
    <div data-tour="hero-goals" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Цели на 12 недель: описание и числа для анализа. Задачи по неделям — во вкладке «12 недель».
        </p>
        <SphereAddDialog />
      </div>

      <SphereGoalsFilter className="mx-auto" />

      {spheres.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-muted-foreground">
          Добавь первую цель кнопкой «+».
        </p>
      )}

      {sphere && (
        <div
          className="space-y-4 rounded-xl border border-white/10 bg-card/25 p-4"
          style={{ borderTopColor: sphere.color, borderTopWidth: 3 }}
        >
          <div className="flex items-center gap-2">
            <SphereGlyph icon={sphere.icon} color={sphere.color} size="sm" />
            <p className="truncate font-medium">{sphere.name}</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="goal-desc">Описание</Label>
              <Textarea
                id="goal-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="О чём данная цель"
                rows={3}
                className="mt-1.5 resize-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="goal-start">Начальное значение</Label>
                <Input
                  id="goal-start"
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
                {startErr && (
                  <p className="mt-1 text-[10px] text-destructive">Только число</p>
                )}
              </div>
              <div>
                <Label htmlFor="goal-target">Целевое значение</Label>
                <Input
                  id="goal-target"
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
                {targetErr && (
                  <p className="mt-1 text-[10px] text-destructive">Только число</p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="goal-current">Текущее значение</Label>
                <Input
                  id="goal-current"
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
                {currentErr && (
                  <p className="mt-1 text-[10px] text-destructive">Только число</p>
                )}
              </div>
            </div>
            <Button type="button" className="w-full" onClick={save}>
              {saved ? "Сохранено" : "Сохранить"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
