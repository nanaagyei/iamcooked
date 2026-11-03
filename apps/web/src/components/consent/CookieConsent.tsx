"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OPEN_CONSENT_EVENT, readConsent, writeConsent } from "@/lib/consent";

const CATEGORIES = [
  {
    id: "necessary" as const,
    title: "Strictly necessary",
    body: "Sign-in session, CSRF protection and remembering this choice. Always on.",
    locked: true,
  },
  {
    id: "preferences" as const,
    title: "Preferences",
    body: "Remember your theme and unsaved scan links on this device.",
    locked: false,
  },
  {
    id: "analytics" as const,
    title: "Analytics",
    body: "Privacy-friendly usage stats to see which features help. We don't run any today; this stays off unless you opt in.",
    locked: false,
  },
];

function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "border-primary/40 bg-primary" : "border-border bg-muted",
      )}
    >
      <span className={cn("inline-block h-4 w-4 rounded-full bg-background shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ preferences: true, analytics: false });

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
    setPrefs({ preferences: existing.preferences, analytics: existing.analytics });
  }, []);

  useEffect(() => {
    const reopen = () => {
      const existing = readConsent();
      if (existing) setPrefs({ preferences: existing.preferences, analytics: existing.analytics });
      setCustomize(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const save = (choice: { preferences: boolean; analytics: boolean }) => {
    writeConsent(choice);
    setOpen(false);
    setCustomize(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 z-[70] sm:right-auto sm:w-[26rem]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="relative flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                <Cookie className="h-5 w-5 text-primary" weight="duotone" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p id="cookie-title" className="text-sm font-semibold">
                  {customize ? "Cookie settings" : "Just the cookies we need"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  We use essential cookies to keep you signed in and secure. No ads, no trackers, no selling data.{" "}
                  <Link href="/cookies" className="underline underline-offset-4 hover:text-foreground">
                    Cookie policy
                  </Link>
                </p>
              </div>
              <button
                type="button"
                onClick={() => save(prefs)}
                className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close and keep current choices"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {customize && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="relative mt-4 space-y-3 overflow-hidden"
                >
                  {CATEGORIES.map((c) => (
                    <li key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/60 p-3">
                      <div>
                        <p className="text-xs font-semibold">{c.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{c.body}</p>
                      </div>
                      <Toggle
                        label={c.title}
                        checked={c.locked ? true : prefs[c.id as "preferences" | "analytics"]}
                        disabled={c.locked}
                        onChange={(v) => setPrefs((p) => ({ ...p, [c.id]: v }))}
                      />
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <div className="relative mt-4 flex flex-wrap gap-2">
              {customize ? (
                <>
                  <Button size="sm" className="flex-1" onClick={() => save(prefs)}>
                    Save choices
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => save({ preferences: true, analytics: true })}>
                    Accept all
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" className="flex-1" onClick={() => save({ preferences: true, analytics: true })}>
                    Accept all
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => save({ preferences: false, analytics: false })}>
                    Essential only
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setCustomize(true)}>
                    Customize
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className={className}>
      Cookie settings
    </button>
  );
}
