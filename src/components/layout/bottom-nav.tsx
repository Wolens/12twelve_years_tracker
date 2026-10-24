"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BarChart3, Target, User, Sun, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeTourNav } from "@/components/onboarding/tour-highlight";

const links = [
  { href: "/", label: "12 недель", icon: CalendarDays, tourNav: "weeks" },
  { href: "/today", label: "Сегодня", icon: Sun, tourNav: "today" },
  { href: "/goals", label: "Цели", icon: Target, tourNav: "goals" },
  { href: "/stats", label: "Стат", icon: BarChart3, tourNav: "stats" },
  { href: "/profile", label: "Профиль", icon: User, tourNav: "profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [tourNav, setTourNav] = useState<string | null>(null);

  useEffect(() => subscribeTourNav(setTourNav), []);

  if (pathname === "/onboarding") return null;

  return (
    <nav
      className={cn(
        "no-print fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]",
        tourNav && "z-[90] pointer-events-none"
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2 md:max-w-4xl">
        {links.map(({ href, label, icon: Icon, tourNav: id }) => {
          const active = pathname === href;
          const highlighted = tourNav === id;
          return (
            <Link
              key={href}
              href={href}
              data-tour={`nav-${id}`}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                highlighted &&
                  "bg-background text-primary ring-2 ring-primary shadow-[0_0_20px_rgba(52,211,153,0.45)]",
                tourNav && !highlighted && "opacity-35"
              )}
            >
              <Icon className={cn("h-5 w-5", (active || highlighted) && "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]")} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground",
            pathname === "/settings" && "text-primary",
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
