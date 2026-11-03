"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface RevealOptions {
  /** CSS selector for children to reveal. Defaults to direct `[data-reveal]` items. */
  selector?: string;
  /** Pixel offset the elements travel up from. */
  y?: number;
  /** Per-item stagger in seconds. */
  stagger?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Delay before the reveal starts once in view. */
  delay?: number;
  /** Re-run when these values change. */
  deps?: unknown[];
}

/**
 * Reveals matched children once, when the container scrolls into view, using a
 * single IntersectionObserver (no ScrollTrigger, no scrubbing). Purposeful
 * entrance motion that fully respects `prefers-reduced-motion`.
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
) {
  const ref = useRef<T>(null);
  const {
    selector = "[data-reveal]",
    y = 24,
    stagger = 0.08,
    duration = 0.7,
    delay = 0,
    deps = [],
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = Array.from(el.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    if (prefersReduced) {
      gsap.set(targets, { clearProps: "all" });
      return;
    }

    gsap.set(targets, { y, opacity: 0 });

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            played = true;
            gsap.to(targets, {
              y: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "power3.out",
              clearProps: "transform",
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
