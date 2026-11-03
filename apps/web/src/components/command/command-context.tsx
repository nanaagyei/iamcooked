"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CommandContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  openCopilot: () => void;
  copilotContext: { incidentSlug?: string; scanReportId?: string; scanAccessToken?: string };
  setCopilotContext: (ctx: {
    incidentSlug?: string;
    scanReportId?: string;
    scanAccessToken?: string;
  }) => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotContext, setCopilotContext] = useState<{
    incidentSlug?: string;
    scanReportId?: string;
    scanAccessToken?: string;
  }>({});

  const openCopilot = useCallback(() => {
    setOpen(false);
    setCopilotOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      copilotOpen,
      setCopilotOpen,
      openCopilot,
      copilotContext,
      setCopilotContext,
    }),
    [open, copilotOpen, openCopilot, copilotContext],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandContext.Provider value={value}>{children}</CommandContext.Provider>
  );
}

export function useCommand() {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error("useCommand must be used within CommandProvider");
  }
  return ctx;
}
