"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [tooltip, setTooltip] = useState({ top: 0, left: 0, width: 320 });
  const [tipReady, setTipReady] = useState(false);
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
    router.replace("/", { scroll: false });
  }, [router, setTourComplete]);

  const goPrev = useCallback(() => {
    setTipReady(false);
    setHole(null);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const goNext = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    setTipReady(false);
    setHole(null);
    setStep((s) => s + 1);
  }, [finish, isLast]);

  const remeasure = useCallback(async () => {
    if (!current) return;
    const el = await waitForEl(current.selector);
    if (!el) {
      setHole(null);
      return;
    }
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHole(measure(el)));
    });
  }, [current]);

  useEffect(() => {
    if (tourComplete || !current) {
      setTourNav(null);
      return;
    }
    setTourNav(current.nav);
    const desired = current.search
      ? `${current.route}?${current.search}`
      : current.route;
    const currentSearch =
      typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
    const wantSearch = current.search ?? "";
    if (pathname !== current.route || currentSearch !== wantSearch) {
      setTipReady(false);
      setHole(null);
      router.replace(desired, { scroll: false });
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
    if (hole) setTipReady(true);
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
          initial={false}
          animate={{ opacity: tipReady ? 1 : 0 }}
          className="glass-card absolute z-10 p-4 shadow-2xl"
          style={{
            top: tooltip.top,
            left: tooltip.left,
            width: tooltip.width,
            visibility: tipReady ? "visible" : "hidden",
            pointerEvents: tipReady ? "auto" : "none",
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
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Предыдущая подсказка"
                disabled={step === 0}
                onClick={goPrev}
                className="rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="min-w-[2.5rem] text-center text-[11px] text-muted-foreground">
                {step + 1} / {TOUR_STEPS.length}
              </p>
              <button
                type="button"
                aria-label="Следующая подсказка"
                onClick={goNext}
                className="rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
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
            <Button className="flex-1" onClick={goNext}>
              {isLast ? "Играть" : "Далее"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
