"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { TOUR_STEPS } from "./tour-steps";
import { setTourNav } from "./tour-highlight";

type Hole = { top: number; left: number; width: number; height: number; radius: number };

const PAD = 8;

function waitForEl(selector: string, timeout = 1600): Promise<Element | null> {
  return new Promise((resolve) => {
    const found = document.querySelector(selector);
    if (found) {
      resolve(found);
      return;
    }
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      obs.disconnect();
      resolve(document.querySelector(selector));
    }, timeout);
  });
}

function measure(el: Element): Hole {
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  const radius = Number.parseFloat(style.borderRadius) || 16;
  return {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
    radius: Math.min(radius + 4, 20),
  };
}

export function OnboardingTour() {
  const tourComplete = useAppStore((s) => s.tourComplete);
  const setTourComplete = useAppStore((s) => s.setTourComplete);
  const [step, setStep] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);
  const [tooltip, setTooltip] = useState({ top: 24, left: 16, width: 320 });
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const sync = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const current = TOUR_STEPS[step];
  const isLast = step >= TOUR_STEPS.length - 1;

  const finish = useCallback(() => {
    setTourNav(null);
    setTourComplete();
    router.replace("/");
  }, [router, setTourComplete]);

  const remeasure = useCallback(async () => {
    if (!current) return;
    const el = await waitForEl(current.selector);
    if (!el) {
      setHole(null);
      return;
    }
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    await new Promise((r) => window.setTimeout(r, 180));
    setHole(measure(el));
  }, [current]);

  useEffect(() => {
    if (tourComplete || !current) {
      setTourNav(null);
      return;
    }
    setTourNav(current.nav);
    if (pathname !== current.route) {
      setHole(null);
      router.replace(current.route);
      return;
    }
    void remeasure();
  }, [tourComplete, current, pathname, router, remeasure]);

  useEffect(() => {
    if (tourComplete) return;
    const onWin = () => {
      void remeasure();
    };
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [tourComplete, remeasure]);

  useLayoutEffect(() => {
    const card = tooltipRef.current;
    if (!card) return;
    const tw = Math.min(340, window.innerWidth - 32);
    const th = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bottomSafe = 88;
    const clampLeft = (x: number) => Math.max(16, Math.min(x, vw - tw - 16));

    const overlapsHole = (top: number, left: number) => {
      if (!hole) return false;
      const right = left + tw;
      const bottom = top + th;
      return !(
        right < hole.left ||
        left > hole.left + hole.width ||
        bottom < hole.top ||
        top > hole.top + hole.height
      );
    };

    const inView = (top: number) => top >= 16 && top + th <= vh - bottomSafe + 8;

    const candidates: { top: number; left: number }[] = [];
    if (hole) {
      const cx = hole.left + hole.width / 2 - tw / 2;
      candidates.push({ top: hole.top + hole.height + 14, left: cx });
      candidates.push({ top: hole.top - th - 14, left: cx });
    }
    candidates.push({ top: vh - th - bottomSafe, left: (vw - tw) / 2 });
    candidates.push({ top: 16, left: (vw - tw) / 2 });

    const placed =
      candidates.find((c) => inView(c.top) && !overlapsHole(c.top, clampLeft(c.left))) ??
      candidates[candidates.length - 1];

    setTooltip({
      top: Math.max(16, Math.min(placed.top, vh - th - bottomSafe)),
      left: clampLeft(placed.left),
      width: tw,
    });
  }, [hole, step, current?.text]);

  useEffect(() => {
    if (tourComplete) {
      setStep(0);
      setHole(null);
      setTourNav(null);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [tourComplete]);

  if (!mounted || tourComplete || !current) return null;

  return createPortal(
    <div className="no-print fixed inset-0 z-[80]">
      <svg
        className="pointer-events-none absolute inset-0"
        width={viewport.w}
        height={viewport.h}
        viewBox={`0 0 ${viewport.w} ${viewport.h}`}
        aria-hidden
      >
        <defs>
          <mask id="tour-spotlight-mask" maskUnits="userSpaceOnUse">
            <rect width={viewport.w} height={viewport.h} fill="white" />
            {hole && (
              <rect
                x={hole.left}
                y={hole.top}
                width={Math.max(0, hole.width)}
                height={Math.max(0, hole.height)}
                rx={hole.radius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width={viewport.w}
          height={viewport.h}
          fill="rgba(2, 6, 12, 0.78)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {hole && (
        <div
          className="pointer-events-none absolute border-2 border-primary shadow-[0_0_28px_rgba(52,211,153,0.45)] transition-[top,left,width,height] duration-300 ease-out"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            borderRadius: hole.radius,
          }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          ref={tooltipRef}
          role="dialog"
          aria-labelledby="tour-title"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          className="glass-card absolute z-10 p-4 shadow-2xl"
          style={{
            top: tooltip.top,
            left: tooltip.left,
            width: tooltip.width,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-5 bg-primary" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {step + 1} / {TOUR_STEPS.length}
            </p>
          </div>
          <h2 id="tour-title" className="font-display mt-3 text-xl font-bold">
            {current.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {current.text}
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={finish}>
              Пропустить
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (isLast) finish();
                else setStep((s) => s + 1);
              }}
            >
              {isLast ? "Играть" : "Далее"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
