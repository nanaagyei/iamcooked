"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GithubLogo, List, MagnifyingGlass, SignOut, Upload, SquaresFour } from "@phosphor-icons/react";
import { signOutAction } from "@/components/auth/sign-out";
import { useCommand } from "@/components/command/command-context";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

const navLinks = [
  { href: "/tools", label: "Tool Watch" },
  { href: "/mcp", label: "MCP check" },
  { href: "/scan", label: "Scan" },
  { href: "/incidents", label: "Incidents" },
  { href: "/learn", label: "Learn" },
];

export const GITHUB_URL = "https://github.com/nanaagyei/iamcooked";

interface NavbarProps {
  session: Session | null;
  variant?: "marketing" | "app";
}

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2 font-semibold tracking-tight", className)} aria-label="iamcooked home">
      <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-primary text-[13px] font-bold text-primary-foreground">
        <span className="transition-transform duration-300 group-hover:-translate-y-6">ic</span>
        <span className="absolute translate-y-6 transition-transform duration-300 group-hover:translate-y-0" aria-hidden>
          🔥
        </span>
      </span>
      <span>iamcooked</span>
    </Link>
  );
}

export function Navbar({ session, variant = "marketing" }: NavbarProps) {
  const pathname = usePathname();
  const isAuthenticated = !!session?.user;
  const { setOpen } = useCommand();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 400 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  const active = navLinks.find((l) => isNavActive(pathname, l.href))?.href ?? null;
  const indicator = hovered ?? active;

  return (
    <motion.header
      animate={{ y: hidden ? -96 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
      className="sticky top-0 z-50 px-3 pt-3 sm:px-4"
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 transition-[background-color,border-color,box-shadow,max-width] duration-500 sm:px-4",
          scrolled
            ? "max-w-5xl border-border/80 bg-background/70 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.5)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
            : "border-transparent bg-transparent",
        )}
      >
        <Logo className="text-base" />

        <div className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
          {navLinks.map((link) => {
            const isActive = active === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative isolate rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive || hovered === link.href ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {indicator === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-muted"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" aria-hidden />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 text-muted-foreground lg:flex"
            onClick={() => setOpen(true)}
            type="button"
            aria-label="Search (Command K)"
          >
            <MagnifyingGlass className="h-4 w-4" weight="bold" aria-hidden />
            <kbd className="pointer-events-none rounded border border-border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="iamcooked on GitHub">
              <GithubLogo className="h-4 w-4" weight="bold" />
            </a>
          </Button>
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {variant === "marketing" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <SquaresFour className="h-4 w-4" weight="bold" aria-hidden />
                    Dashboard
                  </Link>
                </Button>
              )}
              <form action={signOutAction}>
                <Button variant="ghost" size="icon" type="submit" className="h-9 w-9" aria-label="Sign out" title="Sign out">
                  <SignOut className="h-4 w-4" weight="bold" aria-hidden />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button size="sm" className="relative overflow-hidden" asChild>
                <Link href="/scan">
                  <Upload className="h-4 w-4" weight="bold" aria-hidden />
                  Am I cooked?
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Open menu">
                <List className="h-5 w-5" weight="bold" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,22rem)]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <AnimatePresence>
                <motion.ul
                  className="mt-8 flex flex-col gap-1"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
                >
                  {[...navLinks, ...(isAuthenticated ? [{ href: "/dashboard", label: "Dashboard" }, { href: "/settings", label: "Settings" }] : [])].map(
                    (link) => (
                      <motion.li
                        key={link.href}
                        variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-3 text-lg font-medium tracking-tight transition-colors",
                            isNavActive(pathname, link.href) ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {link.label}
                          {isNavActive(pathname, link.href) && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </Link>
                      </motion.li>
                    ),
                  )}
                </motion.ul>
              </AnimatePresence>
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                {isAuthenticated ? (
                  <form action={signOutAction}>
                    <Button variant="outline" type="submit" className="w-full">
                      <SignOut className="h-4 w-4" weight="bold" aria-hidden />
                      Sign out
                    </Button>
                  </form>
                ) : (
                  <>
                    <Button asChild>
                      <Link href="/scan">
                        <Upload className="h-4 w-4" weight="bold" aria-hidden />
                        Am I cooked?
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/signin">Sign in</Link>
                    </Button>
                  </>
                )}
                <Button variant="ghost" asChild>
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    <GithubLogo className="h-4 w-4" weight="bold" aria-hidden />
                    Star on GitHub
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
