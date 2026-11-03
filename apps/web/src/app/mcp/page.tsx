import type { Metadata } from "next";
import { MarketingLayout, PageHero, SectionContainer } from "@/components/layout";
import { McpChecker } from "@/components/mcp/McpChecker";

export const metadata: Metadata = {
  title: "MCP config checker",
  description:
    "Check your Cursor, Claude, Windsurf or VS Code MCP config for vulnerable packages, hard-coded secrets and risky patterns, right in your browser.",
};

export default function McpPage() {
  return (
    <MarketingLayout overlap>
      <PageHero
        eyebrow="MCP check"
        title="Are your MCP servers cooking you?"
        highlight={[4, 5]}
        description="That snippet you pasted from a README runs code on your machine every time your editor starts. Paste your config and we'll tell you what's vulnerable, what's leaking, and how to fix it."
      />
      <SectionContainer className="py-12 sm:py-16">
        <McpChecker />
      </SectionContainer>
    </MarketingLayout>
  );
}
