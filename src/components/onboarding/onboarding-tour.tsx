"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "12 недель — ваш год",
    text: "Выберите неделю на ленте и отмечайте мини-задачи. За каждую — XP.",
  },
  {
    title: "Два типа целей",
    text: "Счётчики (рилсы, книги) и метрики (вес, накопления) с графиками.",
  },
  {
    title: "Сегодня",
    text: "Вкладка «Сегодня» собирает всё, что актуально прямо сейчас.",
  },
  {
    title: "Уровни и ачивки",
    text: "Закрывайте недели, держите streak и смотрите прогресс в профиле.",
  },
];

export function OnboardingTour() {
  const tourComplete = useAppStore((s) => s.tourComplete);
  const setTourComplete = useAppStore((s) => s.setTourComplete);
  const [step, setStep] = useState(0);

  if (tourComplete) return null;

  const current = STEPS[step];

  return (
    <div className="no-print fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm md:items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="glass-card w-full max-w-md p-6"
        >
          <p className="text-xs text-primary font-medium">
            Шаг {step + 1} / {STEPS.length}
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold">{current.title}</h2>
          <p className="mt-2 text-muted-foreground">{current.text}</p>
          <div className="mt-6 flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setTourComplete()}
            >
              Пропустить
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (step >= STEPS.length - 1) setTourComplete();
                else setStep((s) => s + 1);
              }}
            >
              {step >= STEPS.length - 1 ? "Поехали" : "Далее"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
