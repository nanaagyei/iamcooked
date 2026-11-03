"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { getGsap, prefersReducedMotion } from "./gsap";

/**
 * Inertial smooth scrolling (Lenis) synced with GSAP ScrollTrigger so parallax and
 * pinned sections stay frame-accurate. Disabled for reduced-motion users and touch
 * devices (native momentum scrolling is better there).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const { gsap, ScrollTrigger } = getGsap();

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Let modals, menus, the copilot panel and any scrollable box scroll natively.
      prevent: (node) =>
        !!node.closest?.('[role="dialog"], [data-lenis-prevent], [data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto, textarea'),
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchor links should glide too.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -96 });
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
