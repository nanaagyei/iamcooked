"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOutAction } from "@/components/auth/sign-out";
import {
  Gauge,
  Robot,
  Stack,
  Package,
  ShieldWarning,
  Gear,
  SignOut,
  List,
  CaretUpDown,
  Flame,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

interface NavItem {
  href: string;
  label: string;
  icon: Icon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Overview", icon: Gauge },
      { href: "/dashboard/agents", label: "Agent Sources", icon: Robot },
      { href: "/dashboard/projects", label: "Projects", icon: Stack },
      { href: "/dashboard/dependencies", label: "Dependencies", icon: Package },
      { href: "/dashboard/vulnerabilities", label: "Vulnerabilities", icon: ShieldWarning },
    ],
  },
  {
    label: "System",
    items: [{ href: "/settings", label: "Settings", icon: Gear }],
  },
];

interface DashboardUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(user: DashboardUser) {
  const source = user.name || user.email || "?";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground/70">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const ItemIcon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <ItemIcon
                      className={cn(
                        "h-[1.05rem] w-[1.05rem] shrink-0",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                      weight={active ? "fill" : "regular"}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function WorkspaceSwitcher() {
  return (
    <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Flame className="h-[1.1rem] w-[1.1rem]" weight="fill" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">iamcooked</p>
        <p className="truncate text-[0.7rem] text-muted-foreground">Personal stack</p>
      </div>
      <CaretUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </div>
  );
}

function UserFooter({ user }: { user: DashboardUser }) {
  return (
    <div className="border-t border-border/60 px-3 py-3">
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
          {initials(user)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name ?? "You"}</p>
          <p className="truncate text-[0.7rem] text-muted-foreground">{user.email}</p>
        </div>
        <ThemeToggle />
        <form action={signOutAction}>
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            className="h-8 w-8"
            aria-label="Sign out"
            title="Sign out"
          >
            <SignOut className="h-4 w-4" weight="bold" aria-hidden />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user }: { user: DashboardUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
        <WorkspaceSwitcher />
        <NavLinks pathname={pathname} />
        <UserFooter user={user} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Flame className="h-4 w-4" weight="fill" aria-hidden />
          </span>
          iamcooked
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Open menu">
                <List className="h-5 w-5" weight="bold" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-3rem,18rem)] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <WorkspaceSwitcher />
                <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                <UserFooter user={user} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
