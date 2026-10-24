"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_SPHERES } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Sphere } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const COLORS = ["#34d399", "#a78bfa", "#f472b6", "#fbbf24", "#60a5fa", "#fb7185"];

export default function OnboardingPage() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const router = useRouter();

  const defaults = useMemo(
    () =>
      DEFAULT_SPHERES.map((s) => ({
        ...s,
        id: generateId(),
      })),
    []
  );

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaults.map((s) => s.id))
  );
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("⭐");
  const [customColor, setCustomColor] = useState(COLORS[0]);
  const [customSpheres, setCustomSpheres] = useState<Sphere[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const sphere: Sphere = {
      id: generateId(),
      name: customName.trim(),
      icon: customIcon || "⭐",
      color: customColor,
      custom: true,
    };
    setCustomSpheres((c) => [...c, sphere]);
    setSelected((s) => new Set(s).add(sphere.id));
    setCustomName("");
  };

  const finish = () => {
    const chosen = [
      ...defaults.filter((s) => selected.has(s.id)),
      ...customSpheres.filter((s) => selected.has(s.id)),
    ];
    completeOnboarding(chosen);
    router.replace("/");
  };

  return (
    <div className="min-h-dvh px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg space-y-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold">Ваши сферы жизни</h1>
          <p className="mt-2 text-muted-foreground">
            Выберите области, в которых будете ставить цели на 12 недель.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {defaults.map((s) => {
            const on = selected.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={cn(
                  "glass-card p-4 text-left transition-all",
                  on && "ring-2 ring-offset-2 ring-offset-background"
                )}
                style={on ? { borderColor: s.color, boxShadow: `0 0 0 2px ${s.color}40` } : undefined}
              >
                <span className="text-2xl">{s.icon}</span>
                <p className="mt-2 text-sm font-medium leading-tight">{s.name}</p>
              </button>
            );
          })}
          {customSpheres.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={cn(
                "glass-card p-4 text-left",
                selected.has(s.id) && "ring-2"
              )}
              style={{ borderColor: s.color }}
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-2 text-sm font-medium">{s.name}</p>
            </button>
          ))}
        </div>

        <div className="glass-card space-y-3 p-4">
          <p className="text-sm font-medium">Своя сфера</p>
          <form
            className="grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addCustom();
            }}
          >
            <Label>Название</Label>
            <Input value={customName} onChange={(e) => setCustomName(e.target.value)} />
            <div className="flex gap-2">
              <Input
                className="w-20"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                maxLength={2}
              />
              <div className="flex flex-1 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      "h-10 w-10 rounded-full border-2",
                      customColor === c ? "border-white" : "border-transparent"
                    )}
                    style={{ background: c }}
                    onClick={() => setCustomColor(c)}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" variant="secondary">Добавить сферу</Button>
          </form>
        </div>

        <Button className="w-full" size="lg" onClick={finish} disabled={selected.size === 0}>
          Начать цикл
        </Button>
      </motion.div>
    </div>
  );
}
