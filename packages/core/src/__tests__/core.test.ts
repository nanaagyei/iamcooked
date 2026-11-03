import { describe, expect, it, vi } from "vitest";
import {
  OsvClient,
  analyzeDependencies,
  buildFixPlan,
  compareVersions,
  cvss3BaseScore,
  resolveOsvBaseUrl,
  selectFixedVersion,
  type OsvRecord,
} from "../index";

describe("compareVersions", () => {
  it.each([
    ["1.0.0", "1.0.1", -1],
    ["1.10.0", "1.9.9", 1],
    ["v1.2.3", "1.2.3", 0],
    ["1.0.0-rc.1", "1.0.0", -1],
    ["1.0.0-alpha", "1.0.0-beta", -1],
    ["2.0", "2.0.0", 0],
    ["1.0rc1", "1.0", -1], // PEP 440
    ["1.0.post1", "1.0", 1],
    ["1.0.dev0", "1.0a1", -1],
    ["4.17.21", "4.17.4", 1],
  ])("%s vs %s", (a, b, sign) => {
    expect(Math.sign(compareVersions(a, b))).toBe(sign);
  });
});

describe("cvss3BaseScore", () => {
  it.each([
    ["CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", 9.8],
    ["CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H", 10],
    ["CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N", 6.1],
    ["CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N", 5.9],
    ["CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:N", 0],
  ])("%s → %d", (vector, score) => {
    expect(cvss3BaseScore(vector)).toBe(score);
  });

  it("returns null for v4 / garbage", () => {
    expect(cvss3BaseScore("CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N")).toBeNull();
    expect(cvss3BaseScore("7.5")).toBeNull();
  });
});

describe("resolveOsvBaseUrl", () => {
  it("only allows api.osv.dev over https", () => {
    expect(resolveOsvBaseUrl("http://169.254.169.254")).toBe("https://api.osv.dev");
    expect(resolveOsvBaseUrl("https://api.osv.dev/v1")).toBe("https://api.osv.dev");
  });
});

const multiRange: OsvRecord = {
  id: "GHSA-test",
  modified: "2024-01-01T00:00:00Z",
  affected: [
    {
      package: { ecosystem: "npm", name: "next" },
      ranges: [
        { type: "SEMVER", events: [{ introduced: "13.0.0" }, { fixed: "13.5.7" }] },
        { type: "SEMVER", events: [{ introduced: "14.0.0" }, { fixed: "14.2.25" }] },
        { type: "SEMVER", events: [{ introduced: "15.0.0" }, { fixed: "15.2.3" }] },
      ],
    },
  ],
};

describe("selectFixedVersion", () => {
  it("picks the fix on the installed release line", () => {
    expect(selectFixedVersion(multiRange, "NPM", "next", "14.1.0")).toBe("14.2.25");
    expect(selectFixedVersion(multiRange, "NPM", "next", "15.1.0")).toBe("15.2.3");
    expect(selectFixedVersion(multiRange, "NPM", "next", "13.0.1")).toBe("13.5.7");
  });

  it("normalises PyPI names", () => {
    const rec: OsvRecord = {
      id: "PYSEC-1",
      modified: "",
      affected: [{ package: { ecosystem: "PyPI", name: "Pillow" }, ranges: [{ type: "ECOSYSTEM", events: [{ introduced: "0" }, { fixed: "10.0.1" }] }] }],
    };
    expect(selectFixedVersion(rec, "PYPI", "pillow", "9.5.0")).toBe("10.0.1");
  });
});

describe("buildFixPlan", () => {
  it("uses the right package manager", () => {
    expect(buildFixPlan({ ecosystem: "NPM", name: "next", fixedVersion: "14.2.25", direct: true, sourceFile: "app/pnpm-lock.yaml" }).command).toBe("pnpm add next@^14.2.25");
    expect(buildFixPlan({ ecosystem: "PYPI", name: "django", fixedVersion: "4.2.2", direct: true, sourceFile: "uv.lock" }).command).toBe('uv add "django>=4.2.2"');
    expect(buildFixPlan({ ecosystem: "GO", name: "stdlib", fixedVersion: "1.22.5", direct: true }).command).toBe("go mod edit -toolchain=go1.22.5");
    expect(buildFixPlan({ ecosystem: "NPM", name: "x", fixedVersion: null, direct: true, malicious: true }).command).toBe("npm uninstall x");
    expect(buildFixPlan({ ecosystem: "NPM", name: "y", fixedVersion: "2.0.0", direct: false, sourceFile: "package-lock.json" }).instruction).toContain("overrides");
  });
});

describe("analyzeDependencies", () => {
  function mockFetch(): typeof fetch {
    const records: Record<string, OsvRecord> = {
      "GHSA-next": {
        ...multiRange,
        id: "GHSA-next",
        aliases: ["CVE-2025-29927"],
        summary: "Authorization bypass in Next.js middleware",
        database_specific: { severity: "CRITICAL" },
        severity: [{ type: "CVSS_V3", score: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N" }],
      },
      "PYSEC-dup": { id: "PYSEC-dup", aliases: ["CVE-2025-29927"], modified: "" },
      "MAL-2025-1": { id: "MAL-2025-1", summary: "Malicious code in evil-pkg (npm)", modified: "" },
    };
    return vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/v1/querybatch")) {
        const body = JSON.parse(String(init?.body)) as { queries: Array<{ package: { name: string } }> };
        return new Response(
          JSON.stringify({
            results: body.queries.map((q) =>
              q.package.name === "next"
                ? { vulns: [{ id: "PYSEC-dup" }, { id: "GHSA-next" }] }
                : q.package.name === "evil-pkg"
                  ? { vulns: [{ id: "MAL-2025-1" }] }
                  : {},
            ),
          }),
        );
      }
      const id = decodeURIComponent(url.split("/v1/vulns/")[1]!);
      return records[id] ? new Response(JSON.stringify(records[id])) : new Response("", { status: 404 });
    }) as unknown as typeof fetch;
  }

  it("hydrates, de-duplicates aliases, flags malware and builds a verdict", async () => {
    const fetchImpl = mockFetch();
    const result = await analyzeDependencies(
      [
        { ecosystem: "NPM", name: "next", version: "14.1.0", direct: true, sourceFile: "package-lock.json" },
        { ecosystem: "NPM", name: "next", version: "14.1.0", direct: false, sourceFile: "apps/web/package-lock.json" },
        { ecosystem: "NPM", name: "evil-pkg", version: "1.0.0", direct: false, dev: true, sourceFile: "package-lock.json" },
        { ecosystem: "NPM", name: "left-pad", version: "1.3.0", direct: true, sourceFile: "package-lock.json" },
        { ecosystem: "PYPI", name: "fastapi", version: null, direct: true, sourceFile: "requirements.txt" },
      ],
      { osv: new OsvClient({ fetch: fetchImpl }), isKev: (cve) => cve === "CVE-2025-29927" },
    );

    expect(result.findings).toHaveLength(2);
    const next = result.findings.find((f) => f.packageName === "next")!;
    expect(next).toMatchObject({
      id: "GHSA-next",
      cve: "CVE-2025-29927",
      severity: "CRITICAL",
      cvssScore: 9.1,
      fixedVersion: "14.2.25",
      fixCommand: "npm install next@^14.2.25",
      inCisaKev: true,
      direct: true,
      kind: "VULNERABILITY",
    });
    expect(next.sourceFiles).toHaveLength(2);
    const mal = result.findings.find((f) => f.packageName === "evil-pkg")!;
    expect(mal).toMatchObject({ kind: "MALWARE", severity: "CRITICAL" });
    expect(mal.riskScore).toBeGreaterThan(60); // dev-only does not discount malware
    expect(result.counts.MALWARE).toBe(1);
    expect(result.unchecked).toEqual([expect.objectContaining({ name: "fastapi", reason: "UNPINNED" })]);
    expect(result.verdict.tone).not.toBe("safe");
    // 1 batch + 3 hydrations + 1 alias lookup for the severity-less PYSEC record
    expect(vi.mocked(fetchImpl).mock.calls).toHaveLength(5);
  });

  it("returns a clean verdict when nothing matches", async () => {
    const result = await analyzeDependencies(
      [{ ecosystem: "NPM", name: "left-pad", version: "1.3.0", direct: true, sourceFile: "x" }],
      { osv: new OsvClient({ fetch: mockFetch() }) },
    );
    expect(result.findings).toEqual([]);
    expect(result.verdict.label).toBe("Not cooked");
  });
});
