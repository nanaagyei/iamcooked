"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MessageResponseProps {
  children: string;
  className?: string;
}

export function MessageResponse({ children, className }: MessageResponseProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          a: ({ href, children: linkChildren }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {linkChildren}
            </a>
          ),
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
