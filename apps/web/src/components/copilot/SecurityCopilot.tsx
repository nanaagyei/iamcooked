"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkle,
  X,
  PaperPlaneRight,
  CircleNotch,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useCommand } from "@/components/command/command-context";
import { MessageResponse } from "@/components/ai-elements/message-response";
import { cn } from "@/lib/utils";

interface SecurityCopilotProps {
  incidentSlug?: string;
  scanReportId?: string;
  scanAccessToken?: string;
}

export function SecurityCopilot(props: SecurityCopilotProps = {}) {
  const { incidentSlug: incidentSlugProp, scanReportId: scanReportIdProp, scanAccessToken: scanAccessTokenProp } = props;
  const { copilotOpen, setCopilotOpen, copilotContext } = useCommand();
  const incidentSlug = incidentSlugProp ?? copilotContext.incidentSlug;
  const scanReportId = scanReportIdProp ?? copilotContext.scanReportId;
  const scanAccessToken = scanAccessTokenProp ?? copilotContext.scanAccessToken;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/copilot/chat",
      body: { incidentSlug, scanReportId, scanAccessToken },
    }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-border bg-popover px-4 py-3 text-sm font-semibold text-foreground shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        whileHover={{ y: -2 }}
        aria-label="Open security copilot"
      >
        <Sparkle className="h-4 w-4 text-primary" weight="bold" aria-hidden />
        Copilot
      </motion.button>

      <AnimatePresence>
        {copilotOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 dark:bg-black/75"
              aria-label="Close security copilot"
              onClick={() => setCopilotOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed bottom-6 right-6 z-50 flex h-[min(560px,80dvh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border-2 border-border bg-popover text-popover-foreground shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.65)] isolate"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-border bg-popover px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkle className="h-4 w-4 text-primary" weight="bold" aria-hidden />
                  <span className="text-sm font-semibold">Security copilot</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCopilotOpen(false)}
                  aria-label="Close copilot"
                >
                  <X className="h-4 w-4" weight="bold" />
                </Button>
              </header>

              <div
                ref={scrollRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-popover p-4"
              >
                {messages.length === 0 && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ask about this incident, your scan results, or what to fix first.
                    I only use source-backed context. I will not invent CVE details.
                  </p>
                )}
                {error && (
                  <p className="text-sm text-destructive">
                    Copilot unavailable. Check that AI keys are configured.
                  </p>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      message.role === "user"
                        ? "ml-8 border border-border bg-muted text-foreground"
                        : "mr-4 border border-border bg-card text-foreground",
                    )}
                  >
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        message.role === "assistant" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : (
                          <span key={i}>{part.text}</span>
                        )
                      ) : null,
                    )}
                  </div>
                ))}
              </div>

              <form
                className="shrink-0 border-t border-border bg-popover p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input.trim() || status !== "ready") return;
                  sendMessage({ text: input });
                  setInput("");
                }}
              >
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a security question..."
                    disabled={status !== "ready"}
                    maxLength={2000}
                    className="flex-1 rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button type="submit" size="icon" disabled={status !== "ready"} aria-label="Send">
                    {status === "streaming" || status === "submitted" ? (
                      <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                    ) : (
                      <PaperPlaneRight className="h-4 w-4" weight="bold" />
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
