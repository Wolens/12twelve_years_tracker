"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/gamification";
import { CYCLE_DAYS, todayIndex } from "@/lib/rpg/day-route";
import { ritualClaimedToday } from "@/lib/daily-engagement";
import { buildTower, heroStandDay, passageBuilt, stateLine, type TowerDay } from "@/lib/rpg/tower";
import { FLAME_CRITICAL } from "@/lib/rpg/season-flame";
import { CharacterFlat } from "./character-flat";
import { FloorChestDialog } from "./floor-chest-dialog";
import { TowerFloorChest } from "./tower-floor-chest";
import { TowerBackdrop, TowerProgressRail } from "./tower-backdrop";
import { TowerSvgDefs } from "./tower-svg-defs";
import { TowerBarrier, TowerFloorView, TowerFoundation, TowerSpire } from "./tower-floor";
import { SoundVolumeSlider } from "@/components/settings/sound-volume-slider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { XpLedgerEntry } from "@/types";

const EMPTY_LEDGER: XpLedgerEntry[] = [];
const EMPTY_CHESTS: number[] = [];
const PAD = 8;
const SPIRE_H = 248;
const FLOOR_H = 112;
const BARRIER_H = 78;
const OVERLAP = 1;
const FOUNDATION_H = 188;
const OVERSCAN = 720;

type MiddleSlot =
  | { kind: "floor"; day: number; top: number; h: number }
  | { kind: "barrier"; week: number; top: number; h: number };

function buildLayout() {
  const slots: MiddleSlot[] = [];
  const floorTopByDay = new Map<number, number>();
  let y = SPIRE_H;
  for (let day = CYCLE_DAYS; day >= 1; day--) {
    y -= OVERLAP;
    slots.push({ kind: "floor", day, top: y, h: FLOOR_H });
    floorTopByDay.set(day, y + PAD);
    y += FLOOR_H;
    if (day % 7 === 1) {
      const week = Math.ceil(day / 7);
      if (week > 1) {
        y -= OVERLAP;
        slots.push({ kind: "barrier", week, top: y, h: BARRIER_H });
        y += BARRIER_H;
      }
    }
  }
  y -= OVERLAP;
  return { slots, foundationTop: y, floorTopByDay };
}

const LAYOUT = buildLayout();

function floorTop(day: number) {
  return LAYOUT.floorTopByDay.get(day) ?? 0;
}

function windowAround(todayDay: number | null) {
  const last = LAYOUT.slots.length - 1;
  const fallback = { first: 0, last: Math.min(last, 12) };
  if (todayDay == null || typeof window === "undefined") return fallback;
  const idx = LAYOUT.slots.findIndex((slot) => slot.kind === "floor" && slot.day === todayDay);
  if (idx < 0) return fallback;
  const slot = LAYOUT.slots[idx];
  const floorBottom = slot.top + slot.h;
  const viewTop = floorBottom - window.innerHeight * 0.72 - OVERSCAN;
  const viewBottom = viewTop + window.innerHeight + OVERSCAN * 2;
  let first = idx;
  let lastIdx = idx;
  for (let i = 0; i < LAYOUT.slots.length; i++) {
    const item = LAYOUT.slots[i];
    if (item.top + item.h >= viewTop && item.top <= viewBottom) {
      if (i < first) first = i;
      if (i > lastIdx) lastIdx = i;
    }
  }
  return { first, last: lastIdx };
}

function measureWindow(column: HTMLElement) {
  if (column.getClientRects().length === 0) return null;
  const pad = Number.parseFloat(getComputedStyle(column).paddingTop) || PAD;
  const contentTop = column.getBoundingClientRect().top + pad;
  const viewTop = -OVERSCAN - contentTop;
  const viewBottom = window.innerHeight + OVERSCAN - contentTop;
  let first = -1;
  let last = -1;
  const slots = LAYOUT.slots;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.top + slot.h >= viewTop && slot.top <= viewBottom) {
      if (first < 0) first = i;
      last = i;
    }
  }
  if (first < 0) return null;
  return { first, last };
}

const VIEW_HEAD = 112;
const VIEW_FOOT = 168;

function scrollTowerToDay(column: HTMLElement, day: number) {
  const slot = LAYOUT.slots.find((item) => item.kind === "floor" && item.day === day);
  if (!slot) return;
  const pad = Number.parseFloat(getComputedStyle(column).paddingTop) || PAD;
  const columnDocTop = column.getBoundingClientRect().top + window.scrollY;
  const floorBottom = columnDocTop + pad + slot.top + slot.h;
  window.scrollTo(0, Math.max(0, floorBottom - window.innerHeight * 0.72));
}

function heroScrollHint(column: HTMLElement, day: number): "up" | "down" | null {
  const slot = LAYOUT.slots.find((item) => item.kind === "floor" && item.day === day);
  if (!slot) return null;
  const pad = Number.parseFloat(getComputedStyle(column).paddingTop) || PAD;
  const columnTop = column.getBoundingClientRect().top + pad;
  const floorTopPx = columnTop + slot.top;
  const floorBottomPx = floorTopPx + slot.h;
  if (floorBottomPx < VIEW_HEAD) return "up";
  if (floorTopPx > window.innerHeight - VIEW_FOOT) return "down";
  return null;
}

function TowerAtmosphere({ progress }: { progress: number }) {
  const [lift, setLift] = useState(0);
  const [near, setNear] = useState(0);
  const [spire, setSpire] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSpire(document.getElementById("tower-spire"));
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastLift = -1;
    let lastNear = -1;
    const tick = () => {
      const node = document.getElementById("tower-spire");
      if (!node || node.getClientRects().length === 0) return;
      const top = node.getBoundingClientRect().top;
      const visible = 1 - Math.min(1, Math.max(0, top / (window.innerHeight * 0.85)));
      const qNear = Math.round(visible * 24) / 24;
      const qLift = Math.round(Math.min(120, window.scrollY * 0.06));
      if (qNear === lastNear && qLift === lastLift) return;
      lastNear = qNear;
      lastLift = qLift;
      setNear(qNear);
      setLift(qLift);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const mist = Math.max(0.08, (1 - progress * 0.85) * (1 - near * 0.92));

  return (
    <>
      <TowerBackdrop mist={mist} scrollLift={lift} />
      <TowerProgressRail progress={progress} />
      {spire &&
        createPortal(
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c1016]/90 via-[#0c1016]/50 to-transparent"
            style={{ opacity: mist }}
          />,
          spire
        )}
    </>
  );
}

export function TowerBoard() {
  const pathname = usePathname();
  const pathActive = pathname === "/path";
  const start = useAppStore((s) => s.cycleStartDate);
  const ledger = useAppStore((s) => s.profile.xpLedger ?? EMPTY_LEDGER);
  const profile = useAppStore((s) => s.profile);
  const weeks = useAppStore((s) => s.weeks);
  const assignments = useAppStore((s) => s.dayAssignments);
  const tasks = useAppStore((s) => s.cycleTasks);
  const vitality = useAppStore((s) => s.seasonFlame?.value ?? 100);
  const heroLoadoutKey = useAppStore((s) => {
    const e = s.character.equipped ?? {};
    return [e.head, e.torso, e.legs, e.weapon, e.charm, s.character.race, s.character.gender]
      .filter(Boolean)
      .join("|");
  });
  const claimDailyRitual = useAppStore((s) => s.claimDailyRitual);
  const today = todayISO();
  const index = todayIndex(start);
  const here = index >= 0 && index < CYCLE_DAYS ? index : null;
  const opened = ritualClaimedToday(profile);
  const [picked, setPicked] = useState<number | null>(null);
  const [canMove, setCanMove] = useState(false);
  const [heroDay, setHeroDay] = useState<number | null>(null);
  const [climbing, setClimbing] = useState(false);
  const [chestFloor, setChestFloor] = useState<number | null>(null);
  const [chestOpen, setChestOpen] = useState(false);
  const promptedOpen = useRef(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const [scrollHint, setScrollHint] = useState<"up" | "down" | null>(null);
  const activeWeek = useAppStore((s) => s.activeWeek);
  const activeDay = useAppStore((s) => s.activeDay);
  const claimedFloorChests = useAppStore((s) => s.character.claimedFloorChests ?? EMPTY_CHESTS);
  const todayDay = here === null ? null : here + 1;
  const [range, setRange] = useState(() => windowAround(todayDay));
  const rangeRef = useRef(range);
  rangeRef.current = range;

  const closed = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        weeks.some((w) => w.number === i + 1 && w.bonusAwarded)
      ),
    [weeks]
  );

  const standDay = heroStandDay(todayDay, activeWeek, activeDay);

  const tower = useMemo(
    () => buildTower({ start, today, currentDay: standDay, ledger, closed, assignments, tasks }),
    [start, today, standDay, ledger, closed, assignments, tasks]
  );

  const progress = here === null ? 0 : here / (CYCLE_DAYS - 1);
  const slumped = vitality < 85 && !opened;
  const weather = !opened && vitality < 96;
  const dayNumber = index < 0 ? 0 : Math.min(CYCLE_DAYS, index + 1);

  useEffect(() => {
    if (standDay === null || climbing) return;
    setHeroDay(standDay);
  }, [standDay, climbing]);

  useEffect(() => {
    if (standDay === null || opened || promptedOpen.current) return;
    promptedOpen.current = true;
    setPicked(standDay);
  }, [standDay, opened]);

  const scrollToStandDay = useCallback(() => {
    if (standDay === null) return;
    const column = columnRef.current;
    if (!column) return;
    scrollTowerToDay(column, standDay);
    const next = measureWindow(column);
    if (next) {
      rangeRef.current = next;
      setRange(next);
    }
    const hint = heroScrollHint(column, standDay);
    setScrollHint(hint);
  }, [standDay]);

  useLayoutEffect(() => {
    if (!pathActive || standDay === null) return;
    const column = columnRef.current;
    if (!column) return;
    scrollToStandDay();
    const id = requestAnimationFrame(() => scrollToStandDay());
    return () => cancelAnimationFrame(id);
  }, [pathActive, standDay, scrollToStandDay]);

  useEffect(() => {
    if (!pathActive || standDay === null) return;
    const column = columnRef.current;
    if (!column) return;
    const id = requestAnimationFrame(() => setCanMove(true));
    return () => cancelAnimationFrame(id);
  }, [pathActive, standDay]);

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    let raf = 0;
    const apply = () => {
      const next = measureWindow(column);
      if (next) {
        const cur = rangeRef.current;
        if (cur.first !== next.first || cur.last !== next.last) {
          rangeRef.current = next;
          setRange(next);
        }
      }
      if (pathActive && standDay !== null) {
        setScrollHint(heroScrollHint(column, standDay));
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    apply();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathActive, standDay]);

  useEffect(() => {
    if (picked === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked]);

  const pickDay = useCallback((day: number) => {
    setPicked((cur) => (cur === day ? null : day));
  }, []);
  const openChest = useCallback((day: number) => {
    setChestFloor(day);
    setChestOpen(true);
  }, []);

  const focus = picked === null ? null : tower.days[picked - 1];
  const canOpen = standDay !== null && focus?.day === standDay && !opened;

  const openFocused = () => {
    if (!focus || standDay === null || focus.day !== standDay) return;
    if (ritualClaimedToday(useAppStore.getState().profile)) return;
    const from = Math.max(1, standDay - 1);
    setPicked(null);
    setClimbing(true);
    setHeroDay(from);
    const amount = claimDailyRitual();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHeroDay(standDay));
    });
    window.setTimeout(() => {
      setClimbing(false);
      setHeroDay(standDay);
      if (amount > 0) toast({ title: `+${amount} XP · этаж открыт` });
    }, 420);
  };

  const heroTop = (heroDay ?? standDay) === null ? 0 : floorTop((heroDay ?? standDay)!) + 80;
  const visible = LAYOUT.slots.slice(range.first, range.last + 1);
  const firstSlot = visible[0];
  const lastSlot = visible[visible.length - 1];
  const topGap = firstSlot ? Math.max(0, firstSlot.top - (SPIRE_H - OVERLAP)) : 0;
  const bottomGap = lastSlot
    ? Math.max(0, LAYOUT.foundationTop - (lastSlot.top + lastSlot.h) + OVERLAP)
    : 0;

  return (
    <section className="path-world relative min-h-[100dvh] bg-[#06080c]" aria-label="Башня из 84 этажей">
      <TowerSvgDefs />
      <TowerAtmosphere progress={progress} />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-[max(0.25rem,env(safe-area-inset-top))] md:pt-3">
        <div className="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-2 pr-12 md:max-w-4xl">
          <h1 className="font-display text-xl font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
            Башня
          </h1>
          <div className="flex min-w-0 shrink items-center gap-2">
            <SoundVolumeSlider compact />
            <p className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-2.5 py-1 text-xs text-muted-foreground">
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <path d="M8 2.2 V8 L11 9.6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M8 1.2 V2.6 M8 13.4 V14.8 M1.2 8 H2.6 M13.4 8 H14.8" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="tabular-nums">
                {dayNumber} / {CYCLE_DAYS}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div ref={columnRef} className="relative z-[1] mx-auto max-w-lg pb-16 pt-2">
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-[min(100%,21rem)] -translate-x-1/2 rounded-sm"
          style={{
            boxShadow:
              "inset 8px 0 24px rgba(0,0,0,0.35), inset -8px 0 24px rgba(0,0,0,0.35), 0 0 60px rgba(246,177,74,0.06)",
          }}
        />

        <div id="tower-spire" className="relative z-[1]">
          <TowerSpire />
        </div>

        {topGap > 0 && <div aria-hidden style={{ height: topGap }} />}

        {visible.map((slot) => {
          if (slot.kind === "barrier") {
            return (
              <TowerBarrier
                key={`barrier-${slot.week}`}
                week={slot.week}
                built={passageBuilt(slot.week, closed)}
              />
            );
          }
          const day = tower.days[slot.day - 1];
          if (!day) return null;
          const built = passageBuilt(day.week, closed);
          return (
            <FloorButton
              key={day.day}
              day={day}
              todayDay={todayDay}
              passageLocked={!built && day.state === "future"}
              pressed={picked === day.day}
              chestClaimed={claimedFloorChests.includes(day.day)}
              onPick={pickDay}
              onOpenChest={openChest}
            />
          );
        })}

        {bottomGap > 0 && <div aria-hidden style={{ height: bottomGap }} />}
        <TowerFoundation />

        {here !== null && (
          <div
            className={cn(
              "pointer-events-none absolute z-20 w-[3.5rem] origin-bottom overflow-visible max-sm:left-[31%] sm:left-[40%]",
              !climbing && "hero-bob",
              (canMove || climbing) && "tower-step"
            )}
            style={{
              top: heroTop,
              height: "4.75rem",
              translate: "0 -100%",
              rotate: slumped ? "7deg" : undefined,
            }}
          >
            <div
              className="absolute -bottom-0.5 left-1/2 h-6 w-10 -translate-x-1/2 rounded-full blur-md"
              style={{
                background: `rgba(246, 177, 74, ${vitality <= 0 ? 0.08 : 0.2 + (vitality / 100) * 0.65})`,
              }}
            />
            <CharacterFlat key={heroLoadoutKey} scene="tower" />
          </div>
        )}
      </div>

      {weather && (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 top-12 bottom-16 z-20",
            "path-mist",
            vitality < FLAME_CRITICAL && "path-rain"
          )}
          aria-hidden
        />
      )}

      {pathActive && standDay !== null && scrollHint && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-50 flex justify-center px-3">
          <button
            type="button"
            aria-label="К моему этажу"
            onClick={scrollToStandDay}
            className={cn(
              "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full",
              "border border-white/15 bg-[#161a17]/95 text-white shadow-lg backdrop-blur-sm",
              "transition hover:border-amber-400/40 hover:bg-[#1c211c]"
            )}
          >
            {scrollHint === "up" ? (
              <ChevronUp className="h-6 w-6" aria-hidden />
            ) : (
              <ChevronDown className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      )}

      {focus && (
        <div className="fixed inset-x-0 bottom-[4.6rem] z-50 mx-auto w-full max-w-lg px-3">
          <div className="rounded-2xl border border-white/10 bg-[#161a17] p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/90">
                  {new Date(`${focus.date}T12:00:00`).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="mt-1 font-display text-lg font-semibold">
                  Этаж {focus.day} · день {focus.day}
                </p>
                <p className="text-xs text-stone-300">Неделя {focus.week}</p>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setPicked(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm text-white/80">{stateLine(focus.state, focus.lit)}</p>
            <p className="mt-1 text-sm text-white/70">
              {focus.tasksTotal === 0
                ? "Задач на этаж нет"
                : `Задачи ${focus.tasksDone} из ${focus.tasksTotal}`}
            </p>
            {typeof focus.healthDelta === "number" && (
              <p className={cn("mt-1 text-sm", focus.healthDelta < 0 ? "text-sky-200" : "text-amber-200")}>
                Здоровье {focus.healthDelta > 0 ? `+${focus.healthDelta}` : focus.healthDelta}
              </p>
            )}
            {focus.state === "missed" && (
              <p className="mt-3 text-sm text-sky-200/90">
                В тот день не заходил — этаж в башне не открыть. Задачи можно отметить в «Сегодня», если
                делал их без захода.
              </p>
            )}
            {canOpen && (
              <Button className="mt-3 h-11 w-full" onClick={openFocused}>
                Открыть этаж
              </Button>
            )}
          </div>
        </div>
      )}

      <FloorChestDialog
        floorDay={chestFloor}
        reachDay={todayDay ?? 0}
        open={chestOpen}
        onOpenChange={(open) => {
          setChestOpen(open);
          if (!open) setChestFloor(null);
        }}
      />
    </section>
  );
}

const FloorButton = memo(function FloorButton({
  day,
  todayDay,
  passageLocked,
  pressed,
  chestClaimed,
  onPick,
  onOpenChest,
}: {
  day: TowerDay;
  todayDay: number | null;
  passageLocked: boolean;
  pressed: boolean;
  chestClaimed: boolean;
  onPick: (day: number) => void;
  onOpenChest: (day: number) => void;
}) {
  return (
    <div className="relative">
      <button
        id={`tower-day-${day.day}`}
        type="button"
        aria-pressed={pressed}
        aria-label={`Этаж ${day.day}, неделя ${day.week}, ${stateLine(day.state, day.lit)}`}
        onClick={() => onPick(day.day)}
        className="block w-full cursor-pointer"
      >
        <TowerFloorView day={day} todayDay={todayDay} passageLocked={passageLocked} />
      </button>
      <TowerFloorChest
        floorDay={day.day}
        todayDay={todayDay}
        floorState={day.state}
        claimed={chestClaimed}
        locked={passageLocked}
        onOpen={() => onOpenChest(day.day)}
      />
    </div>
  );
});
