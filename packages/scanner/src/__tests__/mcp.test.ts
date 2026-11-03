import { describe, it, expect } from "vitest";
import { analyzeMcpConfig, isMcpConfig } from "../index";

describe("analyzeMcpConfig", () => {
  const config = `{
    // Cursor allows comments
    "mcpServers": {
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_abcdefghijklmnopqrstuvwxyz0123456789" }
      },
      "pinned": { "command": "npx", "args": ["-y", "mcp-remote@0.1.16", "https://example.com/sse"] },
      "fs": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem@2025.1.14", "~"] },
      "fetch": { "command": "uvx", "args": ["mcp-server-fetch"] },
      "py-pinned": { "command": "uvx", "args": ["--from", "mcp-server-git==0.6.2", "mcp-server-git"] },
      "remote": { "url": "http://mcp.example.com/sse" },
      "safe-env": { "command": "npx", "args": ["-y", "x@1.0.0"], "env": { "API_KEY": "\${env:API_KEY}" } },
      "docker": { "command": "docker", "args": ["run", "-i", "--rm", "-e", "TOKEN", "ghcr.io/acme/mcp"] },
    },
  }`;

  const result = analyzeMcpConfig(config, ".cursor/mcp.json");

  it("detects MCP configs", () => {
    expect(isMcpConfig(config)).toBe(true);
    expect(isMcpConfig(`{"name":"x"}`)).toBe(false);
  });

  it("extracts launched packages", () => {
    const pkgs = Object.fromEntries(result.servers.map((s) => [s.name, s.package]));
    expect(pkgs["github"]).toMatchObject({ ecosystem: "NPM", name: "@modelcontextprotocol/server-github", version: null });
    expect(pkgs["pinned"]).toMatchObject({ name: "mcp-remote", version: "0.1.16" });
    expect(pkgs["fetch"]).toMatchObject({ ecosystem: "PYPI", name: "mcp-server-fetch", version: null });
    expect(pkgs["py-pinned"]).toMatchObject({ ecosystem: "PYPI", name: "mcp-server-git", version: "0.6.2" });
    expect(result.dependencies.find((d) => d.name === "mcp-remote")?.version).toBe("0.1.16");
    expect(result.servers.find((s) => s.name === "docker")?.image).toBe("ghcr.io/acme/mcp");
  });

  it("flags risky patterns", () => {
    const codes = result.issues.map((i) => `${i.server}:${i.code}`);
    expect(codes).toContain("github:HARDCODED_SECRET");
    expect(codes).toContain("github:UNPINNED_PACKAGE");
    expect(codes).toContain("fetch:UNPINNED_PACKAGE");
    expect(codes).toContain("fs:BROAD_FILESYSTEM");
    expect(codes).toContain("remote:INSECURE_TRANSPORT");
    expect(codes).toContain("docker:UNPINNED_IMAGE");
    expect(codes).not.toContain("pinned:UNPINNED_PACKAGE");
    expect(codes).not.toContain("safe-env:HARDCODED_SECRET");
    expect(result.issues[0]!.severity).toBe("HIGH");
  });

  it("never echoes full secrets", () => {
    const text = JSON.stringify(result.issues);
    expect(text).not.toContain("ghp_abcdefghijklmnopqrstuvwxyz0123456789");
  });

  it("supports VS Code `servers` and Claude Code project maps", () => {
    const vscode = analyzeMcpConfig(`{"servers":{"pw":{"type":"stdio","command":"npx","args":["@playwright/mcp@0.0.30"]}}}`);
    expect(vscode.servers[0]!.package).toMatchObject({ name: "@playwright/mcp", version: "0.0.30" });
    const claude = analyzeMcpConfig(`{"projects":{"/Users/me/app":{"mcpServers":{"db":{"command":"npx","args":["-y","pg-mcp"]}}}}}`);
    expect(claude.servers[0]!.name).toBe("app/db");
  });
});
