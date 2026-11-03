"use client";

import { Fragment, useEffect, useRef, type ElementType } from "react";
import { getGsap, prefersReducedMotion } from "./gsap";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** Words (by index) to render in the accent gradient. */
  highlight?: number[];
  delay?: number;
  /** Animate when scrolled into view instead of on mount. */
  onScroll?: boolean;
}

/**
 * Word-by-word masked rise for headlines (GSAP). Words are real text nodes, so the
 * heading stays readable to screen readers and search engines.
 */
export function SplitText({ text, as: Tag = "h1", className, highlight = [], delay = 0, onScroll = false }: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = getGsap();
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: 110, rotate: 4, opacity: 0 });
      const anim = {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.045,
        delay,
      };
      if (onScroll) {
        gsap.to(words, { ...anim, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      } else {
        gsap.to(words, anim);
      }
    }, el);
    return () => ctx.revert();
  }, [text, delay, onScroll]);

  const words = text.split(" ");
  return (
    <Tag ref={ref} className={cn("text-balance", className)}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
            <span
              data-word
              className={cn(
                "inline-block will-change-transform",
                highlight.includes(i) && "bg-gradient-to-br from-primary via-orange-400 to-amber-300 bg-clip-text text-transparent",
              )}
            >
              {w}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
