"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarDays, User, Sun, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeTourNav } from "@/components/onboarding/tour-highlight";
import { setNavPending, subscribeNavPending } from "./nav-pending";
import { preloadTab } from "./tab-pages";

const links = [
  { href: "/today", label: "Сегодня", icon: Sun, tourNav: "today" },
  { href: "/", label: "Недели", labelMd: "12 недель", icon: CalendarDays, tourNav: "weeks" },
  { href: "/hero", label: "Герой", icon: User, tourNav: "hero" },
  { href: "/path", label: "Путь", icon: Route, tourNav: "path" },
  { href: "/stats", label: "Статистика", icon: BarChart3, tourNav: "stats" },
];

const allHrefs = [...links.map((l) => l.href), "/settings", "/profile"];

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
        "no-print fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] dark:border-white/10 dark:shadow-none",
        tourNav && "z-[90] pointer-events-none"
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-0.5 py-2 md:max-w-4xl md:px-1">
        {links.map(({ href, label, labelMd, icon: Icon, tourNav: id }) => {
          const active = pathname === href || pending === href;
          const highlighted = tourNav === id;
          return (
            <Link
              key={href}
              href={href}
              prefetch
              scroll={false}
              onPointerDown={() => preloadTab(href)}
              onClick={() => markPending(href)}
              data-tour={`nav-${id}`}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[9px] font-medium leading-tight transition-colors sm:text-[10px] md:flex-none md:px-2",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                highlighted &&
                  "bg-background text-primary ring-2 ring-primary shadow-[0_0_20px_rgba(52,211,153,0.45)]",
                tourNav && !highlighted && "opacity-35"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", (active || highlighted) && "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]")} />
              <span className="max-w-full truncate whitespace-nowrap">
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
      </div>
    </nav>
  );
}
