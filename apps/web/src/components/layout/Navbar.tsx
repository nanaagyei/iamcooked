"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SectionContainer } from "@/components/layout";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { List, User, SignOut, Upload, MagnifyingGlass } from "@phosphor-icons/react";
import { signOutAction } from "@/components/auth/sign-out";
import { useCommand } from "@/components/command/command-context";
import type { Session } from "next-auth";

const navLinks = [
  { href: "/incidents", label: "Incidents" },
  { href: "/scan", label: "Scan" },
  { href: "/learn", label: "Learn" },
];

interface NavbarProps {
  session: Session | null;
  variant?: "marketing" | "app";
}

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ session, variant = "marketing" }: NavbarProps) {
  const pathname = usePathname();
  const isAuthenticated = !!session?.user;
  const { setOpen } = useCommand();

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65">
      <SectionContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground/30"
          >
            iamcooked
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <TextLink
                key={link.href}
                href={link.href}
                variant="nav"
                active={isNavActive(pathname, link.href)}
                className="px-3 py-2"
              >
                {link.label}
              </TextLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 text-muted-foreground lg:flex"
              onClick={() => setOpen(true)}
              type="button"
            >
              <MagnifyingGlass className="h-4 w-4" weight="bold" aria-hidden />
              Search
              <kbd className="pointer-events-none ml-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
                K
              </kbd>
            </Button>
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {variant === "marketing" && (
                  <>
                    <TextLink href="/dashboard" variant="nav" active={isNavActive(pathname, "/dashboard")} className="px-2 py-2">
                      <User className="h-4 w-4" weight="bold" aria-hidden />
                      Dashboard
                    </TextLink>
                    <TextLink href="/settings" variant="nav" active={isNavActive(pathname, "/settings")} className="px-2 py-2">
                      Settings
                    </TextLink>
                  </>
                )}
                <form action={signOutAction}>
                  <Button variant="outline" size="icon" type="submit" className="h-9 w-9" aria-label="Sign out" title="Sign out">
                    <SignOut className="h-4 w-4" weight="bold" aria-hidden />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="contrast" size="sm" asChild>
                  <Link href="/signin">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/scan">
                    <Upload className="h-4 w-4" weight="bold" aria-hidden />
                    Scan project
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Open menu">
                  <List className="h-5 w-5" weight="bold" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <TextLink
                      key={link.href}
                      href={link.href}
                      variant="nav"
                      active={isNavActive(pathname, link.href)}
                      className="rounded-lg px-3 py-2.5"
                    >
                      {link.label}
                    </TextLink>
                  ))}
                  <div className="my-3 h-px bg-border" />
                  {isAuthenticated ? (
                    <>
                      <TextLink href="/dashboard" variant="nav" active={isNavActive(pathname, "/dashboard")} className="rounded-lg px-3 py-2.5">
                        Dashboard
                      </TextLink>
                      <TextLink href="/settings" variant="nav" active={isNavActive(pathname, "/settings")} className="rounded-lg px-3 py-2.5">
                        Settings
                      </TextLink>
                      <form action={signOutAction} className="mt-2">
                        <Button variant="outline" type="submit" className="w-full">
                          <SignOut className="h-4 w-4" weight="bold" aria-hidden />
                          Sign out
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 pt-1">
                      <Button variant="contrast" asChild>
                        <Link href="/signin">Sign in</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/scan">
                          <Upload className="h-4 w-4" weight="bold" aria-hidden />
                          Scan project
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </SectionContainer>
    </nav>
  );
}
