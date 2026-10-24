"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, BarChart3, Target, User, Sun, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeTourNav } from "@/components/onboarding/tour-highlight";
import { setNavPending, subscribeNavPending } from "./nav-pending";

const links = [
  { href: "/", label: "Недели", labelMd: "12 недель", icon: CalendarDays, tourNav: "weeks" },
  { href: "/today", label: "Сегодня", icon: Sun, tourNav: "today" },
  { href: "/goals", label: "Цели", icon: Target, tourNav: "goals" },
  { href: "/stats", label: "Стат", icon: BarChart3, tourNav: "stats" },
  { href: "/profile", label: "Профиль", icon: User, tourNav: "profile" },
];

const allHrefs = [...links.map((l) => l.href), "/settings"];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [tourNav, setTourNav] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => subscribeTourNav(setTourNav), []);
  useEffect(() => subscribeNavPending(setPending), []);
  useEffect(() => {
    setNavPending(null);
  }, [pathname]);
  useEffect(() => {
    allHrefs.forEach((href) => router.prefetch(href));
  }, [router]);

  const markPending = (href: string) => {
    if (href !== pathname) setNavPending(href);
  };

  if (pathname === "/onboarding") return null;

  return (
    <nav
      className={cn(
        "no-print fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]",
        tourNav && "z-[90] pointer-events-none"
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2 md:max-w-4xl md:px-2">
        {links.map(({ href, label, labelMd, icon: Icon, tourNav: id }) => {
          const active = pathname === href || pending === href;
          const highlighted = tourNav === id;
          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={() => markPending(href)}
              data-tour={`nav-${id}`}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors md:flex-none md:px-3",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                highlighted &&
                  "bg-background text-primary ring-2 ring-primary shadow-[0_0_20px_rgba(52,211,153,0.45)]",
                tourNav && !highlighted && "opacity-35"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", (active || highlighted) && "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]")} />
              <span className="whitespace-nowrap">
                {labelMd ? (
                  <>
                    <span className="md:hidden">{label}</span>
                    <span className="hidden md:inline">{labelMd}</span>
                  </>
                ) : (
                  label
                )}
              </span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          prefetch
          onClick={() => markPending("/settings")}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium leading-tight text-muted-foreground hover:text-foreground md:flex-none md:px-3",
            (pathname === "/settings" || pending === "/settings") && "text-primary",
            tourNav && "opacity-35"
          )}
        >
          <Settings className="h-5 w-5" />
          Ещё
        </Link>
      </div>
    </nav>
  );
}
