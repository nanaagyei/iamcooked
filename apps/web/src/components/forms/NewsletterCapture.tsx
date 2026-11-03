"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { Bell, Check, CircleNotch, EnvelopeSimple } from "@phosphor-icons/react";

type Props = {
  variant?: "hero" | "inline" | "card";
  onImage?: boolean;
  onSuccess?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterCapture({ variant = "hero", onImage = false, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValid = EMAIL_REGEX.test(email);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isValid) {
      setErrorMessage("Please enter a valid email address.");
      setState("error");
      return;
    }

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
      setErrorMessage(data?.error?.message ?? "Something went wrong.");
      setState("error");
      toast.error("Subscription failed", data?.error?.message ?? "Something went wrong.");
        return;
      }

      setState("success");
      toast.success("Check your email", "Confirm your subscription from the link we sent.");
      onSuccess?.();
    } catch {
      setErrorMessage("Network error. Please try again.");
      setState("error");
      toast.error("Network error", "Please try again.");
    }
  }

  if (state === "success") {
    if (variant === "card") {
      return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
          <Check className="mx-auto h-8 w-8 text-primary" weight="bold" />
          <p className="mt-3 text-sm font-medium">
            Check your email to confirm your subscription.
          </p>
        </div>
      );
    }

    if (variant === "inline") {
      return (
        <p className="text-sm text-muted-foreground">
          <Check className="inline h-4 w-4 text-primary mr-1" weight="bold" />
          Check your email to confirm your subscription.
        </p>
      );
    }

    return (
      <div className="text-center space-y-2">
        <Check className="mx-auto h-8 w-8 text-primary" weight="bold" />
        <p className="text-sm text-muted-foreground">
          Check your email to confirm your subscription.
        </p>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" weight="bold" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Stay informed</h3>
            <p className="text-xs text-muted-foreground">
              Get critical security alerts to your inbox.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            disabled={state === "submitting"}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={state === "submitting" || !isValid}
          >
            {state === "submitting" && (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            )}
            Subscribe
          </Button>
          {state === "error" && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}
        </form>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            disabled={state === "submitting"}
            className={`h-10 ${onImage ? "border-border bg-muted text-foreground" : ""}`}
          />
          {state === "error" && (
            <p className="text-xs text-destructive mt-1">{errorMessage}</p>
          )}
        </div>
        <Button
          type="submit"
          variant={onImage ? "contrast" : "default"}
          size="sm"
          className="h-10 shrink-0"
          disabled={state === "submitting" || !isValid}
        >
          {state === "submitting" && (
            <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
          )}
          Subscribe
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <EnvelopeSimple className="h-5 w-5 text-muted-foreground" weight="bold" />
          <h2 className="text-2xl font-semibold tracking-tight">
            Stay informed
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Get the latest security vulnerability alerts delivered to your inbox.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          disabled={state === "submitting"}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={state === "submitting" || !isValid}
        >
          {state === "submitting" && (
            <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
          )}
          Subscribe
        </Button>
      </form>
      {state === "error" && (
        <p className="text-xs text-destructive text-center">{errorMessage}</p>
      )}
    </div>
  );
}
