import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionContainer } from "./SectionContainer";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { GlowOrbs, GridBackground } from "@/components/motion/Backgrounds";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  /** Word indexes of `title` to paint with the ember gradient. */
  highlight?: number[];
  description?: ReactNode;
  /** Right-hand column (card, illustration, CTA). */
  aside?: ReactNode;
  /** Content under the description (buttons, stats). */
  children?: ReactNode;
  className?: string;
  size?: "default" | "compact";
}

/**
 * Shared hero for marketing pages: parallax grid + drifting ember glow, word-split
 * headline, blur-in copy. Accounts for the floating navbar overlapping the top.
 */
export function PageHero({ eyebrow, title, highlight, description, aside, children, className, size = "default" }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden border-b border-border/60", className)}>
      <Parallax speed={30} className="absolute inset-0">
        <GridBackground />
      </Parallax>
      <GlowOrbs className="opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" aria-hidden />
      <SectionContainer
        className={cn(
          "relative grid gap-10 lg:items-end",
          aside && "lg:grid-cols-[1.25fr_1fr]",
          size === "compact" ? "pb-14 pt-32 sm:pt-36" : "pb-20 pt-36 sm:pb-24 sm:pt-44",
        )}
      >
        <div className="max-w-2xl">
          <Reveal blur={false} distance={10}>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              {eyebrow}
            </p>
          </Reveal>
          <SplitText
            text={title}
            highlight={highlight}
            className={cn(
              "mt-5 font-semibold leading-[1.02] tracking-tighter",
              size === "compact" ? "text-4xl sm:text-5xl" : "text-4xl sm:text-5xl lg:text-6xl",
            )}
          />
          {description && (
            <Reveal delay={0.25}>
              <div className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</div>
            </Reveal>
          )}
          {children && <Reveal delay={0.4}>{children}</Reveal>}
        </div>
        {aside && (
          <Reveal delay={0.3} direction="left">
            {aside}
          </Reveal>
        )}
      </SectionContainer>
    </section>
  );
}
