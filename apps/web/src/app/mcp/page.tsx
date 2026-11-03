import type { Metadata } from "next";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { McpChecker } from "@/components/mcp/McpChecker";

export const metadata: Metadata = {
  title: "MCP config checker",
  description:
    "Check your Cursor, Claude, Windsurf or VS Code MCP config for vulnerable packages, hard-coded secrets and risky patterns, right in your browser.",
};

export default function McpPage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border">
        <PageBackdrop variant="scan" seed="iamcooked-mcp" />
        <SectionContainer className="relative py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              MCP check
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl">
              Are your MCP servers cooking you?
            </h1>
            <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-foreground">
              That snippet you pasted from a README runs code on your machine every time your editor starts. Paste
              your config and we&apos;ll tell you what&apos;s vulnerable, what&apos;s leaking, and how to fix it.
            </p>
          </div>
        </SectionContainer>
      </section>
      <SectionContainer className="py-12 sm:py-16">
        <McpChecker />
      </SectionContainer>
    </MarketingLayout>
  );
}
