"use client";

import { useEffect, useMemo, useState } from "react";
import { hasUserProgress } from "@/lib/app-state-health";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { DEFAULT_SPHERES } from "@/lib/constants";
import { cn, generateId } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Sphere } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { SeasonMap } from "@/components/onboarding/season-map";

const COLORS = ["#34d399", "#a78bfa", "#f472b6", "#fbbf24", "#60a5fa", "#fb7185"];

type Stage = "welcome" | "spheres";

export default function OnboardingPage() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const repairStateFromLedger = useAppStore((s) => s.repairStateFromLedger);
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("welcome");

  useEffect(() => {
    const state = useAppStore.getState();
    if (!hasUserProgress(state)) return;
    repairStateFromLedger();
    router.replace("/");
  }, [repairStateFromLedger, router]);

  const defaults = useMemo(
    () =>
      DEFAULT_SPHERES.map((s) => ({
        ...s,
        id: generateId(),
      })),
    []
  );

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("⭐");
  const [customColor, setCustomColor] = useState(COLORS[0]);
  const [customSpheres, setCustomSpheres] = useState<Sphere[]>([]);
  const [showCustom, setShowCustom] = useState(false);

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
    <div className="relative min-h-dvh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(52,211,153,0.16), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(167,139,250,0.12), transparent 55%)",
        }}
      />

      <AnimatePresence mode="wait">
        {stage === "welcome" ? (
          <motion.section
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10"
          >
            <div className="flex flex-1 flex-col justify-center">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center text-xs font-medium uppercase tracking-[0.28em] text-primary"
              >
                не год — сезон
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="font-display mt-3 text-center text-5xl font-bold tracking-tight md:text-6xl"
              >
                12 недель
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mx-auto mt-4 max-w-sm text-center text-base leading-relaxed text-muted-foreground"
              >
                Сжать год в один сезон. Поставить цели, закрывать недели,
                качать уровень — за то, что сделал, а не за то, что планировал.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <SeasonMap />
              </motion.div>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mx-auto mt-8 flex max-w-sm flex-wrap justify-center gap-2"
              >
                {[
                  ["12 недель", "вместо года"],
                  ["Цели", "на весь сезон"],
                  ["XP", "за действия"],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="rounded-full border border-white/10 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">{k}</span>
                    <span className="mx-1.5 text-white/20">·</span>
                    {v}
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="pt-8 pb-[env(safe-area-inset-bottom)]"
            >
              <Button
                className="h-12 w-full text-base font-semibold"
                size="lg"
                onClick={() => setStage("spheres")}
              >
                <Sparkles className="h-4 w-4" />
                Начать игру
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Без регистрации. Аккаунт можно создать позже, чтобы не потерять прогресс.
              </p>
            </motion.div>
          </motion.section>
        ) : (
          <motion.section
            key="spheres"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-8"
          >
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
                  настройка сезона
                </p>
                <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">
                  Что прокачиваем?
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Отметь направления этого сезона. Потом можно добавить или убрать —
                  ничего не навсегда.
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
                      style={
                        on
                          ? { borderColor: s.color, boxShadow: `0 0 0 2px ${s.color}40` }
                          : undefined
                      }
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
                    className={cn("glass-card p-4 text-left", selected.has(s.id) && "ring-2")}
                    style={{ borderColor: s.color }}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <p className="mt-2 text-sm font-medium">{s.name}</p>
                  </button>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowCustom((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-muted-foreground hover:border-white/30 hover:text-foreground"
                >
                  Своё направление
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", showCustom && "rotate-180")}
                  />
                </button>
                <AnimatePresence>
                  {showCustom && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                      onSubmit={(e) => {
                        e.preventDefault();
                        addCustom();
                      }}
                    >
                      <div className="glass-card mt-3 space-y-3 p-4">
                        <Label>Название</Label>
                        <Input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Например: Семья"
                        />
                        <div className="flex gap-2">
                          <Input
                            className="w-20"
                            value={customIcon}
                            onChange={(e) => setCustomIcon(e.target.value)}
                            maxLength={2}
                            aria-label="Иконка"
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
                                aria-label={c}
                              />
                            ))}
                          </div>
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">
                          Добавить
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="sticky bottom-0 mt-6 space-y-2 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <Button
                className="h-12 w-full text-base font-semibold"
                size="lg"
                onClick={finish}
                disabled={selected.size === 0}
              >
                Начать игру
              </Button>
              <button
                type="button"
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setStage("welcome")}
              >
                Назад
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
