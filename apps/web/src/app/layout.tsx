import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AppProviders } from "@/components/providers";
import "./globals.css";

const siteDescription =
  "Your AI agent installed a few hundred packages. Are you cooked? iamcooked checks what's actually risky in your stack and turns CVEs, package compromises, and supply-chain drama into plain-English briefs and fix-it plans.";

export const metadata: Metadata = {
  metadataBase: new URL("https://iamcooked.dev"),
  title: "iamcooked — am I cooked? (a dependency vibe check)",
  description: siteDescription,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "iamcooked",
    title: "iamcooked — am I cooked? (a dependency vibe check)",
    description: siteDescription,
    url: "https://iamcooked.dev",
    images: [
      {
        url: "/images/og.png",
        width: 1024,
        height: 683,
        alt: "iamcooked — a calm vibe check for your dependency stack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iamcooked — am I cooked? (a dependency vibe check)",
    description: siteDescription,
    images: ["/images/og.png"],
  },
};

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem("iamcooked-theme");
    const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  } catch {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-background font-sans text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
