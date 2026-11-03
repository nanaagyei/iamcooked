import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { lookupAdvisory, enrichFromGitHub } from "../github-advisory";
import type { OsvVulnerability } from "../osv";

describe("github-advisory", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when GITHUB_TOKEN is unset", async () => {
    const result = await lookupAdvisory("GHSA-xxxx-yyyy-zzzz");
    expect(result).toBeNull();
  });

  it("enriches OSV vulnerability with GitHub data", async () => {
    process.env.GITHUB_TOKEN = "ghp_test_token";
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            securityAdvisory: {
              ghsaId: "GHSA-xxxx-yyyy-zzzz",
              summary: "GitHub summary",
              description: "GitHub description",
              severity: "HIGH",
              publishedAt: "2024-01-01T00:00:00Z",
              references: [{ url: "https://github.com/advisories/GHSA-xxxx-yyyy-zzzz" }],
              vulnerabilities: {
                nodes: [{ firstPatchedVersion: { identifier: "1.2.4" } }],
              },
            },
          },
        }),
        { status: 200 },
      ),
    );

    const vuln: OsvVulnerability = {
      id: "OSV-123",
      summary: "OSV summary",
      affectedVersions: [],
      patchedVersions: ["1.2.3"],
      aliases: ["GHSA-xxxx-yyyy-zzzz"],
      published: "2024-01-01",
      modified: "2024-01-01",
    };

    const enriched = await enrichFromGitHub(vuln);
    expect(enriched.summary).toBe("OSV summary");
    expect(enriched.patchedVersions).toContain("1.2.4");
  });
});
