"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";

const STORAGE_KEY = "iamcooked-onboarding-complete";

const steps = [
  {
    title: "Security briefs for builders",
    body: "iamcooked monitors npm supply-chain incidents and maps them to the packages in your lockfile.",
  },
  {
    title: "Upload your lockfile",
    body: "Drop package-lock.json, pnpm-lock.yaml, or yarn.lock. We match versions against OSV, CISA KEV, and curated incidents.",
  },
  {
    title: "Stay ahead of new risks",
    body: "Save scans, manage a watchlist, and set digest alerts so you hear about threats that affect your stack.",
  },
];

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const current = steps[step] ?? steps[0]!;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="tracking-tight">{current.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">{current.body}</p>
        <div className="mt-2 flex gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
              aria-hidden
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between gap-2">
          <Button variant="ghost" onClick={finish}>
            Skip
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <MagneticButton asChild>
              <Link href="/scan" onClick={finish}>
                Scan my project
              </Link>
            </MagneticButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function resetOnboarding() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
