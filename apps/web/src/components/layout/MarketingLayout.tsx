import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

interface MarketingLayoutProps {
  children: ReactNode;
  /** Let the first section slide under the floating navbar (for full-bleed heroes). */
  overlap?: boolean;
}

export async function MarketingLayout({ children, overlap = false }: MarketingLayoutProps) {
  const session = await auth();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SmoothScroll />
      <ScrollProgress />
      <Navbar session={session} />
      <main id="main-content" className={overlap ? "-mt-[4.25rem] flex-1" : "flex-1 pt-4"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
