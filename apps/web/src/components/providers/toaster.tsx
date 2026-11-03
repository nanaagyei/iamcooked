"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border bg-card text-card-foreground shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)]",
          title: "font-semibold",
          description: "text-muted-foreground",
        },
      }}
      closeButton
    />
  );
}
