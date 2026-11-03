import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface MarketingLayoutProps {
  children: ReactNode;
}

export async function MarketingLayout({ children }: MarketingLayoutProps) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar session={session} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
