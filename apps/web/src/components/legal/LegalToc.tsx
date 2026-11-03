"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky table of contents with scroll-spy. */
export function LegalToc({ items }: { items: Array<{ id: string; title: string }> }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">On this page</p>
      <ol className="relative space-y-0.5 border-l border-border">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l py-1.5 pl-4 transition-colors",
                active === item.id ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="mr-2 font-mono text-[11px] text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
