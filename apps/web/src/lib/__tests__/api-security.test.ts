import { describe, it, expect } from "vitest";
import { escapeHtml, slugParamSchema, copilotChatSchema, aiRemediationSchema } from "@iamcooked/validators";

describe("security validators", () => {
  it("escapes HTML entities", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("validates incident slugs", () => {
    expect(slugParamSchema.safeParse("cve-2024-test").success).toBe(true);
    expect(slugParamSchema.safeParse("Invalid Slug").success).toBe(false);
  });

  it("requires scan access token when scan report id is provided to copilot", () => {
    const missingToken = copilotChatSchema.safeParse({
      messages: [],
      scanReportId: "cltest123",
    });
    expect(missingToken.success).toBe(false);

    const withToken = copilotChatSchema.safeParse({
      messages: [],
      scanReportId: "cltest123",
      scanAccessToken: "token123",
    });
    expect(withToken.success).toBe(true);
  });

  it("accepts remediation requests with scan report id", () => {
    const parsed = aiRemediationSchema.safeParse({
      scanReportId: "cltest123",
      scanAccessToken: "token123",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects copilot messages over limit", () => {
    const parsed = copilotChatSchema.safeParse({
      messages: Array.from({ length: 25 }, (_, i) => ({
        role: "user" as const,
        parts: [{ type: "text", text: `message ${i}` }],
      })),
    });
    expect(parsed.success).toBe(false);
  });
});
