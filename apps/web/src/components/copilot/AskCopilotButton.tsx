"use client";

import { useCommand } from "@/components/command/command-context";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@phosphor-icons/react";

export function AskCopilotButton({ label = "Ask copilot" }: { label?: string }) {
  const { openCopilot } = useCommand();

  return (
    <Button variant="outline" size="sm" onClick={openCopilot} type="button">
      <Sparkle className="h-4 w-4 text-primary" weight="bold" aria-hidden />
      {label}
    </Button>
  );
}
