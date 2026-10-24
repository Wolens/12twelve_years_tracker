"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BarChart3, Target, User, Sun, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "12 недель", icon: CalendarDays },
  { href: "/today", label: "Сегодня", icon: Sun },
  { href: "/goals", label: "Цели", icon: Target },
  { href: "/stats", label: "Стат", icon: BarChart3 },
  { href: "/profile", label: "Профиль", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/onboarding") return null;

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2 md:max-w-4xl">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]")} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground",
            pathname === "/settings" && "text-primary"
          )}
        >
          <Settings className="h-5 w-5" />
          Ещё
        </Link>
      </div>
    </nav>
  );
}
