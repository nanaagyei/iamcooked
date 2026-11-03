"use client";

import { useEffect } from "react";
import { useCommand } from "@/components/command/command-context";
import { AskCopilotButton } from "./AskCopilotButton";

export function IncidentCopilotBridge({ slug }: { slug: string }) {
  const { setCopilotContext } = useCommand();

  useEffect(() => {
    setCopilotContext({ incidentSlug: slug });
    return () => setCopilotContext({});
  }, [slug, setCopilotContext]);

  return <AskCopilotButton label="Ask copilot about this incident" />;
}
