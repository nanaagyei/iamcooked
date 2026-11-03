"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MessageResponseProps {
  children: string;
  className?: string;
}

function sanitizeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;

  // Allow same-origin relative paths only (reject protocol-relative //evil.com)
  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }

  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return href;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function MessageResponse({ children, className }: MessageResponseProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          a: ({ href, children: linkChildren }) => {
            const safeHref = sanitizeHref(href);
            if (!safeHref) {
              return <span>{linkChildren}</span>;
            }
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {linkChildren}
              </a>
            );
          },
          code: ({ children: codeChildren }) => (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{codeChildren}</code>
          ),
          pre: ({ children: preChildren }) => (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-2 font-mono text-xs">
              {preChildren}
            </pre>
          ),
          p: ({ children: pChildren }) => <p className="mb-2 last:mb-0">{pChildren}</p>,
          ul: ({ children: ulChildren }) => (
            <ul className="mb-2 ml-4 list-disc space-y-1">{ulChildren}</ul>
          ),
          ol: ({ children: olChildren }) => (
            <ol className="mb-2 ml-4 list-decimal space-y-1">{olChildren}</ol>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
