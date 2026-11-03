import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { queryBatch } from "../osv";

describe("queryBatch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keys results by name@version", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [
            { vulns: [{ id: "OSV-1", modified: "2024-01-01", published: "2024-01-01" }] },
            { vulns: [] },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await queryBatch([
      { name: "lodash", version: "4.17.20" },
      { name: "lodash", version: "4.17.21" },
    ]);

    expect(result["lodash@4.17.20"]).toHaveLength(1);
    expect(result["lodash@4.17.21"]).toEqual([]);
    expect(result.lodash).toBeUndefined();
  });

  it("throws when OSV batch fails", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response("error", { status: 500 }));

    await expect(queryBatch([{ name: "express", version: "4.18.0" }])).rejects.toThrow(
      "OSV batch query failed",
    );
  });
});
